// src/app/finder/page.tsx
import { Suspense } from "react";
import FinderInner from "./page_inner";

// Tell Next this route is fully dynamic (no prerender) and never revalidates
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FinderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] grid place-items-center bg-[rgb(247,249,251)] text-slate-900">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Loading finder…</div>
            <p className="mt-2 text-sm text-slate-600">
              One moment while we load clinics and your location tools.
            </p>
          </div>
        </main>
      }
    >
      <FinderInner />
    </Suspense>
  );
}
