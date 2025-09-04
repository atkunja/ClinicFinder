'use client';

import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Results from './results';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';

type Coords = [number, number];

function haversineKm(a: Coords, b: Coords) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
  // miles added at runtime
};

const ClinicMap = dynamic(() => import('@/components/ClinicMap'), { ssr: false });

const SERVICE_OPTIONS = [
  { key: 'medical',     label: 'Medical',     match: ['medical', 'clinic', 'primary'] },
  { key: 'dental',      label: 'Dental',      match: ['dental', 'tooth'] },
  { key: 'pediatrics',  label: 'Pediatrics',  match: ['pediatric', 'child'] },
  { key: 'mental',      label: 'Mental',      match: ['mental', 'behavioral'] },
  { key: 'pharmacy',    label: 'Pharmacy',    match: ['pharmacy', 'pharm'] },
  { key: 'vision',      label: 'Vision',      match: ['vision', 'eye', 'optom'] },
] as const;

export default function FinderPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // location / UI state
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState('');
  const [radiusMiles, setRadiusMiles] = useState<number>(10);

  // services
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  // list ↔ map highlight
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // subscribe to Firestore
  useEffect(() => {
    const ref = collection(db, 'clinics');
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
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Couldn't get your location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function geocodeAddress() {
    const q = address.trim();
    if (!q) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        alert('Address not found. Try a full street address or city + ZIP.');
        return;
      }
      const { lat, lon } = data[0];
      setUserCoords([parseFloat(lat), parseFloat(lon)]);
    } catch (e) {
      console.error(e);
      alert('Geocoding failed. Please try again.');
    }
  }

  function toggleService(key: string) {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // helper: does clinic match selected service buckets?
  function clinicMatchesServices(c: Clinic) {
    if (selectedServices.size === 0) return true;
    const hay = `${c.name} ${(c.services || []).join(' ')}`.toLowerCase();
    for (const opt of SERVICE_OPTIONS) {
      if (!selectedServices.has(opt.key)) continue;
      if (opt.match.some(w => hay.includes(w))) return true;
    }
    return false;
  }

  const visibleClinics = useMemo(() => {
    // if user hasn't set location yet, hide list (per your requirement)
    if (!userCoords) return [] as (Clinic & { miles: number })[];

    return clinics
      .filter((c) => clinicMatchesServices(c))
      .filter((c) => (onlyVerified ? c.verified : true))
      .map((c) => {
        const distKm = haversineKm(userCoords, c.coords);
        return { ...c, miles: distKm * 0.621371 };
      })
      .filter((c) => c.miles <= radiusMiles) // radius gate
      .sort((a, b) => a.miles - b.miles);
  }, [clinics, userCoords, onlyVerified, selectedServices, radiusMiles]);

  return (
    <div className="min-h-screen">
      {/* Controls */}
      <div className="max-w-5xl mx-auto px-4 mt-4 mb-4 grid gap-3 md:grid-cols-12">
        {/* Address search */}
        <div className="md:col-span-5 flex gap-2">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter address or ZIP (e.g., 48104)…"
          />
          <button
            onClick={geocodeAddress}
            className="px-3 py-2 border rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Search
          </button>
        </div>

        {/* Use my location */}
        <div className="md:col-span-2">
          <button
            onClick={useMyLocation}
            className="w-full px-3 py-2 border rounded"
          >
            Use my location
          </button>
        </div>

        {/* Radius */}
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="text-sm whitespace-nowrap">Radius</label>
          <select
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
            className="border rounded px-2 py-2"
          >
            {[5,10,15,25,50].map(mi => <option key={mi} value={mi}>{mi} mi</option>)}
          </select>
        </div>

        {/* Verified */}
        <div className="md:col-span-3 flex items-center gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={() => setOnlyVerified(!onlyVerified)}
            />
            Show verified only
          </label>
        </div>

        {/* Service chips */}
        <div className="md:col-span-12 flex flex-wrap gap-2 pt-1">
          {SERVICE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => toggleService(opt.key)}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                selectedServices.has(opt.key)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt when no location set */}
      {!userCoords && (
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <div className="rounded-lg border px-4 py-3 text-sm">
            Enter an address/ZIP above or click <strong>Use my location</strong> to see nearby clinics.
          </div>
        </div>
      )}

      {/* Map */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <ClinicMap
          clinics={visibleClinics as any}
          userCoords={userCoords}
          radiusMiles={radiusMiles}
          selectedClinicId={selectedClinicId}
        />
      </div>

      {/* List (hover → highlight marker) */}
      <Results
        clinics={visibleClinics as any}
        onHover={(id) => setSelectedClinicId(id)}
        onLeave={() => setSelectedClinicId(null)}
      />
    </div>
  );
}
