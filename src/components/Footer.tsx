"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";

export default function Footer() {
  const { t } = useLang();

  const footerLinks = [
    { label: t.footer.findAClinic, href: "/finder" },
    { label: t.footer.whatToBring, href: "/what-to-bring" },
    { label: t.footer.missionStatement, href: "/mission" },
    { label: t.footer.prepareForVisit, href: "/prepare" },
    { label: t.nav.admin, href: "/admin" },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-white/5 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 10% 50%, rgba(59, 130, 246, 0.12), transparent 55%), radial-gradient(circle at 90% 30%, rgba(16, 185, 129, 0.18), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-14 md:flex-row md:justify-between">
        <div className="max-w-md space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-lg shadow-cyan-500/20">
              <Image src="/logo.png" alt="ZB Impact logo" width={40} height={40} className="h-10 w-10 object-contain" />
            </span>
            ZB Impact
          </Link>
          <p className="text-sm text-slate-200/80">
            {t.footer.description}
          </p>
          <div className="flex gap-3 text-xs text-slate-200/70">
            <span>
              {t.footer.contact} <a className="underline" href="mailto:hello@zbimpact.org">hello@zbimpact.org</a>
            </span>
            <span aria-hidden>&bull;</span>
            <span>{t.footer.hours}</span>
          </div>
        </div>

        <div className="grid flex-1 gap-12 text-sm sm:grid-cols-2 md:gap-16">
          <div>
            <h3 className="font-semibold text-white/80">{t.footer.explore}</h3>
            <ul className="mt-4 space-y-2 text-white/60">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className="transition hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white/80">{t.footer.support}</h3>
            <ul className="mt-4 space-y-2 text-white/60">
              <li>
                <Link href="/login" className="transition hover:text-white">
                  {t.footer.volunteerLogin}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.nea.org/resource-library/how-find-low-cost-health-services-your-community"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  {t.footer.additionalCareResources}
                </a>
              </li>
              <li>
                <a
                  href="https://www.cms.gov/cciio"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  {t.footer.coverageCounseling}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-slate-900/60 py-4 text-center text-xs text-slate-300/70">
        &copy; {new Date().getFullYear()} {t.footer.copyright}
     </div>
    </footer>
  );
}
