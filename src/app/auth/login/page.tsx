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
    <main className="flex min-h-screen items-center justify-center px-4 pb-20 pt-20 text-white sm:pb-24 sm:pt-24">
      <div className="glass-panel w-full max-w-md p-6 text-slate-900 sm:p-8">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          {mode === "login" ? "Log in" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage clinic updates, verify data, and support our community scheduling efforts.
        </p>

        {err && (
          <div className="mt-5 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {err}
          </div>
        )}

        <form onSubmit={submitEmailPassword} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-slate-900 shadow-inner shadow-white/40 outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-slate-900 shadow-inner shadow-white/40 outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200 disabled:opacity-60"
          >
            {busy
              ? mode === "login"
                ? "Logging in…"
                : "Creating…"
              : mode === "login"
              ? "Log in"
              : "Create account"}
          </button>

          <div className="relative text-center text-xs text-slate-400">
            <span className="bg-white px-3">or</span>
            <div className="absolute left-0 right-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-emerald-200 hover:text-slate-900 disabled:opacity-60"
          >
            Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <button
              className="font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              onClick={() => setMode("signup")}
            >
              Don’t have an account? Sign up
            </button>
          ) : (
            <button
              className="font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
              onClick={() => setMode("login")}
            >
              Have an account? Log in
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
