// src/app/what-to-bring/page.tsx
import { Suspense } from "react";
import WhatToBringInner from "./page_inner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "What to Bring • Bibi Foundation",
};

export default function WhatToBringPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[60vh] grid place-items-center bg-[rgb(247,249,251)] text-slate-900">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Loading…</div>
            <p className="mt-2 text-sm text-slate-600">
              One moment while we get things ready.
            </p>
          </div>
        </main>
      }
    >
      <WhatToBringInner />
    </Suspense>
  );
}
