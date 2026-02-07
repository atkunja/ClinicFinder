// src/app/what-to-bring/page_inner.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        &check;
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function WhatToBringInner() {
  const { t } = useLang();

  return (
    <main className="relative min-h-screen px-4 pb-20 pt-20 text-white sm:pb-24 sm:pt-24">
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes floaty {
                0% { transform: translateY(0px) }
                50% { transform: translateY(12px) }
                100% { transform: translateY(0px) }
              }
              @keyframes shimmer {
                0% { background-position: 0% 50% }
                100% { background-position: 200% 50% }
              }
            `,
          }}
        />

        <section className="relative mx-auto max-w-5xl text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(800px 400px at 50% 0%, rgba(16,185,129,0.28), transparent 60%)",
              animation: "floaty 14s ease-in-out infinite",
            }}
          />
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
            {t.whatToBring.badge}
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            {t.whatToBring.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
            {t.whatToBring.subtitle}
          </p>
          <div
            className="mx-auto mt-6 h-1.5 w-32 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(34,197,94,1), rgba(56,189,248,1), rgba(34,197,94,1))",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.8s linear infinite",
            }}
          />
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.identityContact}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.photoId}</Check>
                <Check>{t.whatToBring.items.proofAddress}</Check>
                <Check>{t.whatToBring.items.emergencyContact}</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.insurancePayment}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.insuranceCard}</Check>
                <Check>{t.whatToBring.items.medicaidMedicare}</Check>
                <Check>{t.whatToBring.items.slidingScale}</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.medicalRecords}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.currentMeds}</Check>
                <Check>{t.whatToBring.items.allergies}</Check>
                <Check>{t.whatToBring.items.recentTests}</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.visitSpecific}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.dental}</Check>
                <Check>{t.whatToBring.items.vision}</Check>
                <Check>{t.whatToBring.items.pediatric}</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.languageAccess}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.interpreter}</Check>
                <Check>{t.whatToBring.items.assistive}</Check>
                <Check>{t.whatToBring.items.supportPerson}</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.whatToBring.quickTips}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>{t.whatToBring.items.arriveEarly}</Check>
                <Check>{t.whatToBring.items.callAhead}</Check>
                <Check>{t.whatToBring.items.phoneBackup}</Check>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-white/20 bg-white/10 p-6 text-white shadow-lg shadow-cyan-500/20 sm:flex-row">
            <div className="text-sm text-white/80">
              {t.whatToBring.finderSuggestion}
            </div>
            <Link
              href="/finder"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
            >
              {t.whatToBring.openFinder}
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
  );
}
