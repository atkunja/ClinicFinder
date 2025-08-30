// src/app/api/admin/clinics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import type { ClinicDoc } from "@/types/clinic";

function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
function bad(message: string, code = 400) {
  return NextResponse.json({ error: message }, { status: code });
}

async function assertAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) throw new Error("Missing bearer token");
  const decoded = await adminAuth.verifyIdToken(token);
  if (!(decoded as any).admin) throw new Error("Not admin");
  return decoded;
}

/** Minimal schema-like validator to unblock you without imports */
function validateClinic(body: any): { ok: true; data: ClinicDoc } | { ok: false; msg: string } {
  try {
    if (!body || typeof body !== "object") throw new Error("Payload must be an object");
    const reqd = ["id", "name", "address", "coords"] as const;
    for (const k of reqd) {
      if (!(k in body)) throw new Error(`Missing field: ${k}`);
    }
    const c = body.coords;
    if (!Array.isArray(c) || c.length !== 2 || typeof c[0] !== "number" || typeof c[1] !== "number") {
      throw new Error("coords must be [number, number]");
    }
    if (!Array.isArray(body.services)) body.services = [];
    if (typeof body.name === "string" && !body.nameLower) body.nameLower = body.name.toLowerCase();
    return { ok: true, data: body as ClinicDoc };
  } catch (e: any) {
    return { ok: false, msg: e?.message ?? "Invalid payload" };
  }
}

// GET /api/admin/clinics
export async function GET(req: Request) {
  await assertAdmin(req);
  const snap = await adminDb.collection("clinics").get();
  const rows: (ClinicDoc & { docId: string })[] = snap.docs.map((d) => {
    const data = d.data() as ClinicDoc;
    return { ...data, docId: d.id };
  });
  return ok(rows);
}

// POST /api/admin/clinics
export async function POST(req: Request) {
  await assertAdmin(req);
  const body = await req.json();

  const v = validateClinic(body);
  if (!v.ok) return bad(v.msg, 400);

  const data = v.data;
  const docRef = adminDb.collection("clinics").doc(data.id);
  await docRef.set({ ...data, nameLower: data.name.toLowerCase() }, { merge: true });
  return ok({ ok: true });
}

// DELETE /api/admin/clinics?id=docId
export async function DELETE(req: NextRequest) {
  await assertAdmin(req as unknown as Request);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return bad("Missing id");
  await adminDb.collection("clinics").doc(id).delete();
  return ok({ ok: true });
}
