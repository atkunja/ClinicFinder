"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import RequireAuth from "@/components/RequireAuth";

const allow = (email?: string | null) =>
  (process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes((email || "").toLowerCase());

function AdminGateInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // RequireAuth will redirect unauthenticated users to /auth/login
      if (!u) return;
      if (!allow(u.email)) router.replace("/"); // non-admins back home
    });
    return () => unsub();
  }, [router]);

  return <RequireAuth>{children}</RequireAuth>;
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-black">Checking access…</div>}>
      <AdminGateInner>{children}</AdminGateInner>
    </Suspense>
  );
}
