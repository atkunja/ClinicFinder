"use client";

import { Suspense } from "react";
import AdminGate from "@/components/AdminGate";
import AdminPageInner from "./ui/AdminPageInner";

/**
 * Admin page
 * - Suspense fixes the CSR bailout error from useSearchParams()
 * - AdminGate already does RequireAuth + allowlist
 */
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-black">Checking access…</div>}>
      <AdminGate>
        <AdminPageInner />
      </AdminGate>
    </Suspense>
  );
}
