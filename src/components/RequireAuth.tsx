"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Auth gate that:
 * - Never redirects while auth is still resolving
 * - Never redirects if you're already under /auth/*
 * - Sends you to /auth/login?next=<encoded current path>
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  const isInAuth = useMemo(
    () => (pathname || "").startsWith("/auth"),
    [pathname]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user === undefined) return; // still resolving
    if (user) return; // authed, render children
    if (isInAuth) return; // already on /auth, don't bounce again

    const next = encodeURIComponent(pathname + (search?.toString() ? `?${search}` : ""));
    router.replace(`/auth/login?next=${next}`);
  }, [user, isInAuth, pathname, search, router]);

  if (user === undefined) {
    // Small, unobtrusive loading state to avoid flicker/loop
    return (
      <div className="min-h-[40vh] grid place-items-center text-slate-600">
        Checking your session…
      </div>
    );
  }

  if (!user && !isInAuth) {
    // We'll be redirecting; render nothing
    return null;
  }

  return <>{children}</>;
}
