// src/app/api/admin/clinics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { ClinicDoc } from "@/types/clinic";

function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
function bad(message: string, code = 400) {
  return NextResponse.json({ error: message }, { status: code });
}

// GET /api/admin/clinics -> list all
export async function GET() {
  const snap = await adminDb.collection("clinics").get();
  const rows: (ClinicDoc & { docId: string })[] = snap.docs.map((d) => {
    const data = d.data() as ClinicDoc;
    return { ...data, docId: d.id };
    });
  return ok(rows);
}

// POST /api/admin/clinics -> upsert one clinic (doc id = payload.id)
export async function POST(req: NextRequest) {
  const payload = (await req.json()) as Partial<ClinicDoc>;
  if (!payload?.id) return bad("Missing id");
  if (!payload.name || !payload.address || !payload.url) {
    return bad("Missing required fields (name, address, url)");
  }
  if (
    !Array.isArray(payload.coords) ||
    payload.coords.length !== 2 ||
    typeof payload.coords[0] !== "number" ||
    typeof payload.coords[1] !== "number"
  ) {
    return bad("Invalid coords");
  }

  const docRef = adminDb.collection("clinics").doc(payload.id);
  const data: ClinicDoc = {
    id: payload.id,
    name: payload.name,
    address: payload.address,
    url: payload.url,
    services: Array.isArray(payload.services) ? payload.services : [],
    coords: payload.coords as [number, number],
    summary: payload.summary ?? "",
    slug: payload.slug ?? payload.id,
    nameLower: payload.name.toLowerCase(),
  };

  await docRef.set(data, { merge: true });
  return ok({ ok: true });
}

// DELETE /api/admin/clinics?id=docId
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return bad("Missing id");
  await adminDb.collection("clinics").doc(id).delete();
  return ok({ ok: true });
}
