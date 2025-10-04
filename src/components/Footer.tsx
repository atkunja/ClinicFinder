// src/components/Footer.tsx
import Link from "next/link";

const footerLinks = [
  { label: "Find a Clinic", href: "/finder" },
  { label: "What to Bring", href: "/what-to-bring" },
  { label: "Prepare for a Visit", href: "/prepare" },
  { label: "Admin", href: "/admin" },
];

export default function Footer() {
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
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 1) 0%, rgba(14, 165, 233, 1) 100%)",
                boxShadow: "0 12px 30px rgba(14, 165, 233, 0.25)",
              }}
            >
              <span className="text-sm font-bold text-white">HF</span>
            </span>
            Healthcare for All
          </Link>
          <p className="text-sm text-slate-200/80">
            A volunteer-built project connecting people with compassionate, free or low-cost care across Southeast Michigan. We believe healthcare is a right, not a luxury.
          </p>
          <div className="flex gap-3 text-xs text-slate-200/70">
            <span>Contact: <a className="underline" href="mailto:hello@healthcareforall.org">hello@healthcareforall.org</a></span>
            <span aria-hidden>•</span>
            <span>Hours: 7 days a week, 9am – 7pm ET</span>
          </div>
        </div>

        <div className="grid flex-1 gap-12 text-sm sm:grid-cols-2 md:gap-16">
          <div>
            <h3 className="font-semibold text-white/80">Explore</h3>
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
            <h3 className="font-semibold text-white/80">Support</h3>
            <ul className="mt-4 space-y-2 text-white/60">
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Volunteer login
                </Link>
              </li>
              <li>
                <a
                  href="https://www.nea.org/resource-library/how-find-low-cost-health-services-your-community"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Additional care resources
                </a>
              </li>
              <li>
                <a
                  href="https://www.cms.gov/cciio"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  Coverage counseling
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-slate-900/60 py-4 text-center text-xs text-slate-300/70">
        © {new Date().getFullYear()} Healthcare for All. Built with community partners and volunteer clinicians.
      </div>
    </footer>
  );
}

