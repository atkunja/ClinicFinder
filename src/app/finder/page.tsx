"use client";

import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import Results from "./results";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Coords = [number, number];

function toNumber(n: any): number | null {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return Number.isFinite(v) ? v : null;
}
function asCoords(c: any): Coords | null {
  if (!Array.isArray(c) || c.length < 2) return null;
  const lat = toNumber(c[0]);
  const lng = toNumber(c[1]);
  if (lat == null || lng == null) return null;
  return [lat, lng];
}
function haversineKm(a: Coords, b: Coords) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 =
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - (s1 + s2)));
  return R * c;
}

export type Clinic = {
  id: string;
  name: string;
  address: string;
  url?: string;
  services: string[];
  coords: Coords;
  summary?: string;
  slug?: string;
  verified?: boolean;
  languages?: string[];
  eligibility?: string[];
  miles?: number;
};

export default function FinderPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false); // OFF by default
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(50);

  // Live subscribe to Firestore /clinics (lowercase)
  useEffect(() => {
    const ref = collection(db, "clinics");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const rows: Clinic[] = snap.docs
          .map((d) => {
            const raw: any = { id: d.id, ...(d.data() as any) };
            const coords = asCoords(raw.coords);
            if (!coords) return null; // skip broken docs so they don't crash map
            return { ...raw, coords } as Clinic;
          })
          .filter(Boolean) as Clinic[];
        setClinics(rows);
      },
      (err) => {
        alert(`Firestore error: ${err.message}`);
      }
    );
    return () => unsub();
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Couldn't get your location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const visibleClinics = useMemo(() => {
    const filtered = clinics
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
    return filtered;
  }, [clinics, serviceFilter, onlyVerified, userCoords, radiusMiles]);

  return (
    <div className="min-h-screen">
      {/* keep your existing toolbar UI — just wire to these states */}
      {/* Example minimal controls; feel free to keep your chips/buttons */}
      <div className="max-w-5xl mx-auto px-4 mt-4 mb-4 flex flex-col md:flex-row gap-3">
        <input
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="w-full md:w-72 border rounded px-3 py-2"
          placeholder="Filter by service (e.g., dental, pediatrics)"
        />
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={() => setOnlyVerified(!onlyVerified)}
          />
          Show verified only
        </label>
        <button
          onClick={useMyLocation}
          className="px-3 py-2 border rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Use my location
        </button>
        <select
          value={radiusMiles}
          onChange={(e) => setRadiusMiles(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[10, 25, 50, 100].map((r) => (
            <option key={r} value={r}>
              {r} mi
            </option>
          ))}
        </select>
      </div>

      <Results clinics={visibleClinics as any} userCoords={userCoords} radiusMiles={radiusMiles} />
    </div>
  );
}
