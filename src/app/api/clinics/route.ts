import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to your clinics.json
const DATA_PATH = path.join(process.cwd(), "clinics.json");

function readClinics() {
  const file = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(file);
}

function writeClinics(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET: get all clinics
export async function GET() {
  const clinics = readClinics();
  return NextResponse.json(clinics);
}

// POST: add a new clinic (admin only!)
export async function POST(req: NextRequest) {
  const newClinic = await req.json();
  const clinics = readClinics();
  clinics.push(newClinic);
  writeClinics(clinics);
  return NextResponse.json({ status: "ok" });
}

// DELETE: remove a clinic by id
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const clinics = readClinics();
  const updated = clinics.filter((c: any) => c.id !== id);
  writeClinics(updated);
  return NextResponse.json({ status: "ok" });
}
