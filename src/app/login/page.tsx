"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  // Keep users signed in across tabs/sessions
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }, []);

  // If already signed in, ensure admin claim & redirect away from login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        // Ask server to set admin claim if allow-listed
        const idToken = await user.getIdToken(true);
        await fetch("/api/auth/ensure-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        // Refresh token to pick up new claim
        const refreshed = await user.getIdTokenResult(true);
        // If admin, go to /admin; otherwise home
        router.replace(refreshed.claims.admin ? "/admin" : "/");
      } catch {
        // Even if claim fails, take them home (non-admin experience)
        router.replace("/");
      }
    });
    return () => unsub();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      // onAuthStateChanged above will handle redirect + claim
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Error";
      setMsg(errorMessage);
    }
  };

  // Google sign-in
  async function signInWithGoogle() {
    setMsg("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged handles the rest
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Google sign-in failed";
      setMsg(errorMessage);
    }
  }

  // Apple sign-in (requires Apple setup; see notes below)
  async function signInWithApple() {
    setMsg("");
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Apple sign-in failed";
      setMsg(errorMessage);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pb-20 pt-20 text-white sm:pb-24 sm:pt-24">
      <div className="glass-panel w-full max-w-md p-6 text-slate-900 sm:p-8">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          {mode === "login" ? "Log in" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Volunteer admins use this portal to keep clinics accurate and compassionate.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-slate-900 shadow-inner shadow-white/40 outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-slate-900 shadow-inner shadow-white/40 outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />

          <button className="w-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="relative my-6 text-center text-xs text-slate-400">
          <span className="bg-white px-3">or</span>
          <div className="absolute left-0 right-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-slate-200" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-emerald-200 hover:text-slate-900"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={signInWithApple}
            className="w-full rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-emerald-200 hover:text-slate-900"
          >
            Continue with Apple
          </button>
        </div>

        {msg && <p className="mt-4 text-center text-sm text-rose-600">{msg}</p>}

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-600 hover:underline"
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </div>
    </main>
  );
}
