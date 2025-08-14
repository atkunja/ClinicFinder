"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";

export default function NavBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setEmail(null);
        return;
      }
      setEmail(user.email);
      // Force refresh to get updated custom claims if ensure-admin just ran
      const tokenResult = await getIdTokenResult(user, true);
      setIsAdmin(Boolean(tokenResult.claims.admin));
    });
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Logo" width={48} height={48} priority />
          <span className="text-2xl font-bold text-emerald-700">
            Healthcare for All
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/finder" className="text-black hover:text-emerald-600 font-medium">
            Clinic Finder
          </Link>
          <Link href="/prepare" className="text-black hover:text-emerald-600 font-medium">
            What to Bring
          </Link>

          {isAdmin && (
            <Link href="/admin" className="text-black hover:text-emerald-600 font-medium">
              Admin
            </Link>
          )}

          {email ? (
            <button
              onClick={() => signOut(auth)}
              className="text-black hover:text-emerald-600 font-medium"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-black hover:text-emerald-600 font-medium">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
