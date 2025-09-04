'use client';

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

type Props = {
  clinics: Clinic[];
  onHover?: (id: string) => void;
  onLeave?: () => void;
};

export default function Results({ clinics, onHover, onLeave }: Props) {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-10">
      {/* LIST ONLY (map is handled by ClinicMap now) */}
      <div className="bg-white text-black rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Nearest clinics</h2>

        {clinics.length === 0 && (
          <div className="text-gray-600">No clinics found.</div>
        )}

        <div className="space-y-4">
          {clinics.map((clinic, i) => {
            const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              clinic.address || `${clinic.coords[0]},${clinic.coords[1]}`
            )}`;

            return (
              <div
                key={`${clinic.id}-${i}`}
                className="bg-white text-black border rounded-md p-4 hover:bg-gray-50 transition"
                onMouseEnter={() => onHover?.(clinic.id)}
                onMouseLeave={() => onLeave?.()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">
                      {clinic.name}
                      {typeof clinic.miles === "number" &&
                        isFinite(clinic.miles) && (
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

                    <div className="text-xs text-gray-700 mt-1">
                      {clinic.address}
                    </div>

                    {clinic.services?.length > 0 && (
                      <div className="mt-1 text-xs">
                        <span className="font-medium">Services:</span>{" "}
                        {clinic.services.join(", ")}
                      </div>
                    )}

                    {clinic.summary && (
                      <p className="text-xs text-gray-800 mt-2 line-clamp-2">
                        {clinic.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/finder/${clinic.slug ?? clinic.id}`}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      View details →
                    </Link>
                    <a
                      href={gmaps}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      Directions
                    </a>
                    {clinic.url && (
                      <a
                        href={clinic.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
