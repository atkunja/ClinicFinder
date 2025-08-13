export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Missing token");
  const decoded = await adminAuth.verifyIdToken(token, true);
  if (!decoded.admin) throw new Error("Forbidden");
  return decoded.uid;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const snap = await adminDb.collection("clinics").get();
    const clinics = snap.docs.map((d) => d.data());
    return NextResponse.json({ clinics });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { id, name, address, services, url, coords } = body || {};
    if (!id || !name || !address || !url || !Array.isArray(services) || !Array.isArray(coords)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await adminDb.collection("clinics").doc(id).set({ id, name, address, services, url, coords });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("clinics").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: 401 });
  }
}
