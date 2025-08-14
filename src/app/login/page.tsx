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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4 text-center">
          {mode === "login" ? "Log in" : "Sign up"}
        </h1>

        <input
          type="email"
          className="w-full border p-2 rounded mb-3 text-black"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="w-full border p-2 rounded mb-4 text-black"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />

        <button className="w-full bg-emerald-600 text-white p-2 rounded font-bold hover:bg-emerald-700">
          {mode === "login" ? "Log in" : "Create account"}
        </button>

        <div className="my-4 h-px bg-gray-200" />

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full border border-gray-300 text-black p-2 rounded font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={signInWithApple}
          className="w-full border border-gray-300 text-black p-2 rounded font-medium mt-2 hover:bg-gray-50"
        >
          Continue with Apple
        </button>

        {msg && <p className="text-center text-sm text-black mt-3">{msg}</p>}

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-emerald-700 font-semibold hover:underline"
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}
