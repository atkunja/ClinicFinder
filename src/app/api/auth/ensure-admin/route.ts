import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase() || "";

    const allow = (process.env.ADMIN_ALLOWLIST || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAllowed = allow.includes(email);
    if (!isAllowed) return NextResponse.json({ admin: false }, { status: 200 });

    if (!decoded.admin) {
      await adminAuth.setCustomUserClaims(decoded.uid, { admin: true });
    }
    return NextResponse.json({ admin: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
