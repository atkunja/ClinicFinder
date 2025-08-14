"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function DebugAuth() {
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const testAuth = async () => {
    setStatus("Testing Firebase connection...");
    setError("");
    
    try {
      // Test with a simple email/password
      setStatus("Testing sign-in...");
      await signInWithEmailAndPassword(auth, "test@example.com", "password123");
      setStatus("✅ Sign-in successful!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setStatus("❌ Sign-in failed");
      console.error("Auth error:", err);
    }
  };

  const checkConfig = () => {
    setStatus("Checking Firebase config...");
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    console.log("Firebase config:", config);
    const missing = Object.entries(config).filter(([,v]) => !v).map(([k]) => k);
    
    if (missing.length > 0) {
      setError(`Missing config: ${missing.join(', ')}`);
      setStatus("❌ Config incomplete");
    } else {
      setStatus("✅ Config looks good");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Auth Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkConfig}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Check Config
        </button>
        
        <button 
          onClick={testAuth}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Test Sign-in
        </button>
      </div>
      
      <div className="mt-4">
        <p className="font-semibold">Status: {status}</p>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>
      
      <div className="mt-4 text-sm">
        <p>Check the browser console for more details</p>
      </div>
    </div>
  );
}
