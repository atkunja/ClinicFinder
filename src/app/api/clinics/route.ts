// src/app/api/clinics/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { ClinicDoc } from "@/types/clinic";

function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
function bad(message: string, code = 400) {
  return NextResponse.json({ error: message }, { status: code });
}

// GET: list clinics (public-safe subset)
export async function GET() {
  const snap = await adminDb.collection("clinics").get();
  const rows: ClinicDoc[] = snap.docs.map((d) => {
    const c = d.data() as any;
    return {
      id: c.id ?? d.id,
      name: c.name,
      address: c.address,
      url: c.url ?? "",
      services: c.services ?? [],
      coords: c.coords,
      summary: c.summary ?? "",
      slug: c.slug ?? d.id,
      nameLower: c.nameLower ?? c.name?.toLowerCase?.(),
    };
  });
  return ok(rows);
}

// POST/DELETE are disabled on public API
export async function POST() { return bad("Use /api/admin/clinics", 405); }
export async function DELETE() { return bad("Use /api/admin/clinics", 405); }
