"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignOutPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth);
        // small delay so user sees feedback before redirect
        setTimeout(() => router.replace("/"), 250);
      } catch (e) {
        console.error(e);
        setErr("Could not sign you out. Please try again.");
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[rgb(247,249,251)] text-slate-900">
      <div className="rounded-2xl border bg-white p-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold">Signing you out…</h1>
        {err && (
          <div className="mt-3 text-sm text-red-600">
            {err}
            <div className="mt-3">
              <button
                onClick={() => router.replace("/")}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
        {/* Fallback if JS is disabled */}
        <noscript>
          <p className="mt-3 text-sm">
            You can safely close this tab or{" "}
            <a href="/" className="underline">
              return home
            </a>.
          </p>
        </noscript>
      </div>
    </main>
  );
}
