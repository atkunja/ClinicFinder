// src/app/finder/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ClinicDoc } from "@/types/clinic";

type Coords = [number, number];

interface Clinic {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[] | string; // legacy can be string like '["Medical"]'
  coords: Coords | [string, string] | { lat: number | string; lng: number | string } | unknown; // legacy formats
  summary?: string;
  slug?: string;
}

const SS_KEY = "FINDER_STATE_V1";
const withinUSLat = (n: number) => n > 24 && n < 50;
const withinUSLng = (n: number) => n < -66 && n > -125;

function normalizeCoords(anyCoords: unknown): Coords | null {
  const a = Array.isArray(anyCoords) ? anyCoords : [];
  let lat = Number(a[0]);
  let lng = Number(a[1]);

  // handle {lat, lng} objects too
  if (!Array.isArray(anyCoords) && anyCoords && typeof anyCoords === "object") {
    const obj = anyCoords as Record<string, unknown>;
    lat = Number(obj.lat ?? obj[0]);
    lng = Number(obj.lng ?? obj[1]);
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  // fix swapped order
  const looksLatLng = withinUSLat(lat) && withinUSLng(lng);
  const looksLngLat = withinUSLat(lng) && withinUSLng(lat);
  if (!looksLatLng && looksLngLat) [lat, lng] = [lng, lat];

  if (!withinUSLat(lat) || !withinUSLng(lng)) return null;
  return [lat, lng];
}

function normalizeServices(s: Clinic["services"]): string[] {
  if (Array.isArray(s)) return s;
  if (!s) return [];
  const raw = String(s).trim();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {}
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.replace(/^"+|"+$/g, "").trim())
    .filter(Boolean);
}

export default function ClinicDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;

      try {
        let data: Clinic | null = null;

        // 1) try by document id
        const byDoc = await getDoc(doc(db, "clinics", String(id)));
        if (byDoc.exists()) {
          data = { id: byDoc.id, ...(byDoc.data() as Omit<Clinic, 'id'>) };
        } else {
          // 2) try by slug, then by legacy 'id' field
          const coll = collection(db, "clinics");

          const bySlug = await getDocs(
            query(coll, where("slug", "==", String(id)), limit(1))
          );
          if (!bySlug.empty) {
            const d = bySlug.docs[0];
            data = { id: d.id, ...(d.data() as Omit<Clinic, 'id'>) };
          } else {
            const byIdField = await getDocs(
              query(coll, where("id", "==", String(id)), limit(1))
            );
            if (!byIdField.empty) {
              const d = byIdField.docs[0];
              data = { id: d.id, ...(d.data() as Omit<Clinic, 'id'>) };
            }
          }
        }

        if (!data) {
          setErr("Clinic not found.");
        } else {
          setClinic(data);
        }
      } catch (error) {
        console.error("Error fetching clinic:", error);
        setErr("Error loading clinic. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Init Leaflet map once clinic is loaded
  useEffect(() => {
    if (!clinic) return;

    const coords = normalizeCoords(clinic.coords);
    if (!coords) return;

    // kill previous map if navigating quickly
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("clinic-map", { zoomControl: true }).setView(coords, 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.circleMarker(coords, {
      radius: 8,
      weight: 2,
      color: "#111827",
      fillColor: "#22c55e",
      fillOpacity: 0.9,
    })
      .addTo(map)
      .bindPopup(clinic.name)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [clinic]);

  const services = useMemo(() => normalizeServices(clinic?.services ?? []), [clinic]);

  function backToFinder() {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      const s = raw ? JSON.parse(raw) : {};
      s.scrollY = s.scrollY || 0;
      sessionStorage.setItem(SS_KEY, JSON.stringify(s));
    } catch {}
    router.push("/finder");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Loading clinic…
      </div>
    );
  }

  if (err || !clinic) {
    return (
      <div className="min-h-screen bg-white text-black p-8">
        <p className="font-bold">{err || "Clinic not found."}</p>
        <button
          onClick={backToFinder}
          className="text-emerald-700 underline mt-2"
        >
          ← Back to Clinic Finder
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={backToFinder}
          className="text-emerald-700 hover:underline mb-4"
        >
          ← Back to Clinic Finder
        </button>

        <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>
        <p className="mb-1">
          <strong>Address:</strong> {clinic.address}
        </p>
        <p className="mb-3">
          <strong>Services:</strong>{" "}
          {services.length ? services.join(", ") : "—"}
        </p>
        {clinic.url && (
          <p className="mb-4">
            <a
              href={clinic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Visit Website
            </a>
          </p>
        )}

        {/* Map container with explicit light background */}
        <div
          id="clinic-map"
          className="w-full h-[360px] rounded border bg-white"
        />

        {clinic.summary ? (
          <div className="p-4 rounded bg-emerald-50 border border-emerald-200 mt-4">
            <h2 className="font-semibold text-emerald-800 mb-2">
              About this clinic
            </h2>
            <p className="whitespace-pre-line">{clinic.summary}</p>
          </div>
        ) : (
          <div className="p-4 rounded bg-gray-100 border text-black/80 mt-4">
            No summary yet. Visit the website above for more details.
          </div>
        )}
      </div>
    </div>
  );
}
