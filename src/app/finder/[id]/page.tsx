// src/app/finder/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/i18n/LangProvider";

type Coords = [number, number];

type ClinicDoc = {
  id?: string; // legacy field
  name: string;
  address: string;
  url?: string;
  services?: string[] | string;
  coords: Coords | [string, string] | { lat: number | string; lng: number | string } | unknown;
  summary?: string;
  summary_es?: string;
  slug?: string;
  verified?: boolean;
  languages?: string[] | string;
  eligibility?: string[] | string;
  hours?: Record<string, string> | string;
  phone?: string;
};

const withinUSLat = (n: number) => n > 24 && n < 50;
const withinUSLng = (n: number) => n < -66 && n > -125;

function normalizeCoords(anyCoords: unknown): Coords | null {
  if (Array.isArray(anyCoords)) {
    let lat = Number(anyCoords[0]);
    let lng = Number(anyCoords[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const looksLatLng = withinUSLat(lat) && withinUSLng(lng);
      const looksLngLat = withinUSLat(lng) && withinUSLng(lat);
      if (!looksLatLng && looksLngLat) [lat, lng] = [lng, lat];
      if (withinUSLat(lat) && withinUSLng(lng)) return [lat, lng];
    }
    return null;
  }
  if (anyCoords && typeof anyCoords === "object") {
    const o = anyCoords as Record<string, unknown>;
    let lat = Number(o.lat ?? o[0 as any]);
    let lng = Number(o.lng ?? o[1 as any]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const looksLatLng = withinUSLat(lat) && withinUSLng(lng);
      const looksLngLat = withinUSLat(lng) && withinUSLng(lat);
      if (!looksLatLng && looksLngLat) [lat, lng] = [lng, lat];
      if (withinUSLat(lat) && withinUSLng(lng)) return [lat, lng];
    }
  }
  return null;
}

function normalizeArrayish(x?: string[] | string): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x.map(String).map((s) => s.trim()).filter(Boolean);
  const raw = String(x).trim();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {}
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.replace(/^"+|"+$/g, "").trim())
    .filter(Boolean);
}

function parseHours(h?: Record<string, string> | string) {
  if (!h) return null;
  if (typeof h === "string") {
    try {
      const obj = JSON.parse(h);
      if (obj && typeof obj === "object") return obj as Record<string, string>;
    } catch {}
    return null;
  }
  return h;
}

