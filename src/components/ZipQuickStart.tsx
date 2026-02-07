"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZipQuickStart() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/finder?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">
        Quick search
      </h2>
      <p className="text-xl font-semibold text-slate-900">
        Enter your ZIP code or address to find nearby clinics.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 48201"
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:from-emerald-200 hover:to-cyan-200"
        >
          Search
          <span aria-hidden>→</span>
        </button>
      </div>
      <p className="text-xs text-slate-500">
        No account needed. We never store your location.
      </p>
    </form>
  );
}
