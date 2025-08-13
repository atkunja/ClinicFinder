// src/app/finder/Results.tsx
"use client";

import Link from "next/link";
import type { Clinic } from "@/lib/clinics";

type Props = {
  clinics: Clinic[]; // already filtered & sorted list near the search
};

export default function Results({ clinics }: Props) {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-10">
      {/* Map container */}
      <div className="rounded-lg border bg-white">
        <div
          id="finder-map"
          className="w-full h-[520px] bg-white rounded-lg"
          // Your map initialization code should target #finder-map
        />
      </div>

      {/* Results list */}
      <div className="mt-6 bg-white text-black rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Nearest clinics</h2>

        {clinics.length === 0 && (
          <div className="text-gray-600">No clinics found.</div>
        )}

        <div className="space-y-4">
          {clinics.map((clinic, i) => (
            <div key={`${clinic.id}-${i}`} className="bg-white text-black border rounded-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold">{clinic.name}</div>
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
                    href={`/finder/${clinic.slug ?? clinic.id}`} // ← robust link (slug OR id)
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
