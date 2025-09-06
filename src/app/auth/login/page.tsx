// src/app/auth/login/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";

export const dynamic = "force-dynamic"; // avoid prerender errors for this client page

export default function LoginPage() {
  return (
    <Suspense fallback={<Screen><Card><Title>Loading sign-in…</Title></Card></Screen>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace(next);
    });
    return () => unsub();
  }, [router, next]);

  async function handleGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.replace(next);
  }

  return (
    <Screen>
      <Card>
        <Title>Sign in</Title>
        <Subtle>Please sign in to access the clinic finder and resources.</Subtle>
        <button
          onClick={handleGoogle}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          Continue with Google
        </button>
      </Card>
    </Screen>
  );
}

/* ---- tiny presentational helpers ---- */

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[70vh] grid place-items-center bg-[rgb(247,249,251)] text-slate-900">
      {children}
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-semibold">{children}</h1>;
}

function Subtle({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-slate-600">{children}</p>;
}
