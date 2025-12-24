// src/app/what-to-bring/page_inner.tsx
"use client";

import Link from "next/link";

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function WhatToBringInner() {
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
            Appointment checklist
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            Walk in prepared. Walk out cared for.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
            Every clinic is different. Use this checklist so intake goes quickly and you spend your visit focusing on your health—not paperwork.
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
                Identity & contact
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Photo ID (driver's license, passport, school ID) if available</Check>
                <Check>Proof of address (mail, lease, or bill) if available</Check>
                <Check>Emergency contact details</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Insurance & payment
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Insurance card or policy number, if you have one</Check>
                <Check>Medicaid/Medicare information (if applicable)</Check>
                <Check>Small payment for sliding-scale fees (some clinics request $5–$20)</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Medical records
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Current medications (or a written list with doses)</Check>
                <Check>Allergies and prior conditions</Check>
                <Check>Recent test results or imaging discs if you have them</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Visit-specific items
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Dental: prior x-rays, treatment notes, or guard</Check>
                <Check>Vision: current glasses or contact prescription</Check>
                <Check>Pediatric: child's ID, immunization card, and guardian authorization if needed</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Language & access
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Interpreter preference (many clinics have partners)</Check>
                <Check>Assistive devices, mobility needs, or sensory accommodations</Check>
                <Check>Support person who can accompany you if desired</Check>
              </ul>
            </div>

            <div className="app-surface p-6 text-slate-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Quick tips
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <Check>Arrive 15 minutes early and keep a list of questions</Check>
                <Check>Call ahead to confirm hours, documents, and payment (if any)</Check>
                <Check>Store photos of documents in your phone as a backup</Check>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-[24px] border border-white/20 bg-white/10 p-6 text-white shadow-lg shadow-cyan-500/20 sm:flex-row">
            <div className="text-sm text-white/80">
              Need a clinic suggestion? Use the finder to filter by services, cost, language, transportation, and more.
            </div>
            <Link
              href="/finder"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
            >
              Open the clinic finder
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>
  );
}
