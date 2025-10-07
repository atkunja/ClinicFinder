// src/app/mission/page.tsx
import Link from "next/link";

export const metadata = {
  title: "ZB Impact Mission Statement",
  description: "Learn how ZB Impact turns loss into purpose by expanding access to compassionate healthcare.",
};

export default function MissionPage() {
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
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            About ZB Impact
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">ZB Impact Mission Statement</h1>
            <p className="text-base text-white/80">
              ZB Impact was born from a deeply personal loss. After our founder’s grandmother was diagnosed with liver cancer, the family struggled to find timely and affordable treatment—only to discover options when it was too late. Her story fuels our mission: to ensure that no one is left behind simply because they lack insurance.
            </p>
          </div>
        </header>

        <div className="grid gap-8 rounded-[32px] border border-white/10 bg-white/10 p-8 text-base leading-relaxed text-white/80 shadow-lg shadow-cyan-500/10 backdrop-blur-sm sm:p-12">
          <p>
            We are dedicated to connecting individuals and families in need with compassionate healthcare providers,
            clinics, and resources—bridging the gap between care and accessibility. Through advocacy, community
            partnerships, and direct support, ZB Impact strives to make quality healthcare a right, not a privilege.
          </p>
          <p>
            Our mission is simple but urgent: to turn loss into purpose and compassion into access—so that every life
            has a fighting chance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-2.5 font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:from-emerald-200 hover:to-cyan-200"
          >
            Explore the clinic finder
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/what-to-bring"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-semibold transition hover:bg-white/10"
          >
            Prepare for a visit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
