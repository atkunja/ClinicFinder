// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

// 1) Read envs safely
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// 2) Helpful errors if missing
if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    [
      "Missing Firebase Admin env vars.",
      `Have you set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local?`,
      "Remember: keep quotes around the PRIVATE KEY and preserve \\n (backslash-n) in the env file.",
    ].join(" ")
  );
}

// 3) Support both raw newlines and escaped \n
if (privateKey?.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
