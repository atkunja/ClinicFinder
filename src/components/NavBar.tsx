"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

function isAllowed(email?: string | null) {
  const raw =
    (process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST ||
      // fall back to non-public var if you kept the old name
      (process.env as any).ADMIN_ALLOWLIST ||
      "") as string;

  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes((email || "").toLowerCase());
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const showAdmin = useMemo(() => isAllowed(user?.email), [user]);

  const activeLink = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  const NavLink = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
        activeLink(href) ? "text-slate-900" : "text-slate-700"
      } hover:text-slate-900 hover:underline underline-offset-4`}
    >
      {label}
    </Link>
  );

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await signOut(auth);
      // after sign out, go home (UI will switch to "Log in")
      router.push("/");
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
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

        {/* Right-side nav */}
        <nav className="flex items-center gap-1">
          <NavLink href="/" label="Home" />
          <NavLink href="/finder" label="Clinic Finder" />
          <NavLink href="/what-to-bring" label="What to Bring" />
          {showAdmin && <NavLink href="/admin" label="Admin" />}

          {/* Auth button */}
          {user ? (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="ml-1 inline-flex items-center rounded-full border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="ml-1 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-emerald-700"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
