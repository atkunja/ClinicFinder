"use client";

import Link from "next/link";
import {
  FaIdCard,
  FaNotesMedical,
  FaRegFileAlt,
  FaMoneyCheckAlt,
  FaHome,
  FaRegAddressCard,
  FaListAlt,
} from "react-icons/fa";
import { useLang } from "@/i18n/LangProvider";

const sectionIcons = [FaIdCard, FaNotesMedical, FaRegFileAlt, FaMoneyCheckAlt, FaHome, FaRegAddressCard, FaListAlt];

export default function PreparePage() {
  const { t } = useLang();

  return (
    <main className="relative min-h-screen px-4 pb-20 pt-20 text-white sm:pb-24 sm:pt-24">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
          {t.prepare.badge}
        </div>
        <h1 className="text-4xl font-semibold leading-tight">
          {t.prepare.title}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-white/75">
          {t.prepare.subtitle}
        </p>
        <div className="mx-auto flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
          >
            {t.prepare.findYourClinic}
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="/what-to-bring"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t.prepare.checklistLink}
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.prepare.sections.map((section, i) => {
            const Icon = sectionIcons[i];
            return (
              <div key={section.title} className="app-surface flex h-full flex-col gap-4 p-6 text-slate-900">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-cyan-200 text-slate-900 shadow-lg shadow-cyan-500/20">
                  <Icon className="text-xl" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <p className="text-sm text-slate-700">{section.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="app-surface flex flex-col gap-6 p-8 text-slate-900">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t.prepare.dayOfRemindersTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t.prepare.dayOfRemindersSubtitle}
            </p>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {t.prepare.reminders.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700">
            {t.prepare.unsureNote} <span className="font-semibold">hello@zbimpact.org</span>.
          </div>
        </div>
      </section>
    </main>
  );
}
