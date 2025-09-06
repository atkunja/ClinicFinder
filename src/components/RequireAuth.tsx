"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const next = useMemo(() => {
    const q = search?.toString();
    return q ? `${pathname}?${q}` : pathname || "/";
  }, [pathname, search]);

  useEffect(() => {
    if (user === undefined) return; // still loading
    if (!user) router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
  }, [user, next, router]);

  if (user === undefined) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-600">
        Checking sign-in…
      </div>
    );
  }

  if (!user) return null; // redirecting

  return <>{children}</>;
}
