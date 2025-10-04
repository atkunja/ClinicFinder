"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useMemo, useState } from "react";

const ALLOW = (process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAllowlisted(email?: string | null) {
  if (!email) return false;
  return ALLOW.includes(email.toLowerCase());
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/finder", label: "Clinic Finder" },
    { href: "/what-to-bring", label: "What to Bring" },
  ];

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  const showAdmin = useMemo(() => isAllowlisted(user?.email), [user]);
  const navItems = showAdmin
    ? [...links, { href: "/admin", label: "Admin" }]
    : links;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    try {
      setBusy(true);
      await signOut(auth);
      // make sure UI updates immediately
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("signOut error", e);
      // fall back to hard reload if something is stuck
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/10 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-3 text-white">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-gradient-to-br from-emerald-400/90 via-cyan-400/80 to-sky-500/80 shadow-lg shadow-cyan-500/20 transition group-hover:shadow-cyan-400/40"
          >
            <span className="text-sm font-bold tracking-wide">BF</span>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">SolvraFoundation</span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/60">
              Clinic access network
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 text-sm font-medium text-white/80 md:flex">
            {navItems.map((link) => {
              const isActive = active(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative overflow-hidden rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                    isActive
                      ? "bg-white/20 text-white shadow-inner shadow-white/10"
                      : "hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            {!loading && (
              <div className="ml-2">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    disabled={busy}
                    className="group relative overflow-hidden rounded-full border border-white/30 px-4 py-1.5 text-sm text-white transition hover:border-white/50 hover:bg-white/10 disabled:opacity-60"
                  >
                    <span className="relative z-10">{busy ? "Signing out…" : "Sign out"}</span>
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 opacity-0 transition group-hover:opacity-100"
                    />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-gradient-to-r from-emerald-400/80 to-cyan-400/80 px-4 py-1.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:from-emerald-300 hover:to-cyan-300"
                  >
                    Log in
                  </Link>
                )}
              </div>
            )}
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 p-2 text-white transition hover:border-white/40 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full rounded bg-current transition duration-200 ${
                  menuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded bg-current transition duration-200 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded bg-current transition duration-200 ${
                  menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className={`md:hidden overflow-hidden border-b border-white/10 bg-slate-950/70 backdrop-blur transition-all duration-200 ${
          menuOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav className="space-y-2 px-4 pb-4 pt-3 text-sm text-white/80">
          {navItems.map((link) => {
            const isActive = active(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-2xl border px-4 py-2 transition ${
                  isActive
                    ? "border-white/40 bg-white/20 text-white"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!loading && (
            <div className="pt-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  disabled={busy}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-left text-sm text-white transition hover:border-white/40 hover:bg-white/20 disabled:opacity-60"
                >
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-2xl border border-white/20 bg-gradient-to-r from-emerald-400/80 to-cyan-400/80 px-4 py-2 text-center text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20"
                >
                  Log in
                </Link>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
