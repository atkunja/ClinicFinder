"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function isAllowed(email?: string | null) {
  const raw = process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST || "";
  const list = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAllowed(user.email)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-8 text-slate-700">Checking access…</div>;
  if (!user) return null;
  if (!isAllowed(user.email)) return null;

  return <>{children}</>;
}
