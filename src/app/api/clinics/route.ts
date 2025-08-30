// src/app/api/clinics/route.ts
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok<T>(data: T, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function mapJsonRow(c: any, i: number) {
  const coords = Array.isArray(c.coords) && c.coords.length === 2
    ? [Number(c.coords[0]), Number(c.coords[1])]
    : [Number(c.lat ?? 0), Number(c.lng ?? 0)];

  const services = Array.isArray(c.services)
    ? c.services
    : String(c.services ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const id = String(c.id ?? c.slug ?? i);
  const name = String(c.name ?? "");
  return {
    id,
    name,
    address: String(c.address ?? ""),
    url: String(c.url ?? ""),
    services,
    coords: coords as [number, number],
    summary: String(c.summary ?? ""),
    slug: String(c.slug ?? id),
    nameLower: name.toLowerCase(),
  };
}

async function tryFirestore(): Promise<any[] | null> {
  // Only attempt if admin env likely exists
  if (
    !process.env.FIREBASE_PROJECT_ID &&
    !process.env.GOOGLE_CLOUD_PROJECT &&
    !process.env.FIREBASE_ADMIN_PROJECT_ID
  ) {
    return null;
  }
  try {
    const { adminDb } = await import("@/lib/firebaseAdmin");
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
        nameLower: c.nameLower ?? (c.name ? String(c.name).toLowerCase() : ""),
      };
    });
    return rows;
  } catch {
    return null;
  }
}

async function tryLocalFile(): Promise<any[]> {
  try {
    const file = path.join(process.cwd(), "clinics.json");
    const txt = await fs.readFile(file, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr.map(mapJsonRow) : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const fromDb = await tryFirestore();
  if (fromDb && fromDb.length > 0) return ok(fromDb);

  const fromFile = await tryLocalFile();
  return ok(fromFile);
}

// Public route is read-only
export async function POST() {
  return ok({ error: "Use /api/admin/clinics" }, 405);
}
export async function DELETE() {
  return ok({ error: "Use /api/admin/clinics" }, 405);
}
