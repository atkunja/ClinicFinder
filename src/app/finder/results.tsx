"use client";

import Link from "next/link";

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
  miles?: number;
};

export default function Results({
  clinics,
  onHover,
  onLeave,
}: {
  clinics: Clinic[];
  onHover?: (id: string) => void;
  onLeave?: () => void;
}) {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-10">
      <div className="bg-white text-black rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Nearest clinics</h2>

        {clinics.length === 0 && (
          <div className="text-gray-700 text-sm">
            No clinics found.
            <ul className="mt-2 list-disc ml-5">
              <li>Uncheck <b>Show verified only</b> if it’s on.</li>
              <li>Click <b>Use my location</b> or increase the <b>Radius</b>.</li>
              <li>Make sure docs are in <code>clinics</code> (lowercase) and <code>coords</code> are numbers.</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white text-black border rounded-md p-4"
              onMouseEnter={() => onHover?.(clinic.id)}
              onMouseLeave={() => onLeave?.()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">
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
                  {!!clinic.services?.length && (
                    <div className="mt-1 text-xs">
                      <span className="font-medium">Services:</span>{" "}
                      {clinic.services?.join(", ")}
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
                <p className="text-xs text-gray-800 mt-2 line-clamp-2">
                  {clinic.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
