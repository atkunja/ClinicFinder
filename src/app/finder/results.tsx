"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type { Clinic } from "./page";

type Props = {
  clinics: Clinic[];
  userCoords: [number, number] | null;
  radiusMiles: number;
};

export default function Results({ clinics, userCoords, radiusMiles }: Props) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // init Leaflet map once
  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = (await import("leaflet")).default;

      // fix default marker icons in Next/Vercel
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // wipe any old instance (hot reload)
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }

      const el = mapElRef.current;
      if (!mounted || !el) return;

      const map = L.map(el, {
        center: [42.2808, -83.743], // AA fallback
        zoom: 11,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = group;

      // keep tiles correct after container resizes
      requestAnimationFrame(() => map.invalidateSize());
      const onResize = () => map.invalidateSize();
      window.addEventListener("resize", onResize);
      (map as any).__onResize = onResize;
    })();

    return () => {
      const map = mapRef.current as any;
      if (map?.__onResize) window.removeEventListener("resize", map.__onResize);
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
      layerRef.current = null;
    };
  }, []);

  // draw markers when data changes
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current as any;
      const group = layerRef.current as any;
      if (!map || !group) return;

      group.clearLayers();
      const bounds = L.latLngBounds([]);

      // user location marker + radius
      if (userCoords) {
        const [ulat, ulng] = userCoords;
        const home = L.marker([ulat, ulng], {
          title: "Your location",
        }).addTo(group);
        home.bindPopup("<b>Your location</b>");

        const meters = radiusMiles * 1609.34;
        L.circle([ulat, ulng], { radius: meters, color: "#0ea5e9" }).addTo(group);
        bounds.extend([ulat, ulng]);
      }

      // clinic markers
      clinics.forEach((c) => {
        const [lat, lng] = c.coords || [];
        if (typeof lat !== "number" || typeof lng !== "number") return;
        const detailsHref = `/finder/${encodeURIComponent(c.slug ?? c.id)}`;
        const html = `
          <div style="min-width:180px">
            <div style="font-weight:600">${escapeHtml(c.name)}</div>
            <div style="font-size:12px;color:#374151">${escapeHtml(c.address || "")}</div>
            <div style="margin-top:6px">
              <a href="${detailsHref}" style="font-size:12px;text-decoration:underline">View details →</a>
            </div>
          </div>`;
        L.marker([lat, lng]).bindPopup(html).addTo(group);
        bounds.extend([lat, lng]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
        setTimeout(() => map.invalidateSize(), 0);
      }
    })();
  }, [clinics, userCoords, radiusMiles]);

  return (
    <section className="max-w-5xl mx-auto">
      {/* MAP */}
      <div className="mb-6 rounded-lg bg-white border shadow">
        <div ref={mapElRef} id="finder-map" className="w-full h-[420px]" aria-label="Map" />
      </div>

      {/* LIST */}
      <div className="rounded-lg bg-white border shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Nearest clinics</h2>

        {clinics.length === 0 && (
          <div className="text-gray-700 text-sm">
            No clinics found.
            <ul className="mt-2 list-disc ml-5">
              <li>Uncheck <b>Show verified only</b> if it’s on.</li>
              <li>Increase the <b>Radius</b> or click <b>Use my location</b>.</li>
              <li>Ensure docs are in <code>clinics</code> (lowercase) and <code>coords</code> are numbers.</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white border rounded-md p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {clinic.name}
                    {clinic.miles !== undefined && isFinite(clinic.miles) && (
                      <span className="ml-2 text-xs text-gray-600">
                        {clinic.miles.toFixed(1)} mi
                      </span>
                    )}
                    {clinic.verified && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">{clinic.address}</div>
                  {clinic.services?.length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="font-medium">Services:</span>{" "}
                      {clinic.services.join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/finder/${clinic.slug ?? clinic.id}`}
                    className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                  >
                    View details →
                  </Link>
                  {clinic.url && (
                    <a
                      href={clinic.url}
                      target="_blank"
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>

              {clinic.summary && (
                <p className="text-xs text-gray-800 mt-2 line-clamp-2">{clinic.summary}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return m;
    }
  });
}
