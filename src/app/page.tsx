// src/app/page.tsx
import Link from "next/link";

const metrics = [
  { label: "Mapped clinics", value: "86" },
  { label: "Counties served", value: "6" },
  { label: "Average wait time", value: "36 hrs" },
  { label: "Care partners", value: "28" },
];

const pathway = [
  {
    title: "Search for clinics",
    body: "Use the clinic finder to browse free and sliding-scale clinics by location and type of care.",
  },
  {
    title: "Review clinic details",
    body: "Check services offered, cost information, and what documents may be required.",
  },
  {
    title: "Contact the clinic directly",
    body: "Reach out to the clinic to schedule an appointment or confirm eligibility.",
  },
];

const services = [
  {
    title: "Primary & Preventive",
    summary: "Community clinics for annual checkups, prenatal care, vaccinations, and chronic condition support.",
  },
  {
    title: "Dental & Vision",
    summary: "Preventive cleanings, emergency extractions, restorative care, eye exams, and affordable glasses programs.",
  },
  {
    title: "Behavioral Health",
    summary: "Counseling, addiction recovery, group therapy, and telehealth options tailored to low-cost access.",
  },
  {
    title: "Pediatrics & Family",
    summary: "Care for kids of every age — from wellness visits and sports physicals to immunization catch-up clinics.",
  },
  {
    title: "Women’s Health",
    summary: "OB-GYN services, cancer screenings, birth support, and reproductive health resources with trauma-informed staff.",
  },
  {
    title: "Specialty Referrals",
    summary: "Connections to oncology, cardiology, and surgical partners offering charity care and sliding-scale billing.",
  },
];


const faqs = [
  {
    q: "Is my information shared with clinics?",
    a: "No. We never store personal health details. You choose when to contact a clinic and what to share with them directly.",
  },
  {
    q: "How do you verify the clinics?",
    a: "Our volunteer researchers confirm services, hours, and eligibility every 30 days. Clinics marked Verified have spoken with our intake team in the last two weeks.",
  },
  {
    q: "Can I get transportation help?",
    a: "Many clinics offer bus vouchers or ride-share credits. Look for the Access icon on a clinic profile or email our navigators at hello@zbimpact.org for support.",
  },
  {
    q: "Do you cover mental health services?",
    a: "Yes. Use the Clinic Finder filters to surface counseling, psychiatry, recovery, and peer support programs.",
  },
];

export const metadata = {
  title: "ZB Impact",
  description: "Find free or low-cost healthcare clinics near you",
};

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden pb-16 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[-1]"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(14, 165, 233, 0.35), transparent 45%), radial-gradient(circle at 100% 10%, rgba(16, 185, 129, 0.28), transparent 55%)",
        }}
      />

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-20 text-white sm:pt-24 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
            Free & low-cost care, verified weekly
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Finding care should feel supportive, not stressful.
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              We compile and maintain a clinic finder that helps people locate free and low-cost medical, dental, and mental health care, without the confusion of figuring out where to start.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-slate-900 shadow-xl shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
            >
              Open the clinic finder
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/what-to-bring"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Checklist: what to bring
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-inner shadow-white/5">
                <div className="text-2xl font-semibold text-white">{metric.value}</div>
                <div className="text-xs uppercase tracking-wide text-white/60">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="glass-panel relative mx-auto max-w-md p-6 text-slate-900 sm:p-8">
            <div className="absolute -top-16 right-6 hidden h-32 w-32 rounded-full bg-gradient-to-br from-emerald-300/60 to-cyan-300/20 blur-3xl sm:block" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
              Concierge support
            </h2>
            <p className="mt-3 text-xl font-semibold text-slate-900">
              Every clinic we list has been verified by a human. Need help booking? Reach our navigators at <span className="font-bold">hello@zbimpact.org</span>.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  1
                </span>
                <span>Answer a few questions about symptoms or concerns.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  2
                </span>
                <span>We match you with clinics that fit your insurance, language, and transportation needs.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  3
                </span>
                <span>Leave with a confirmed plan, documents checklist, and directions in minutes.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Care pathway */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24">
        <div className="app-surface relative overflow-hidden p-6 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" aria-hidden />
          <div className="relative grid gap-10 md:grid-cols-[320px_1fr]">
            <div className="space-y-5">
              <h2 className="text-3xl font-semibold text-slate-900">Help Finding Care</h2>
              <p className="text-base text-slate-600">
                Our clinic finder brings together verified information on free and low-cost clinics, all in one place. Use the steps below to find care and know what to expect before your visit.
              </p>
              <Link
                href="/finder"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                Browse nearby clinics
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {pathway.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24">
        <div className="mb-10 flex flex-col gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Care programs we cover</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Filter clinics by service, language, age group, verification status, and distance. We keep every profile current so you can focus on next steps.
            </p>
          </div>
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Compare options
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-lg shadow-cyan-500/10 transition hover:border-white/40 hover:shadow-cyan-500/40 sm:p-8">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/30" />
              <div className="relative space-y-4">
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-sm text-white/70">{service.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="app-surface p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Answers before you travel</h2>
              <p className="text-sm text-slate-600">
                Our navigators compiled the questions they hear most often. Still unsure? Call us or send a note to <a className="underline" href="mailto:hello@zbimpact.org">hello@zbimpact.org</a>.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:mt-24">
        <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-emerald-400/70 via-cyan-400/60 to-sky-400/60 p-6 text-slate-900 shadow-2xl shadow-cyan-500/30 sm:p-10">
          <div className="relative space-y-6">
            <h2 className="text-3xl font-semibold">Ready when you are</h2>
            <p className="text-base text-slate-800">
              Whether this is your first visit or you are coordinating care for an entire shelter, ZB Impact gives you a calm starting point. Log in for volunteer tools or jump straight into the finder.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/finder"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                Start a search
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900/10"
              >
                Access volunteer tools
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
