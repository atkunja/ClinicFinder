'use client';

import dynamic from 'next/dynamic';
import L, {
  LatLngExpression,
  LeafletEventHandlerFnMap,
  LeafletMouseEvent,
  Popup as LeafletPopup,
} from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useLang } from '@/i18n/LangProvider';

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
    default:           return '#0ea5e9';
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
    iconAnchor: [size / 2, size],
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
  radiusMiles: number;
  selectedClinicId?: string | null;
}) {
  const center: LatLngExpression = [42.3, -83.04];
  const { t } = useLang();

  // marker icon cache
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

  // ----- Hover-sticky popup infra (typed & per marker) -----
  const popupEls = useRef<Map<string, HTMLElement>>(new Map());
  const closeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const popupHandlers = useRef<Map<string, { enter: () => void; leave: () => void }>>(new Map());

  const clearClose = (id: string) => {
    const t = closeTimers.current.get(id);
    if (t) {
      clearTimeout(t);
      closeTimers.current.delete(id);
    }
  };

  const scheduleClose = (id: string, marker: L.Marker) => {
    clearClose(id);
    const timer = setTimeout(() => marker.closePopup(), 250);
    closeTimers.current.set(id, timer);
  };

  const onMarkerMouseOver = (id: string, e: LeafletMouseEvent) => {
    clearClose(id);
    (e.target as L.Marker).openPopup();
  };

  const onMarkerMouseOut = (id: string, e: LeafletMouseEvent) => {
    const marker = e.target as L.Marker;
    const toNode = (e.originalEvent as MouseEvent | undefined)?.relatedTarget as (Node | null);
    const popupEl = popupEls.current.get(id);
    if (popupEl && toNode && popupEl.contains(toNode)) return; // moving into popup
    scheduleClose(id, marker);
  };

  const onPopupOpen = (id: string, popup: LeafletPopup, marker: L.Marker) => {
    const el = popup.getElement();
    if (!el) return;

    popupEls.current.set(id, el);

    const enter = () => clearClose(id);
    const leave = () => scheduleClose(id, marker);

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    popupHandlers.current.set(id, { enter, leave });
  };

  const onPopupClose = (id: string, popup: LeafletPopup) => {
    const el = popupEls.current.get(id);
    const handlers = popupHandlers.current.get(id);
    if (el && handlers) {
      el.removeEventListener('mouseenter', handlers.enter);
      el.removeEventListener('mouseleave', handlers.leave);
    }
    popupEls.current.delete(id);
    popupHandlers.current.delete(id);
    clearClose(id);
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={10} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        <FitToAll pts={allPoints} />

        {userCoords && (
          <>
            <Marker position={[userCoords[0], userCoords[1]]} icon={houseIcon()}>
              <Popup>{t.results.yourLocation}</Popup>
            </Marker>
            {!!radiusMiles && (
              <Circle
                center={[userCoords[0], userCoords[1]]}
                radius={radiusMiles * 1609.34}
                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08, weight: 1 }}
              />
            )}
          </>
        )}

        {clinics.map((c) => {
          const isSelected = selectedClinicId && c.id === selectedClinicId;
          const icon = iconFor(c, !!isSelected);
          const detailsPath = `/finder/${encodeURIComponent(c.slug ?? c.id)}`;
          const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            c.address || `${c.coords[0]},${c.coords[1]}`
          )}`;

          // Build a typed Leaflet handler map so TS is happy
          const handlers: LeafletEventHandlerFnMap = {
            mouseover: (e) => onMarkerMouseOver(c.id, e as LeafletMouseEvent),
            mouseout:  (e) => onMarkerMouseOut(c.id,  e as LeafletMouseEvent),
            popupopen: (e) => onPopupOpen(c.id, (e as any).popup as LeafletPopup, (e.target as L.Marker)),
            popupclose:(e) => onPopupClose(c.id, (e as any).popup as LeafletPopup),
          };

          return (
            <Marker
              key={c.id}
              position={[c.coords[0], c.coords[1]]}
              icon={icon}
              eventHandlers={handlers}
            >
              <Popup className="clinic-popup">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                      {Number.isFinite(c.miles) && c.miles !== Infinity && (
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {(c.miles as number).toFixed((c.miles as number) < 10 ? 1 : 0)} {t.results.milesAway}
                        </div>
                      )}
                    </div>
                    {c.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        <span aria-hidden>&#10004;</span> {t.results.verified}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">{c.address}</div>
                  {!!c.services?.length && (
                    <div className="flex flex-wrap gap-1.5">
                      {c.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-600"
                        >
                          {service}
                        </span>
                      ))}
                      {c.services.length > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          +{c.services.length - 3} {t.results.more}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <a
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-white transition hover:bg-slate-800"
                      href={detailsPath}
                    >
                      {t.results.viewDetails} <span aria-hidden>&rarr;</span>
                    </a>
                    {!!c.url && (
                      <a
                        className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                        target="_blank"
                        rel="noreferrer"
                        href={c.url}
                      >
                        {t.results.website}
                      </a>
                    )}
                    <a
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                      target="_blank"
                      rel="noreferrer"
                      href={gmaps}
                    >
                      {t.results.directions}
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
