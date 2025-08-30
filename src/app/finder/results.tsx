"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Coords = [number, number];

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
  miles?: number;
};

type Props = { clinics: Clinic[] };

export default function Results({ clinics }: Props) {
  const mapRef = useRef<any>(null);
  const groupRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = (await import("leaflet")).default;

      // ensure marker icons load on Vercel
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }

      const el = document.getElementById("finder-map");
      if (!mounted || !el) return;

      const map = L.map(el, { center: [42.2808, -83.743], zoom: 11, scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      groupRef.current = group;

      requestAnimationFrame(() => map.invalidateSize());
      const onResize = () => map.invalidateSize();
      window.addEventListener("resize", onResize);
      (map as any).__onResize = onResize;
    })();

    return () => {
      const map = mapRef.current as any;
      if (map && map.__onResize) window.removeEventListener("resize", map.__onResize);
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
      groupRef.current = null;
    };
  }, []);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current as any;
      const group = groupRef.current as any;
      if (!map || !group) return;

      group.clearLayers();
      const bounds = L.latLngBounds([]);

      clinics.forEach((c) => {
        const [lat, lng] = c.coords || [];
        if (typeof lat !== "number" || typeof lng !== "number") return;
        const marker = L.marker([lat, lng]).bindPopup(
          `<strong>${escapeHtml(c.name)}</strong><br/>${escapeHtml(c.address || "")}`
        );
        marker.addTo(group);
        bounds.extend([lat, lng]);
      });

      if (clinics.length > 0) {
        map.fitBounds(bounds.pad(0.2));
        setTimeout(() => map.invalidateSize(), 0);
      }
    })();
  }, [clinics]);

  return (
    <section className="max-w-5xl mx-auto px-4 pb-10">
      <div className="rounded-lg border bg-white">
        <div id="finder-map" className="w-full h-[520px]" aria-label="Map with nearby clinics" />
      </div>

      <div className="mt-6 bg-white text-black rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Nearest clinics</h2>

        {clinics.length === 0 && <div className="text-gray-600">No clinics found.</div>}

        <div className="space-y-4">
          {clinics.map((clinic, i) => (
            <div key={`${clinic.id}-${i}`} className="bg-white text-black border rounded-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">
                    {clinic.name}
                    {typeof clinic.miles === "number" && isFinite(clinic.miles) && (
                      <span className="ml-2 text-xs text-gray-600">{clinic.miles.toFixed(1)} mi</span>
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
                      <span className="font-medium">Services:</span> {clinic.services.join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link href={`/finder/${clinic.slug ?? clinic.id}`} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">
                    View details →
                  </Link>
                  {clinic.url && (
                    <a href={clinic.url} target="_blank" className="text-xs px-2 py-1 border rounded hover:bg-gray-50">
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
