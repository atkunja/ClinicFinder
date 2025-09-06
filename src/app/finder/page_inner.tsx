// src/app/finder/page_inner.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Results from "./results";
import "leaflet/dist/leaflet.css";
import RequireAuth from "@/components/RequireAuth";

// lazy map
const ClinicMap = dynamic(() => import("@/components/ClinicMap"), { ssr: false });

type Coords = [number, number];
export type Clinic = {
  id: string;
  name: string;
  address: string;
  url?: string;
  services?: string[];
  coords: Coords;
  summary?: string;
  slug?: string;
  verified?: boolean;
  languages?: string[];
  eligibility?: string[];
  miles?: number;
};

function toNum(n: any): number | null {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return Number.isFinite(v) ? v : null;
}
function asCoords(c: any): Coords | null {
  if (!Array.isArray(c) || c.length < 2) return null;
  const lat = toNum(c[0]);
  const lng = toNum(c[1]);
  return lat == null || lng == null ? null : [lat, lng];
}
function haversineKm(a: Coords, b: Coords) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lat1, lon1] = a, [lat2, lon2] = b;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
  return R * c;
}

// tiny debounce hook
function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Suggest = { label: string; lat: number; lon: number };

export default function FinderInner() {
  // 🔐 gate whole finder behind auth
  return (
    <RequireAuth>
      <FinderUI />
    </RequireAuth>
  );
}

function FinderUI() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // Address search state
  const [address, setAddress] = useState("");
  const [openDrop, setOpenDrop] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggest[]>([]);
  const debouncedQ = useDebounced(address, 300);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Firestore subscribe
  useEffect(() => {
    const ref = collection(db, "clinics"); // lowercase collection name
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const rows: Clinic[] = snap.docs
          .map((d) => {
            const raw: any = { id: d.id, ...(d.data() as any) };
            const coords = asCoords(raw.coords);
            if (!coords) return null;
            return { ...raw, coords } as Clinic;
          })
          .filter(Boolean) as Clinic[];
        setClinics(rows);
      },
      (err) => {
        console.error("clinics onSnapshot error:", err);
        alert(`Firestore error: ${err.message}`);
      }
    );
    return () => unsub();
  }, []);

  // Geocode suggestions via your /api/geocode proxy
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!debouncedQ || debouncedQ.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        setLoadingDrop(true);
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(debouncedQ)}`);
        const items: Suggest[] = res.ok ? await res.json() : [];
        if (!ignore) setSuggestions(items);
      } finally {
        if (!ignore) setLoadingDrop(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [debouncedQ]);

  // Close dropdown click-outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpenDrop(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(c);
        setRadiusMiles((r) => (r < 25 ? 25 : r));
      },
      () => alert("Couldn't get your location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function pickSuggestion(s: Suggest) {
    setAddress(s.label);
    setOpenDrop(false);
    setUserCoords([s.lat, s.lon]);
  }

  const visibleClinics = useMemo(() => {
    return clinics
      .filter((c) =>
        serviceFilter
          ? (c.services || []).some((s) =>
              s?.toLowerCase?.().includes(serviceFilter.toLowerCase())
            )
          : true
      )
      .filter((c) => (onlyVerified ? !!c.verified : true))
      .map((c) => {
        const distKm = userCoords ? haversineKm(userCoords, c.coords) : Infinity;
        const miles = Number.isFinite(distKm) ? distKm * 0.621 : Infinity;
        return { ...c, miles };
      })
      .filter((c) => (userCoords ? (c.miles ?? Infinity) <= radiusMiles : true))
      .sort((a, b) => (a.miles as number) - (b.miles as number));
  }, [clinics, serviceFilter, onlyVerified, userCoords, radiusMiles]);

  const serviceChips = ["Medical", "Dental", "Mental", "Pediatrics", "Pharmacy", "Vision"];

  return (
    <div className="min-h-screen bg-[rgb(247,249,251)] text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Controls */}
        <div className="rounded-2xl bg-white border shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Address input + dropdown */}
            <div className="relative w-full lg:max-w-xl" ref={dropdownRef}>
              <label className="sr-only">Search by address</label>
              <input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setOpenDrop(true);
                }}
                onFocus={() => setOpenDrop(true)}
                className="w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter address or city"
              />
              {openDrop && (
                <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow-lg">
                  {loadingDrop && (
                    <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
                  )}
                  {!loadingDrop && suggestions.length === 0 && debouncedQ.length >= 3 && (
                    <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
                  )}
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.lat}${s.lon}${i}`}
                      onClick={() => pickSuggestion(s)}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50"
                    >
                      <div className="text-sm">{s.label}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={useMyLocation}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700"
              >
                Use my location
              </button>
              <select
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
                className="rounded-xl border px-3 py-2"
                aria-label="Radius"
              >
                {[10, 25, 50, 100].map((r) => (
                  <option key={r} value={r}>
                    {r} mi
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 text-sm ml-1">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={() => setOnlyVerified((v) => !v)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Show verified only
              </label>
            </div>
          </div>

          {/* Service chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {serviceChips.map((chip) => {
              const active = serviceFilter.toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  onClick={() => setServiceFilter(active ? "" : chip)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
            {serviceFilter && (
              <button
                onClick={() => setServiceFilter("")}
                className="rounded-full border px-3 py-1.5 text-sm bg-white hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
          <div className="p-2 sm:p-3">
            <ClinicMap
              clinics={visibleClinics as any}
              userCoords={userCoords}
              radiusMiles={radiusMiles}
              selectedClinicId={selectedClinicId}
            />
          </div>
        </div>

        {/* List */}
        <div className="mt-5">
          <Results
            clinics={visibleClinics as any}
            onHover={(id) => setSelectedClinicId(id)}
            onLeave={() => setSelectedClinicId(null)}
          />
        </div>
      </div>
    </div>
  );
}
