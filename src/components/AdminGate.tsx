// src/components/AdminGate.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import RequireAuth from "./RequireAuth";

function isAllowed(email?: string | null) {
  const raw =
    (process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST ||
      (process.env as any).ADMIN_ALLOWLIST ||
      "") as string;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes((email || "").toLowerCase());
}

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && !isAllowed(u.email)) router.replace("/");
    });
    return () => unsub();
  }, [router]);

  return <RequireAuth>{children}</RequireAuth>;
}
