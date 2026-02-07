"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";

type Coords = [number, number];

export type Clinic = {
  id: string;
  name: string;
  address: string;
  url?: string;
  services?: string[];
  coords: Coords;
  summary?: string;
  summary_es?: string;
  slug?: string;
  verified?: boolean;
  miles?: number;
  languages?: string[];
  eligibility?: string[];
};

export default function Results({
  clinics,
  onHover,
  onLeave,
  className = "",
}: {
  clinics: Clinic[];
  onHover?: (id: string) => void;
  onLeave?: () => void;
  className?: string;
}) {
  const { t, lang } = useLang();

  return (
    <section className={`flex h-full flex-col ${className}`}>
      <div className="app-surface flex h-full flex-col overflow-hidden text-slate-900 shadow-xl shadow-slate-900/10">
        <div className="border-b border-slate-200/50 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{t.results.clinicMatches}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              {clinics.length} {clinics.length === 1 ? t.results.result : t.results.results}
            </span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-slate-400">{t.results.sortedByDistance}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {clinics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/90 px-5 py-6 text-sm text-slate-600">
              <h3 className="text-base font-semibold text-slate-800">{t.results.noMatchesTitle}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
                <li>
                  {t.results.toggleOff} <span className="font-semibold text-slate-700">{t.results.verifiedOnly}</span> {t.results.toExploreEveryOption}
                </li>
                <li>{t.results.tryBroaderRadius}</li>
                <li>
                  {t.results.needHelp} <span className="font-semibold text-slate-700">hello@zbimpact.org</span> {t.results.navigatorsWillGuide}
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {clinics.map((clinic) => {
                const directionsTarget = clinic.address || `${clinic.coords[0]},${clinic.coords[1]}`;
                return (
                  <article
                    key={clinic.id}
                    className="group rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-200/30 focus-within:-translate-y-0.5 focus-within:border-emerald-200 focus-within:shadow-lg focus-within:shadow-emerald-200/30"
                    onMouseEnter={() => onHover?.(clinic.id)}
                    onMouseLeave={() => onLeave?.()}
                  >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{clinic.name}</h3>
                        {clinic.miles !== undefined && isFinite(clinic.miles) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {(clinic.miles as number).toFixed(clinic.miles < 10 ? 1 : 0)} {t.results.mi}
                          </span>
                        )}
                        {clinic.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            <span aria-hidden>&#10004;</span> {t.results.verified}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{clinic.address}</div>
                      {!!clinic.services?.length && (
                        <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
                          {clinic.services.slice(0, 4).map((service) => (
                            <span
                              key={service}
                              className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600"
                            >
                              {service}
                            </span>
                          ))}
                          {clinic.services.length > 4 && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                              +{clinic.services.length - 4} {t.results.more}
                            </span>
                          )}
                        </div>
                      )}
                      {!!clinic.languages?.length && (
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">{t.results.languages}&nbsp;</span>
                          {clinic.languages.join(", ")}
                        </div>
                      )}
                      {!!clinic.eligibility?.length && (
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">{t.results.eligibility}&nbsp;</span>
                          {clinic.eligibility.join(", ")}
                        </div>
                      )}
                      {clinic.summary && (
                        <p className="text-sm text-slate-600">{lang === "es" ? (clinic.summary_es || clinic.summary) : clinic.summary}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch gap-2 text-sm font-semibold sm:min-w-[160px]">
                      <Link
                        href={`/finder/${clinic.slug ?? clinic.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        onFocus={() => onHover?.(clinic.id)}
                        onBlur={() => onLeave?.()}
                      >
                        {t.results.viewDetails} <span aria-hidden>&rarr;</span>
                      </Link>
                      {clinic.url && (
                        <a
                          href={clinic.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                          onFocus={() => onHover?.(clinic.id)}
                          onBlur={() => onLeave?.()}
                        >
                          {t.results.clinicWebsite}
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          directionsTarget
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        onFocus={() => onHover?.(clinic.id)}
                        onBlur={() => onLeave?.()}
                      >
                        {t.results.directions}
                      </a>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
