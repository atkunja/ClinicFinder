"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";

export default function MissionInner() {
  const { t } = useLang();

  return (
    <main className="relative isolate overflow-hidden bg-slate-950 py-16 text-white sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(14,165,233,0.25), transparent 55%), radial-gradient(circle at 90% 40%, rgba(16,185,129,0.2), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-12 px-4">
        <header className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/35 bg-white/95 shadow-xl shadow-cyan-500/30">
              <Image src="/logo.png" alt="ZB Impact logo" width={64} height={64} className="h-16 w-16 object-contain" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">ZB Impact</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            {t.mission.aboutBadge}
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{t.mission.title}</h1>
            <p className="text-base text-white/80">
              {t.mission.heroBody}
            </p>
          </div>
        </header>

        <div className="grid gap-8 rounded-[32px] border border-white/10 bg-white/10 p-8 text-base leading-relaxed text-white/80 shadow-lg shadow-cyan-500/10 backdrop-blur-sm sm:p-12">
          <p>{t.mission.paragraph1}</p>
          <p>{t.mission.paragraph2}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-2.5 font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:from-emerald-200 hover:to-cyan-200"
          >
            {t.mission.exploreFinder}
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="/what-to-bring"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-semibold transition hover:bg-white/10"
          >
            {t.mission.prepareForVisit}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
