'use client';

import dynamic from 'next/dynamic';
import L, { LatLngExpression } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer     = dynamic(() => import('react-leaflet').then(m => m.TileLayer),     { ssr: false });
const Marker        = dynamic(() => import('react-leaflet').then(m => m.Marker),        { ssr: false });
const Popup         = dynamic(() => import('react-leaflet').then(m => m.Popup),         { ssr: false });
const Circle        = dynamic(() => import('react-leaflet').then(m => m.Circle),        { ssr: false });

type Coords = [number, number];

export type MapClinic = {
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

function serviceBucket(services: string[], name?: string) {
  const bag = `${name ?? ''} ${services.join(' ')}`.toLowerCase();
  if (bag.includes('dental')) return 'dental';
  if (bag.includes('mental') || bag.includes('behavioral')) return 'mental';
  if (bag.includes('pediatric') || bag.includes('child')) return 'pediatrics';
  if (bag.includes('pharmacy')) return 'pharmacy';
  if (bag.includes('vision') || bag.includes('eye') || bag.includes('optom')) return 'vision';
  return 'medical';
}

function colorFor(bucket: string) {
  switch (bucket) {
    case 'dental':     return '#f59e0b';
    case 'mental':     return '#14b8a6';
    case 'pediatrics': return '#22c55e';
    case 'pharmacy':   return '#8b5cf6';
    case 'vision':     return '#ef4444';
    default:           return '#0ea5e9'; // medical
  }
}

function dotIcon(color: string, size = 18, ring = true) {
  const html =
    `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      ${ring ? 'border:2px solid #fff;' : ''}
      box-shadow:0 0 0 2px rgba(0,0,0,.15);
    "></div>`;
  return L.divIcon({
    html,
    className: 'clinic-dot',
    iconSize: [size, size],
    iconAnchor: [size / 2, size], // bottom center
    popupAnchor: [0, -Math.max(16, size - 2)],
  });
}

function houseIcon() {
  const html =
    `<div style="
      font-size:28px; line-height:28px;
      transform: translateY(-4px);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
    ">🏠</div>`;
  return L.divIcon({
    html,
    className: 'user-house',
    iconSize: [28, 28],
    iconAnchor: [14, 26],
    popupAnchor: [0, -24],
  });
}

function FitToAll({ pts }: { pts: LatLngExpression[] }) {
  const map = useMap() as any;
  const first = useRef(true);

  useEffect(() => {
    if (!pts.length) return;
    const bounds = L.latLngBounds(pts as any).pad(0.2);
    if (first.current) {
      first.current = false;
      map.fitBounds(bounds, { animate: false });
    } else {
      map.flyToBounds(bounds, { duration: 0.5 });
    }
  }, [pts, map]);

  return null;
}

export default function ClinicMap({
  clinics,
  userCoords,
  radiusMiles,
  selectedClinicId,
}: {
  clinics: MapClinic[];
  userCoords: Coords | null;
  radiusMiles: number;            // draw a circle if userCoords present
  selectedClinicId?: string|null; // highlight a marker
}) {
  const center: LatLngExpression = [42.3, -83.04];

  const iconFor = useMemo(() => {
    const baseCache = new Map<string, L.DivIcon>();
    const bigCache  = new Map<string, L.DivIcon>();
    return (c: MapClinic, big = false) => {
      const bucket = serviceBucket(c.services ?? [], c.name);
      const cache = big ? bigCache : baseCache;
      if (!cache.has(bucket)) {
        const color = colorFor(bucket);
        cache.set(bucket, dotIcon(color, big ? 24 : 18, !big));
      }
      return cache.get(bucket)!;
    };
  }, []);

  const allPoints: LatLngExpression[] = useMemo(() => {
    const pts = clinics.map(c => [c.coords[0], c.coords[1]] as LatLngExpression);
    if (userCoords) pts.push([userCoords[0], userCoords[1]]);
    return pts;
  }, [clinics, userCoords]);

  return (
    <div className="relative rounded-2xl overflow-hidden border">
      <MapContainer center={center} zoom={10} style={{ height: 420, width: '100%' }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        <FitToAll pts={allPoints} />

        {userCoords && (
          <>
            <Marker position={[userCoords[0], userCoords[1]]} icon={houseIcon()}>
              <Popup>Your location</Popup>
            </Marker>
            {!!radiusMiles && (
              <Circle
                center={[userCoords[0], userCoords[1]]}
                radius={radiusMiles * 1609.34} // miles → meters
                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08, weight: 1 }}
              />
            )}
          </>
        )}

        {clinics.map(c => {
          const isSelected = selectedClinicId && c.id === selectedClinicId;
          const icon = iconFor(c, !!isSelected);
          const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.address || `${c.coords[0]},${c.coords[1]}`)}`;
          return (
            <Marker key={c.id} position={[c.coords[0], c.coords[1]]} icon={icon}>
              <Popup>
                <div style={{ maxWidth: 240 }}>
                  <div style={{ fontWeight: 600 }}>
                    {c.name} {c.verified ? '✅' : ''}
                  </div>
                  {Number.isFinite(c.miles) && c.miles !== Infinity && (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {(c.miles as number).toFixed((c.miles as number) < 10 ? 1 : 0)} mi away
                    </div>
                  )}
                  <div style={{ fontSize: 12, marginTop: 6 }}>{c.address}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {!!c.url && (
                      <a className="underline" target="_blank" rel="noreferrer" href={c.url}>
                        Website
                      </a>
                    )}
                    <a className="underline" target="_blank" rel="noreferrer" href={gmaps}>
                      Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
