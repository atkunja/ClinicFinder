"use client";

import { Suspense } from "react";
import AdminGate from "@/components/AdminGate";
import TriageAssistant from "@/components/TriageAssistant";

export default function AdminTriagePage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading triage assistant…</div>}>
      <AdminGate>
        <main className="px-4 pb-16 pt-20 text-white sm:pb-20 sm:pt-24">
          <TriageAssistant />
        </main>
      </AdminGate>
    </Suspense>
  );
}
