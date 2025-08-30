// src/app/api/clinics/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import path from "path";
import { promises as fs } from "fs";

function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
function mapJsonRow(c: any, i: number) {
  const coords = Array.isArray(c.coords) && c.coords.length === 2
    ? [Number(c.coords[0]), Number(c.coords[1])]
    : [Number(c.lat ?? 0), Number(c.lng ?? 0)];

  const services = Array.isArray(c.services)
    ? c.services
    : String(c.services ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const id = String(c.id ?? c.slug ?? i);

  return {
    id,
    name: String(c.name ?? ""),
    address: String(c.address ?? ""),
    url: String(c.url ?? ""),
    services,
    coords: coords as [number, number],
    summary: String(c.summary ?? ""),
    slug: String(c.slug ?? id),
    nameLower: String(c.name ?? "").toLowerCase(),
  };
}

// GET: list clinics — try Firestore, then fallback to clinics.json
export async function GET() {
  // 1) Firestore (preferred)
  try {
    const snap = await adminDb.collection("clinics").get();
    const rows = snap.docs.map((d) => {
      const c = d.data() as any;
      const coords = Array.isArray(c.coords) ? c.coords : [c.lat ?? 0, c.lng ?? 0];
      const services = Array.isArray(c.services) ? c.services : [];
      return {
        id: c.id ?? d.id,
        name: c.name ?? "",
        address: c.address ?? "",
        url: c.url ?? "",
        services,
        coords: coords as [number, number],
        summary: c.summary ?? "",
        slug: c.slug ?? d.id,
        nameLower: c.nameLower ?? (c.name ? c.name.toLowerCase() : ""),
      };
    });

    if (rows.length > 0) return ok(rows);
    // If Firestore is reachable but empty, fall through to file.
  } catch {
    // ignore and try file
  }

  // 2) Fallback to local clinics.json in repo root
  try {
    const file = path.join(process.cwd(), "clinics.json");
    const txt = await fs.readFile(file, "utf8");
    const arr = JSON.parse(txt);
    const rows = Array.isArray(arr) ? arr.map(mapJsonRow) : [];
    return ok(rows);
  } catch {
    // nothing to show
    return ok([]);
  }
}

// Public route is read-only
export async function POST() { return NextResponse.json({ error: "Use /api/admin/clinics" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: "Use /api/admin/clinics" }, { status: 405 }); }
