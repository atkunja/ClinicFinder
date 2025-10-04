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
        <main className="grid min-h-[70vh] place-items-center px-4 pt-24 text-white">
          <div className="glass-panel w-full max-w-md p-8 text-slate-900">
            <div className="text-lg font-semibold">Loading finder…</div>
            <p className="mt-2 text-sm text-slate-600">
              One moment while we prepare the clinic map and search tools for you.
            </p>
          </div>
        </main>
      }
    >
      <FinderInner />
    </Suspense>
  );
}
