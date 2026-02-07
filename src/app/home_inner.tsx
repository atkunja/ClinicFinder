"use client";

import Link from "next/link";
import LiveMetrics from "@/components/LiveMetrics";
import ZipQuickStart from "@/components/ZipQuickStart";
import { useLang } from "@/i18n/LangProvider";

export default function HomeInner() {
  const { t } = useLang();

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
            {t.home.badge}
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              {t.home.heroBody}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-slate-900 shadow-xl shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
            >
              {t.home.openFinder}
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/what-to-bring"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.home.checklistLink}
            </Link>
          </div>
          <LiveMetrics />
        </div>

        <div className="flex-1">
          <div className="glass-panel relative mx-auto max-w-md p-6 text-slate-900 sm:p-8">
            <div className="absolute -top-16 right-6 hidden h-32 w-32 rounded-full bg-gradient-to-br from-emerald-300/60 to-cyan-300/20 blur-3xl sm:block" />
            <ZipQuickStart />
          </div>
        </div>
      </section>

      {/* Care pathway */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24">
        <div className="app-surface relative overflow-hidden p-6 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" aria-hidden />
          <div className="relative grid gap-10 md:grid-cols-[320px_1fr]">
            <div className="space-y-5">
              <h2 className="text-3xl font-semibold text-slate-900">{t.home.carePathwayTitle}</h2>
              <p className="text-base text-slate-600">
                {t.home.carePathwayBody}
              </p>
              <Link
                href="/finder"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                {t.home.browseNearbyClinics}
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {t.home.pathway.map((step, index) => (
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
            <h2 className="text-3xl font-semibold">{t.home.servicesTitle}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              {t.home.servicesSubtitle}
            </p>
          </div>
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {t.home.compareOptions}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.services.map((service) => (
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
              <h2 className="text-3xl font-semibold text-slate-900">{t.home.faqTitle}</h2>
              <p className="text-sm text-slate-600">
                {t.home.faqSubtitle} <a className="underline" href="mailto:hello@zbimpact.org">hello@zbimpact.org</a>.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {t.home.faqs.map((faq) => (
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
            <h2 className="text-3xl font-semibold">{t.home.ctaTitle}</h2>
            <p className="text-base text-slate-800">
              {t.home.ctaBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/finder"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                {t.home.startSearch}
                <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900/10"
              >
                {t.home.accessVolunteerTools}
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
