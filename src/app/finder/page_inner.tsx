"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Results from "./results";
import "leaflet/dist/leaflet.css";

// Map component (your existing one)
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

export default function FinderPage() {
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
    const ref = collection(db, "clinics");
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
      (err) => console.error("onSnapshot error:", err)
    );
    return () => unsub();
  }, []);

  // Geocode suggestions
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
    return () => { ignore = true; };
  }, [debouncedQ]);

  // Close dropdown when clicking outside
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
    if (!userCoords) return [];
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
    <section className="relative min-h-screen px-4 pb-20 pt-20 text-white sm:pb-24 sm:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-semibold">Clinic Finder</h1>
              <p className="text-sm text-white/75">
                Enter an address or share your location to surface free and low-cost clinics. Every result includes our latest notes on eligibility, languages, and transportation support.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
              Updated weekly by volunteers
            </div>
          </header>

          <div className="app-surface relative overflow-hidden p-5 text-slate-900 shadow-xl shadow-slate-900/10 sm:p-6">
            <div className="absolute -top-24 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 left-8 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/20 to-transparent blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
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
                  className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 shadow-inner shadow-white/40 outline-none transition focus:ring-2 focus:ring-emerald-400"
                  placeholder="Enter address, landmark, or city"
                />
                {openDrop && (
                  <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-2xl border border-slate-200/70 bg-white shadow-xl">
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
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-emerald-50"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Example: "Detroit Mercy Dental" or "48202"
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 lg:w-2/5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={useMyLocation}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:from-emerald-300 hover:to-cyan-300"
                  >
                    Use my location
                  </button>
                  <select
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    aria-label="Radius"
                  >
                    {[10, 25, 50, 100].map((r) => (
                      <option key={r} value={r}>
                        {r} mi
                      </option>
                    ))}
                  </select>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={() => setOnlyVerified((v) => !v)}
                      className="h-3.5 w-3.5 accent-emerald-500"
                    />
                    Verified only
                  </label>
                </div>
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-700">
                  Tip: If you are searching for someone else, add their city or zip and keep the phone number ready in case the clinic needs verbal consent.
                </div>
              </div>
            </div>

            {/* Service chips */}
            <div className="relative mt-6 flex gap-2 overflow-x-auto pb-1">
              {serviceChips.map((chip) => {
                const activeChip = serviceFilter.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    onClick={() => setServiceFilter(activeChip ? "" : chip)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeChip
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20"
                        : "border border-slate-200/80 bg-white text-slate-600 shadow-sm hover:border-emerald-200 hover:text-slate-900"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
              {serviceFilter && (
                <button
                  onClick={() => setServiceFilter("")}
                  className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-500"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Map + List only after location is set */}
          {userCoords ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="app-surface flex h-full flex-col overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/50 bg-slate-50/70 px-5 py-4 text-slate-900 sm:px-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Map overview</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {visibleClinics.length > 0
                        ? `Showing ${visibleClinics.length} ${visibleClinics.length === 1 ? "clinic" : "clinics"} within ${radiusMiles} miles.`
                        : `No clinics within ${radiusMiles} miles yet—try widening the radius.`}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                    {address ? "Searching: " + address : "Using current location"}
                  </div>
                </div>
                <div className="relative flex-1 min-h-[360px] p-3 sm:min-h-[440px] sm:p-4">
                  <div className="h-full w-full overflow-hidden rounded-[26px] border border-slate-200/50 shadow-inner shadow-slate-900/5">
                    <ClinicMap
                      clinics={visibleClinics as any}
                      userCoords={userCoords}
                      radiusMiles={radiusMiles}
                      selectedClinicId={selectedClinicId}
                    />
                  </div>
                </div>
              </div>

              <Results
                clinics={visibleClinics as any}
                onHover={(id) => setSelectedClinicId(id)}
                onLeave={() => setSelectedClinicId(null)}
                className="lg:max-h-[560px]"
              />
            </div>
          ) : (
            <div className="app-surface px-8 py-12 text-center text-slate-600">
              <h2 className="text-lg font-semibold text-slate-900">Let’s find the right clinic</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter an address above or press “Use my location” to unlock nearby options.
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-400">
                No appointment requests are sent until you choose a clinic.
              </p>
            </div>
          )}
        </div>
      </section>
  );
}
