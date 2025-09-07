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
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 100%)",
            }}
          />
          <span className="font-semibold text-slate-900">Healthcare for All</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              active("/") ? "text-slate-900" : "text-slate-700"
            } hover:text-slate-900 hover:underline underline-offset-4`}
          >
            Home
          </Link>

          <Link
            href="/finder"
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              active("/finder") ? "text-slate-900" : "text-slate-700"
            } hover:text-slate-900 hover:underline underline-offset-4`}
          >
            Clinic Finder
          </Link>

          <Link
            href="/what-to-bring"
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              active("/what-to-bring") ? "text-slate-900" : "text-slate-700"
            } hover:text-slate-900 hover:underline underline-offset-4`}
          >
            What to Bring
          </Link>

          {/* Admin only for allowlisted users */}
          {showAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                active("/admin") ? "text-slate-900" : "text-slate-700"
              } hover:text-slate-900 hover:underline underline-offset-4`}
            >
              Admin
            </Link>
          )}

          {/* Rightmost auth button */}
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleSignOut}
                  disabled={busy}
                  className="ml-2 rounded-full border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="ml-2 rounded-full border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Log in
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
