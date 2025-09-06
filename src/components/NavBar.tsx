"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const link = (href: string, label: string) => {
    const active =
      pathname === href || (href !== "/" && pathname?.startsWith(href));

    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${
            active
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-700 hover:bg-slate-100"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo / Home */}
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-7 w-7 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 100%)",
            }}
          />
          <span className="font-semibold text-lg text-slate-900">
            Healthcare for All
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-3">
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

