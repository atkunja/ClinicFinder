// src/app/page.tsx
import Link from "next/link";

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4" {...props}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 12h14m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[rgb(247,249,251)] text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* soft gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, rgba(16,185,129,0.35), rgba(16,185,129,0) 60%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Community resource
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Healthcare is a Right, Not a Privilege
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Connecting uninsured and underinsured individuals with accessible, compassionate, and free
              or low-cost healthcare clinics in their communities.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/finder"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-700"
              >
                Find a Clinic
              </Link>
              <Link
                href="/what-to-bring"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                What to Bring
                <ArrowIcon className="ml-2" />
              </Link>
            </div>

            {/* quick stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { k: "Counties", v: "SE Michigan" },
                { k: "Clinics tracked", v: "Growing weekly" },
                { k: "Cost", v: "Free to use" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border bg-white/70 p-3 text-sm backdrop-blur"
                >
                  <div className="text-slate-500">{s.k}</div>
                  <div className="text-base font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE CAN HELP */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
          How We Can Help You
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-emerald-700">Clinic Finder</div>
            <p className="text-slate-600">
              Search for nearby free or low-cost clinics based on your location and type of care needed.
            </p>
            <Link
              href="/finder"
              className="mt-3 inline-flex items-center text-emerald-700 hover:underline"
            >
              Search Now <ArrowIcon className="ml-1" />
            </Link>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-emerald-700">What to Bring</div>
            <p className="text-slate-600">
              Be prepared with a checklist of items and documents most clinics require.
            </p>
            <Link
              href="/what-to-bring"
              className="mt-3 inline-flex items-center text-emerald-700 hover:underline"
            >
              View Checklist <ArrowIcon className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS / STEPS */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">How it works</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Search",
                d: "Enter an address or use your current location to see nearby clinics.",
              },
              {
                t: "Compare",
                d: "Filter by services (dental, pediatrics, mental health, etc.) and verified clinics.",
              },
              {
                t: "Go",
                d: "Open directions or view details to call ahead and confirm hours.",
              },
            ].map((s, i) => (
              <div key={s.t} className="rounded-xl border bg-slate-50 p-4">
                <div className="mb-1 text-xs font-semibold text-slate-500">
                  STEP {i + 1}
                </div>
                <div className="text-base font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">Our Mission</h2>
        <p className="mx-auto max-w-3xl text-center text-slate-700">
          We believe everyone deserves the dignity of quality care — regardless of income, status,
          or background. This platform helps individuals discover nearby medical, dental, and pediatric clinics,
          learn what to bring to their appointments, and take that first step toward better health.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} Healthcare for All</div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/finder" className="text-slate-600 hover:text-slate-900">
              Clinic Finder
            </Link>
            <Link href="/what-to-bring" className="text-slate-600 hover:text-slate-900">
              What to Bring
            </Link>
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
