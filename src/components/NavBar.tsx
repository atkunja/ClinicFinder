// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdmin } from "@/hooks/useAdmin";

export default function NavBar() {
  const { user, isAdmin } = useAdmin();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Logo" width={48} height={48} priority />
          <span className="text-2xl font-bold text-emerald-700">Healthcare for All</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/finder" className="text-black hover:text-emerald-600 font-medium">Clinic Finder</Link>
          <Link href="/prepare" className="text-black hover:text-emerald-600 font-medium">What to Bring</Link>
          {isAdmin && <Link href="/admin" className="text-black hover:text-emerald-600 font-medium">Admin</Link>}
          {user ? (
            <button onClick={() => signOut(auth)} className="text-black hover:text-emerald-600 font-medium">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-black hover:text-emerald-600 font-medium">Log in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
