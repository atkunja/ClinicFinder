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
    <section className="mx-auto mt-10 max-w-6xl px-0 pb-10">
      <div className="app-surface overflow-hidden p-6 text-slate-900 shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Nearest clinics</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sorted by distance</p>
        </div>

        {clinics.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-5 py-6 text-sm text-slate-600">
            No clinics matched your filters yet.
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
              <li>Disable <strong>Verified only</strong> to view every option.</li>
              <li>Expand the search radius or enter a nearby landmark.</li>
              <li>Need hands-on help? Email <span className="font-semibold">hello@bibifoundation.org</span> and we will guide you.</li>
            </ul>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-200/40"
                onMouseEnter={() => onHover?.(clinic.id)}
                onMouseLeave={() => onLeave?.()}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
                      <span>{clinic.name}</span>
                      {clinic.miles !== undefined && isFinite(clinic.miles) && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {clinic.miles.toFixed(clinic.miles < 10 ? 1 : 0)} mi
                        </span>
                      )}
                      {clinic.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          <span aria-hidden>✔</span>
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{clinic.address}</div>
                    {!!clinic.services?.length && (
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Services:</span> {clinic.services?.join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/finder/${clinic.slug ?? clinic.id}`}
                      className="rounded-full border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      View details →
                    </Link>
                    {clinic.url && (
                      <a
                        href={clinic.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {clinic.summary && (
                  <p className="mt-3 text-sm text-slate-600">{clinic.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