export default function ClinicDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLang();

  const [clinic, setClinic] = useState<(ClinicDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  // Fetch by doc id, then by slug, then by legacy id field
  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        let data: (ClinicDoc & { id: string }) | null = null;

        const byDoc = await getDoc(doc(db, "clinics", String(id)));
        if (byDoc.exists()) {
          data = { id: byDoc.id, ...(byDoc.data() as ClinicDoc) };
        } else {
          const coll = collection(db, "clinics");
          const bySlug = await getDocs(query(coll, where("slug", "==", String(id)), limit(1)));
          if (!bySlug.empty) {
            const d = bySlug.docs[0];
            data = { id: d.id, ...(d.data() as ClinicDoc) };
          } else {
            const byIdField = await getDocs(query(coll, where("id", "==", String(id)), limit(1)));
            if (!byIdField.empty) {
              const d = byIdField.docs[0];
              data = { id: d.id, ...(d.data() as ClinicDoc) };
            }
          }
        }

        if (!data) {
          setErr(t.clinicDetail.clinicNotFound);
        } else {
          setClinic(data);
        }
      } catch (e) {
        console.error(e);
        setErr(t.clinicDetail.errorLoading);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  // Init Leaflet map once we have coords
  useEffect(() => {
    if (!clinic) return;
    const coords = normalizeCoords(clinic.coords);
    if (!coords) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("clinic-map", { zoomControl: true }).setView(coords, 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.circleMarker(coords, {
      radius: 9,
      weight: 2,
      color: "#0ea5e9",
      fillColor: "#0ea5e9",
      fillOpacity: 0.9,
    })
      .addTo(map)
      .bindPopup(clinic.name)
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [clinic]);

  const services = useMemo(() => normalizeArrayish(clinic?.services), [clinic]);
  const langs    = useMemo(() => normalizeArrayish(clinic?.languages), [clinic]);
  const elig     = useMemo(() => normalizeArrayish(clinic?.eligibility), [clinic]);
  const hours    = useMemo(() => parseHours(clinic?.hours), [clinic]);

  const gmaps =
    clinic
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          clinic.address || ""
        )}`
      : "#";

  // ---------- UI ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 grid place-items-center">
        <div className="rounded-2xl border bg-white px-6 py-5 shadow-sm">
          {t.clinicDetail.loadingClinic}
        </div>
      </div>
    );
  }

  if (err || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 grid place-items-center p-6">
        <div className="max-w-xl w-full">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="font-semibold">{err || t.clinicDetail.clinicNotFound}</p>
            <button
              onClick={() => router.push("/finder")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-emerald-700 hover:bg-emerald-50"
            >
              &larr; {t.clinicDetail.backToFinder}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
        {/* Soft gradient header */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 400px at 70% -10%, rgba(16,185,129,0.18), rgba(16,185,129,0) 60%)",
            }}
          />
          <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:pt-12 sm:pb-8">
            <button
              onClick={() => router.push("/finder")}
              className="text-emerald-700 hover:underline"
            >
              &larr; {t.clinicDetail.backToFinder}
            </button>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                {clinic.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                {clinic.verified && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                    &#10004; {t.clinicDetail.verified}
                  </span>
                )}
                {services.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
                    {services[0]}
                    {services.length > 1 ? ` +${services.length - 1}` : ""}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2 max-w-3xl text-slate-600">{clinic.address}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              {clinic.url && (
                <a
                  href={clinic.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800"
                >
                  {t.clinicDetail.visitWebsite}
                </a>
              )}
              <a
                href={gmaps}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                {t.clinicDetail.getDirections}
              </a>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 pb-12 grid gap-5 lg:grid-cols-3">
          {/* Left: Map + Summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Map */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div id="clinic-map" className="h-[360px] w-full rounded-2xl" />
            </div>

            {/* Summary */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">{t.clinicDetail.aboutThisClinic}</h2>
              {clinic.summary ? (
                <p className="whitespace-pre-line leading-7 text-slate-700">
                  {lang === "es" ? (clinic.summary_es || clinic.summary) : clinic.summary}
                </p>
              ) : (
                <p className="text-slate-600">
                  {t.clinicDetail.noSummary}
                </p>
              )}
            </div>
          </div>

          {/* Right: Info cards */}
          <aside className="space-y-5">
            {/* Contact */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">{t.clinicDetail.contact}</h3>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div>{clinic.address}</div>
                {clinic.phone && (
                  <a
                    className="text-emerald-700 underline"
                    href={`tel:${clinic.phone}`}
                  >
                    {clinic.phone}
                  </a>
                )}
                {clinic.url && (
                  <a
                    className="block text-emerald-700 underline"
                    target="_blank"
                    rel="noreferrer"
                    href={clinic.url}
                  >
                    {new URL(clinic.url).host}
                  </a>
                )}
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">{t.clinicDetail.services}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {langs.length > 0 && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">{t.clinicDetail.languages}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {langs.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility */}
            {elig.length > 0 && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">{t.clinicDetail.eligibility}</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                  {elig.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hours */}
            {hours && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">{t.clinicDetail.hours}</h3>
                <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-slate-700">
                  {[
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                  ].map((d) => (
                    <div key={d} className="flex justify-between gap-3 col-span-2">
                      <span className="w-16 text-slate-500">{d}</span>
                      <span className="flex-1 text-right">
                        {(hours as Record<string, string>)[d] ?? "\u2014"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
  );
}
