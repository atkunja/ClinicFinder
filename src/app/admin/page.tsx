"use client";

import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import AdminPageInner from "./ui/AdminPageInner";

export default function AdminPage() {
  const { loading, isAdmin } = useAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) {
      const t = setTimeout(() => { window.location.href = "/login"; }, 50);
      return () => clearTimeout(t);
    }
  }, [loading, isAdmin]);

  if (loading) return <div className="p-8 text-black">Checking access…</div>;
  if (!isAdmin) return null;

  return <AdminPageInner />;
}
