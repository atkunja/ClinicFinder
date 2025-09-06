"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

/**
 * We wrap the inner component in Suspense because Next requires it
 * when using `useSearchParams()` in a client page.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] grid place-items-center">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") || "/";

  const [mode, setMode] = useState<"login" | "signup">(
    params?.get("mode") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // If already authed, go where you came from — prevents flashing loop
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace(next);
    });
    return () => unsub();
  }, [router, next]);

  async function submitEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), pw);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), pw);
      }
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || "Failed. Please try again.");
      setBusy(false);
    }
  }

  async function google() {
    setErr("");
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || "Google sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[rgb(247,249,251)] text-slate-900">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-center text-xl font-semibold">
            {mode === "login" ? "Log in" : "Sign up"}
          </h1>

          {err && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={submitEmailPassword} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? (mode === "login" ? "Logging in…" : "Creating…") : mode === "login" ? "Log in" : "Create account"}
            </button>

            <div className="relative my-2 text-center text-xs text-slate-500">
              <span className="bg-white px-2">or</span>
              <div className="absolute left-0 right-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="w-full rounded-xl border px-4 py-2 text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              Continue with Google
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === "login" ? (
              <button
                className="text-emerald-700 underline"
                onClick={() => setMode("signup")}
              >
                Don’t have an account? Sign up
              </button>
            ) : (
              <button
                className="text-emerald-700 underline"
                onClick={() => setMode("login")}
              >
                Have an account? Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
