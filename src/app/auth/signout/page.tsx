"use client";

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth);
      } catch {}
      router.replace("/");
    })();
  }, [router]);

  return (
    <div className="min-h-[60vh] grid place-items-center text-slate-600">
      Signing out…
    </div>
  );
}
