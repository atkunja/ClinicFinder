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
    title: "Tell us where it hurts",
    body: "Search by address or the type of care you need. We surface clinics with proven experience for your situation.",
  },
  {
    title: "Review clinic readiness",
    body: "See eligibility, required documents, languages spoken, and patient reviews gathered by our volunteers.",
  },
  {
    title: "Arrive confident",
    body: "Use our checklists, transit tips, and call scripts so nothing stands between you and the care you deserve.",
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
  {
    title: "AI Symptom Triage",
    summary: "Admins can capture key details with our Gemini-powered intake assistant to recommend the right type of clinic before making calls.",
  },
];

const testimonials = [
  {
    quote:
      "When my grandma’s denture cracked, we found a dental day clinic through this network. She was seen the same afternoon and hasn’t stopped smiling since.",
    name: "Amina, Detroit caregiver",
  },
  {
    quote:
      "The finder helped me compare clinics that speak Spanish and accept patients without insurance. Now my son’s asthma is finally under control.",
    name: "Lucía, Southwest Detroit",
  },
  {
    quote:
      "I volunteer with a free clinic and rely on these updates to keep our intake checklist current and our neighbors informed.",
    name: "Taha Ilyas, volunteer navigator",
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
    a: "Many clinics offer bus vouchers or ride-share credits. Look for the Access icon on a clinic profile or email our navigators at hello@bibifoundation.org for support.",
  },
  {
    q: "Do you cover mental health services?",
    a: "Yes. Use the Clinic Finder filters to surface counseling, psychiatry, recovery, and peer support programs.",
  },
];

export const metadata = {
  title: "Bibi Foundation",
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
              We work with local clinics, social workers, and volunteers to make sure every neighbor can access compassionate medical, dental, and mental health services without wondering where to start.
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

          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm text-white shadow-inner shadow-white/5 sm:flex sm:items-center sm:justify-between">
            <div className="max-w-lg text-white/80">
              <strong className="font-semibold text-white">New:</strong> Gemini-powered symptom triage helps volunteers capture the right info before booking.
            </div>
            <Link
              href="/admin/triage"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10 hover:text-white sm:mt-0"
            >
              Try the assistant →
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <div className="glass-panel relative mx-auto max-w-md p-6 text-slate-900 sm:p-8">
            <div className="absolute -top-16 right-6 hidden h-32 w-32 rounded-full bg-gradient-to-br from-emerald-300/60 to-cyan-300/20 blur-3xl sm:block" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
              Concierge support
            </h2>
            <p className="mt-3 text-xl font-semibold text-slate-900">
              Every clinic we list has been verified by a human. Need help booking? Reach our navigators at <span className="font-bold">hello@bibifoundation.org</span>.
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

      {/* Story highlight */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:mt-24">
        <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-cyan-500/20 sm:p-10">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-white/50 to-transparent blur-3xl" />
          <div className="absolute -bottom-16 -left-10 hidden h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/40 to-transparent blur-3xl md:block" />
          <div className="relative space-y-6">
            <p className="text-lg text-white/80">
              "My grandma’s denture cracked the week before Easter. We opened the finder, hit Dental, and had her routed to a mobile clinic that same afternoon. They patched her smile, helped us schedule a follow-up, and even arranged a ride back home. She tells everyone the team saved her teeth and her pride."
            </p>
            <div className="flex items-center gap-3 text-sm font-medium text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900">
                ✨
              </span>
              <div>
                <div>Amina’s family</div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Highland Park, MI</div>
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
              <h2 className="text-3xl font-semibold text-slate-900">Your path to care starts with clarity</h2>
              <p className="text-base text-slate-600">
                We designed Bibi Foundation to guide you from feeling stuck to being seen by the right clinician. The pathway is the same whether you are searching for yourself, a loved one, or someone you support professionally.
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

      {/* Testimonials */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="app-surface relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,148,136,0.15),_transparent_60%)]" aria-hidden />
            <div className="relative space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Built with and for community</h2>
              <p className="text-base text-slate-600">
                Social workers, clinic directors, city agencies, and volunteers co-create every update in our database. The result: accurate, compassionate guidance when families need it most.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {testimonials.map((testimonial) => (
                  <blockquote key={testimonial.name} className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-700 shadow-sm">
                    <p className="leading-relaxed">“{testimonial.quote}”</p>
                    <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {testimonial.name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>

          <aside className="glass-panel relative flex flex-col justify-between gap-6 p-6 text-slate-900 sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">We never sell your data</h3>
              <p className="mt-3 text-sm text-slate-600">
                Bibi Foundation is run by volunteers and backed by community grants. Your searches stay private, and clinics only see your information when you contact them directly.
              </p>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  SMS
                </span>
                <div>
                  Get visit reminders and prep tips. Email <span className="font-semibold">hello@bibifoundation.org</span> with the subject line <span className="font-semibold">CARE</span> to subscribe.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600/10 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  HELP
                </span>
                <div>
                  Talk live with a navigator weekdays 8am – 6pm by emailing <span className="font-semibold">hello@bibifoundation.org</span>. After-hours, we reply within one business day.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Want to share updated clinic info? Email <a className="underline" href="mailto:hello@bibifoundation.org">hello@bibifoundation.org</a> and our intake team will follow up.
            </p>
         </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="app-surface p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Answers before you travel</h2>
              <p className="text-sm text-slate-600">
                Our navigators compiled the questions they hear most often. Still unsure? Call us or send a note to <a className="underline" href="mailto:hello@bibifoundation.org">hello@bibifoundation.org</a>.
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
              Whether this is your first visit or you are coordinating care for an entire shelter, Bibi Foundation gives you a calm starting point. Log in for volunteer tools or jump straight into the finder.
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
