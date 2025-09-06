// src/app/what-to-bring/page.tsx
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";

export const metadata = {
  title: "What to Bring • Healthcare for All",
};

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

export default function WhatToBringPage() {
  return (
    <RequireAuth>
      <main className="min-h-screen bg-[rgb(247,249,251)] text-slate-900">
        {/* Global keyframes */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes floaty {
            0% { transform: translateY(0px) }
            50% { transform: translateY(10px) }
            100% { transform: translateY(0px) }
          }
          @keyframes shimmer {
            0% { background-position: 0% 50% }
            100% { background-position: 200% 50% }
          }
        `,
          }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* animated soft blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(1000px 500px at 70% -10%, rgba(16,185,129,0.30), rgba(16,185,129,0) 60%)",
              animation: "floaty 12s ease-in-out infinite",
            }}
          />

          <div className="mx-auto max-w-6xl px-4 pt-10 pb-10 sm:pt-14 sm:pb-14">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                What to Bring to Your Appointment
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Every clinic is different. Use this checklist to be prepared and speed up your visit.
              </p>

              <div
                className="mx-auto mt-5 h-2 w-36 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9), rgba(16,185,129,0.9))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.2s linear infinite",
                }}
              />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* ID & Contact */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">
                Identity & Contact
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Photo ID (driver’s license, passport, school ID) if available</Check>
                <Check>Proof of address (mail, lease, or bill) if available</Check>
                <Check>Emergency contact info</Check>
              </ul>
            </div>

            {/* Insurance / Payment */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">
                Insurance / Payment
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Insurance card (if you have one)</Check>
                <Check>Medicaid/Medicare information (if applicable)</Check>
                <Check>Small payment if clinic requests a sliding-scale fee</Check>
              </ul>
            </div>

            {/* Medical Records */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">Medical Records</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Current medications (or a list + doses)</Check>
                <Check>Allergies and prior conditions</Check>
                <Check>Vaccination record if available</Check>
              </ul>
            </div>

            {/* Visit Specific */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">Visit-Specific Items</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Dental: prior x-rays or dentist notes if you have them</Check>
                <Check>Vision: current glasses/contacts prescription</Check>
                <Check>Child visit: child’s ID or birth certificate if available</Check>
              </ul>
            </div>

            {/* Language & Access */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">Language & Access</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Interpreter preference (many clinics can help)</Check>
                <Check>Mobility or accessibility needs</Check>
                <Check>Someone who can accompany you if needed</Check>
              </ul>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-emerald-700">Quick Tips</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <Check>Arrive early and bring a list of questions</Check>
                <Check>Call ahead to confirm hours & documents required</Check>
                <Check>Keep photos of documents on your phone as backup</Check>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-slate-600">
              Not sure which clinic to choose? Use the finder to filter by services and distance.
            </p>
            <Link
              href="/finder"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-700"
            >
              Open Clinic Finder
            </Link>
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}
