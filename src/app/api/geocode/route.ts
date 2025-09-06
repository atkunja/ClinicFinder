// src/app/api/geocode/route.ts
import { NextResponse } from "next/server";

// Simple server-side proxy to OpenStreetMap Nominatim to avoid CORS.
// Please be gentle (rate limit yourself on the client via debounce).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([], { status: 200 });

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");

  const res = await fetch(url.toString(), {
    // Identify your app per Nominatim’s policy
    headers: { "User-Agent": "ClinicFinder/1.0 (admin@yourdomain.example)" },
    // Nominatim requires GET; Next will cache per-request automatically in dev
    next: { revalidate: 60 }, // 1 minute
  });

  if (!res.ok) return NextResponse.json([], { status: res.status });

  const data: any[] = await res.json();
  // Normalize to a compact shape for the client
  const items = data.map((d) => ({
    label: d.display_name as string,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
  return NextResponse.json(items);
}
