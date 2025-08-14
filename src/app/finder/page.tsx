// src/app/finder/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Coords = [number, number];

interface Clinic {
  id: string;          // url id/slug to navigate with
  name: string;
  address: string;
  url: string;
  services: string[];  // canonicalized to legend keys
  coords: Coords;      // [lat, lng]
  summary?: string;
  slug?: string;
  nameLower?: string;
}

interface ClinicWithDist extends Clinic {
  miles: number;
  driveMinutes: number;
}

const SERVICE_COLORS: Record<string, string> = {
  Medical: "#ef4444",   // red
  Dental: "#3b82f6",    // blue
  Pediatrics: "#a855f7",// purple
  Vision: "#f59e0b",    // amber
  Mental: "#14b8a6",    // teal
  Pharmacy: "#22c55e",  // green
  Other: "#6b7280",     // gray
};

const SS_KEY = "FINDER_STATE_V1";

/* ------------------------- helpers ------------------------- */

function milesBetween([lat1, lon1]: Coords, [lat2, lon2]: Coords) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const estDriveMinutes = (miles: number) => Math.round(miles / 0.5 / 3);

async function geocode(address: string): Promise<Coords | null> {
  if (!address?.trim()) return null;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`,
    { headers: { Accept: "application/json" } }
  );
  const js = await res.json();
  if (!Array.isArray(js) || !js[0]) return null;
  return [parseFloat(js[0].lat), parseFloat(js[0].lon)];
}

const withinUSLat = (n: number) => n > 24 && n < 50;
const withinUSLng = (n: number) => n < -66 && n > -125;

function normalizeCoords(anyCoords: unknown): Coords | null {
  const a = Array.isArray(anyCoords) ? anyCoords : [];
  let lat = Number(a[0]);
  let lng = Number(a[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  // fix [lng, lat] if needed
  const looksLatLng = withinUSLat(lat) && withinUSLng(lng);
  const looksLngLat = withinUSLat(lng) && withinUSLng(lat);
  if (!looksLatLng && looksLngLat) [lat, lng] = [lng, lat];
  if (!withinUSLat(lat) || !withinUSLng(lng)) return null;
  return [lat, lng];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Canonicalize a single service label to match legend keys */
function canonicalService(label: string): string {
  const s = String(label || "")
    .replace(/[\[\]"]/g, "")
    .trim()
    .toLowerCase();

  if (!s) return "Other";
  if (/(medical|primary|family|adult|internal medicine)/i.test(s)) return "Medical";
  if (/(dental|dentist|oral)/i.test(s)) return "Dental";
  if (/(pediatric)/i.test(s)) return "Pediatrics";
  if (/(vision|eye|optometry|optometrist)/i.test(s)) return "Vision";
  if (/(mental|behavioral|counsel|psychi|therapy)/i.test(s)) return "Mental";
  if (/(pharm|prescription|medication)/i.test(s)) return "Pharmacy";
  return "Other";
}

/** Normalize the services field from Firestore to a clean array of canonical labels */
function normalizeServices(input: unknown): string[] {
  let arr: string[] = [];

  if (Array.isArray(input)) {
    arr = input.map((x) => String(x));
  } else if (typeof input === "string") {
    const t = input.trim();
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) arr = parsed.map((x) => String(x));
      else arr = t.split(",").map((s) => s.trim());
    } catch {
      arr = t.split(",").map((s) => s.trim());
    }
  }

  if (arr.length === 0) return ["Other"];
  const canon = arr.map(canonicalService);
  return canon.filter((v, i) => canon.indexOf(v) === i); // unique, keep order
}

/** Get the color for a clinic based on its (canonicalized) services */
function serviceColor(services: string[]) {
  const first = services?.[0] || "Other";
  return SERVICE_COLORS[first] || SERVICE_COLORS.Other;
}

/* ------------------------- component ------------------------- */

// We load Leaflet dynamically; keep a module ref in state
type LeafletModule = typeof import("leaflet");

export default function ClinicFinderPage() {
  const router = useRouter();

  const [Lmod, setLmod] = useState<LeafletModule | null>(null);
  const [allClinics, setAllClinics] = useState<Clinic[]>([]);
  const [results, setResults] = useState<ClinicWithDist[]>([]);
  const [address, setAddress] = useState("");
  const [service, setService] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [showAll, setShowAll] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Dynamically import Leaflet on mount (client only) and init map
  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      setLmod(leaflet);

      if (!mapDivRef.current || mapRef.current) return;

      mapRef.current = leaflet.map(mapDivRef.current).setView([42.38, -83.1], 9);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(mapRef.current);

      markersRef.current = leaflet.layerGroup().addTo(mapRef.current);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const c: Coords = [pos.coords.latitude, pos.coords.longitude];
            setUserCoords(c);
            mapRef.current!.setView(c, 11);
          },
          () => {}
        );
      }
    })();
  }, []);

  // LIVE clinics listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clinics"), (snap) => {
      const arr: Clinic[] = [];
      snap.forEach((d) => {
        const raw = d.data() as Record<string, unknown>;
        const coords = normalizeCoords(raw.coords);
        const navId =
          (typeof raw.id === 'string' ? raw.id : null) || 
          (typeof raw.slug === 'string' ? raw.slug : null) || 
          (typeof raw.name === 'string' ? slugify(raw.name) : d.id) || d.id;

        const services = normalizeServices(raw.services);

        arr.push({
          id: String(navId),
          name: String(raw.name || ''),
          address: String(raw.address || ''),
          url: String(raw.url || ''),
          services, // canonicalized
          coords: (coords || [0, 0]) as Coords,
          summary: typeof raw.summary === 'string' ? raw.summary : undefined,
          slug: typeof raw.slug === 'string' ? raw.slug : undefined,
          nameLower: typeof raw.nameLower === 'string' ? raw.nameLower : undefined,
        });
      });
      setAllClinics(arr);
    });
    return () => unsub();
  }, []);

  // restore last state (and re-run search)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.address) setAddress(s.address);
      if (s.service) setService(s.service);
      if (s.userCoords && Array.isArray(s.userCoords)) {
        setUserCoords(s.userCoords as Coords);
      }
      if (typeof s.scrollY === "number") {
        setTimeout(() => window.scrollTo({ top: s.scrollY }), 0);
      }
    } catch {}
  }, []);

  // once clinics arrive AND we already know user coords, recompute
  useEffect(() => {
    if (userCoords && allClinics.length) {
      runSearch(userCoords, service, address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClinics]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    allClinics.forEach((c) => c.services?.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set).sort()];
  }, [allClinics]);

  function clearMarkers() {
    markersRef.current?.clearLayers?.();
  }

  function addUserMarker(c: Coords | null) {
    if (!Lmod || !mapRef.current) return;
    userMarkerRef.current?.remove?.();
    userMarkerRef.current = null;
    if (c) {
      userMarkerRef.current = Lmod
        .circleMarker(c, {
          radius: 8,
          weight: 2,
          color: "#111827",
          fillColor: "#fbbf24", // amber
          fillOpacity: 0.9,
        })
        .addTo(mapRef.current)
        .bindTooltip("Your location");
    }
  }

  function drawClinicMarkers(list: ClinicWithDist[]) {
    if (!Lmod || !mapRef.current || !markersRef.current) return;
    clearMarkers();

    const bounds = Lmod.latLngBounds([]);

    list.forEach((c) => {
      const coords = normalizeCoords(c.coords) || null;
      if (!coords) return;

      const col = serviceColor(c.services);
      Lmod.circleMarker(coords, {
        radius: 7,
        weight: 2,
        color: col,
        fillColor: col,
        fillOpacity: 0.85,
      })
        .bindTooltip(c.name, { direction: "top" })
        .on("click", () => goToClinic(c.id))
        .addTo(markersRef.current as L.LayerGroup);

      bounds.extend(coords);
    });

    if (userCoords) bounds.extend(userCoords);
    if (bounds.isValid()) mapRef.current!.fitBounds(bounds.pad(0.1));
  }

  async function onSearch() {
    setLoading(true);
    try {
      const c = await geocode(address.trim());
      setUserCoords(c);
      if (!c) {
        setResults([]);
        clearMarkers();
        addUserMarker(null);
        return;
      }
      runSearch(c, service, address.trim());
    } finally {
      setLoading(false);
    }
  }

  function runSearch(center: Coords, svc: string, addrForSave: string) {
    const enriched: ClinicWithDist[] = allClinics
      .filter((c) => normalizeCoords(c.coords)) // keep only mappable
      .filter((c) => (svc === "All" ? true : c.services?.includes(svc)))
      .map((c) => {
        const miles = milesBetween(center, normalizeCoords(c.coords)!);
        return { ...c, miles, driveMinutes: estDriveMinutes(miles) };
      })
      .sort((a, b) => a.miles - b.miles);

    setResults(enriched);
    addUserMarker(center);
    drawClinicMarkers(enriched);

    try {
      const s = {
        address: addrForSave,
        service: svc,
        userCoords: center,
        scrollY: 0,
      };
      sessionStorage.setItem(SS_KEY, JSON.stringify(s));
    } catch {}
  }

  function goToClinic(id: string) {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      const s = raw ? JSON.parse(raw) : {};
      s.scrollY = window.scrollY;
      sessionStorage.setItem(SS_KEY, JSON.stringify(s));
    } catch {}
    router.push(`/finder/${encodeURIComponent(id)}`);
  }

  const top = showAll ? results : results.slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <div className="bg-emerald-700 text-white py-10 text-center">
        <h1 className="text-3xl font-bold">Find Free & Low‑Cost Clinics</h1>
        <p className="opacity-90 mt-2">Enter an address and optionally filter by service.</p>
      </div>

      <div className="max-w-4xl mx-auto -mt-8 bg-white rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="flex-1 border rounded px-3 py-3 text-black placeholder:text-gray-500"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <select
            className="w-full md:w-56 border rounded px-3 py-3 text-black"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            onClick={onSearch}
            disabled={loading}
            className="w-full md:w-48 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded px-4 py-3"
          >
            {loading ? "Searching…" : "Search Clinics"}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center mt-4">
          <span className="text-sm font-medium text-black/70">Legend:</span>
          {Object.entries(SERVICE_COLORS).map(([label, col]) => (
            <span key={label} className="inline-flex items-center gap-2 text-sm text-black/80">
              <span
                className="inline-block rounded-full"
                style={{ width: 10, height: 10, background: col }}
              />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-2 text-sm text-black/80">
            <span
              className="inline-block rounded-full ring-2 ring-black"
              style={{ width: 10, height: 10, background: "#fbbf24" }}
            />
            Your location
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6">
        <div className="rounded-lg border bg-white overflow-hidden">
          <div ref={mapDivRef} className="w-full h-[420px] bg-white" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-2">
        {results.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-black mb-3">Nearest clinics</h2>
            <ul className="bg-white text-black divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {top.map((c) => {
                const color = serviceColor(c.services);
                return (
                  <li key={c.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 inline-block rounded-full"
                        style={{ width: 10, height: 10, background: color }}
                        title={c.services?.[0] || "Other"}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{c.name}</h3>
                        <div className="text-sm text-black/80">{c.address}</div>
                                                <div className="text-sm text-black/80 mt-1">
                          {c.miles.toFixed(1)} miles • ~{c.driveMinutes} min drive
                        </div>

                        <div className="mt-2 flex gap-4">
                          <button
                            onClick={() => goToClinic(c.id)}
                            className="text-emerald-700 hover:underline font-medium"
                          >
                            View details →
                          </button>
                          <a
                            className="text-blue-700 hover:underline"
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {results.length > 3 && !showAll && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAll(true)}
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  See more clinics
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

