"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import Results from "./results";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

type Coords = [number, number];

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
};

export default function FinderPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [userCoords, setUserCoords] = useState<Coords | null>(null);

  // ✅ subscribe to Firestore like before
  useEffect(() => {
    const ref = collection(db, "clinics");
    const unsub = onSnapshot(ref, (snap) => {
      const rows: Clinic[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setClinics(rows);
    });
    return () => unsub();
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Couldn't get your location")
    );
  }

  const visibleClinics = clinics
    .filter((c) =>
      serviceFilter
        ? c.services?.some((s) =>
            s.toLowerCase().includes(serviceFilter.toLowerCase())
          )
        : true
    )
    .filter((c) => (onlyVerified ? c.verified : true))
    .map((c) => {
      const distKm = userCoords ? haversineKm(userCoords, c.coords) : Infinity;
      return { ...c, miles: isFinite(distKm) ? distKm * 0.621 : Infinity };
    })
    .sort((a, b) => (a.miles as number) - (b.miles as number));

  return (
    <div className="min-h-screen">
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
      </div>

      <Results clinics={visibleClinics as any} />
    </div>
  );
}
