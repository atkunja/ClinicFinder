// src/app/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Healthcare for All",
  description: "Find free or low-cost healthcare clinics near you",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[rgb(247,249,251)] text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 500px at 70% -10%, rgba(16,185,129,0.25), rgba(16,185,129,0) 60%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 pt-14 pb-14 text-center">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            Healthcare is a Right, Not a Privilege
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Connecting uninsured and underinsured individuals with accessible,
            compassionate, and free or low-cost healthcare clinics in their
            communities.
          </p>

          {/* Removed Find a Clinic + What to Bring buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="rounded-xl border px-5 py-3 text-sm">
              <span className="block text-xs uppercase text-slate-500">
                Counties
              </span>
              <span className="font-semibold">SE Michigan</span>
            </div>
            <div className="rounded-xl border px-5 py-3 text-sm">
              <span className="block text-xs uppercase text-slate-500">
                Clinics tracked
              </span>
              <span className="font-semibold">Growing weekly</span>
            </div>
            <div className="rounded-xl border px-5 py-3 text-sm">
              <span className="block text-xs uppercase text-slate-500">Cost</span>
              <span className="font-semibold">Free to use</span>
            </div>
          </div>
        </div>
      </section>

      {/* How We Can Help */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold mb-6">
          How We Can Help You
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-emerald-700">Clinic Finder</h3>
            <p className="mt-2 text-sm text-slate-700">
              Search for nearby free or low-cost clinics based on your location
              and type of care needed.
            </p>
            <Link
              href="/finder"
              className="mt-3 inline-flex text-emerald-600 hover:underline text-sm"
            >
              Search Now →
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-emerald-700">What to Bring</h3>
            <p className="mt-2 text-sm text-slate-700">
              Be prepared with a checklist of items and documents most clinics
              require.
            </p>
            <Link
              href="/what-to-bring"
              className="mt-3 inline-flex text-emerald-600 hover:underline text-sm"
            >
              View Checklist →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold mb-6">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">STEP 1</div>
            <p className="mt-2 text-sm">
              <strong>Search</strong> <br />
              Enter an address or use your current location to see nearby
              clinics.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">STEP 2</div>
            <p className="mt-2 text-sm">
              <strong>Compare</strong> <br />
              Filter by services (dental, pediatrics, mental health, etc.) and
              verified clinics.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-700">STEP 3</div>
            <p className="mt-2 text-sm">
              <strong>Go</strong> <br />
              Open directions or view details to call ahead and confirm hours.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="mx-auto max-w-3xl text-slate-600">
          We believe everyone deserves the dignity of quality care — regardless
          of income, status, or background. This platform helps individuals
          discover nearby medical, dental, and pediatric clinics, learn what to
          bring to their appointments, and take that first step toward better
          health.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-600">
        © 2025 Healthcare for All
      </footer>
    </main>
  );
}
