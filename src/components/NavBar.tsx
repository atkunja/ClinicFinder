"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const link = (href: string, label: string) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
          active ? "bg-emerald-100 text-emerald-800" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo mark */}
            <span
              aria-hidden
              className="inline-block h-6 w-6 rounded-lg bg-emerald-600"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 100%)",
              }}
            />
            <span className="font-semibold text-slate-900">Healthcare for All</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          {link("/", "Home")}
          {link("/finder", "Clinic Finder")}
          {link("/what-to-bring", "What to Bring")}
          {link("/admin", "Admin")}
          {link("/auth/signout", "Sign out")}
        </nav>
      </div>
    </header>
  );
}
