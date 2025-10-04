"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { useMemo, useState } from "react";

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

  const links = [
    { href: "/", label: "Home" },
    { href: "/finder", label: "Clinic Finder" },
    { href: "/what-to-bring", label: "What to Bring" },
  ];

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  const showAdmin = useMemo(() => isAllowlisted(user?.email), [user]);

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
            <span className="text-sm font-bold tracking-wide">HF</span>
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">Healthcare for All</span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/60">
              Clinic access network
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-white/80">
          {links.map((link) => {
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

          {showAdmin && (
            <Link
              href="/admin"
              className={`relative overflow-hidden rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                active("/admin")
                  ? "bg-white/20 text-white shadow-inner shadow-white/10"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="relative z-10">Admin</span>
            </Link>
          )}

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
      </div>
    </header>
  );
}
