// src/app/api/ingest/route.ts
import { NextResponse } from "next/server";

// If you install the SDK, this import will work; otherwise the route falls back gracefully
// npm i @google/generative-ai
let GoogleGenerativeAI: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ GoogleGenerativeAI } = require("@google/generative-ai"));
} catch {}

export const runtime = "nodejs";

type IngestResult = {
  name?: string;
  address?: string;
  website?: string;
  summary?: string;
  services?: string[];
  languages?: string[];
  eligibility?: string[];
  hours?: Record<string, string>;
  phone?: string;
  coords?: [number, number];
  verified?: boolean;
};

function textBetween(s: string, start: string, end: string) {
  const i = s.indexOf(start);
  if (i === -1) return "";
  const j = s.indexOf(end, i + start.length);
  if (j === -1) return "";
  return s.slice(i + start.length, j).trim();
}

function stripCodeFence(s: string) {
  return s.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
}

function fallbackExtract(html: string, url: string): Partial<IngestResult> {
  const title = textBetween(html, "<title>", "</title>");
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1];
  const phone = (html.match(/\+?1?[\s\-.(]*\d{3}[\s\-.)]*\d{3}[\s\-\.]*\d{4}/) || [])[0];
  const addr = (html.match(/\d{2,5}[^<]{0,60},?\s+[A-Za-z .'-]+,\s*[A-Za-z]{2}\s*\d{5}(-\d{4})?/)
    || html.match(/\d{2,5}[^<]{0,60}\b(MI|Michigan)\b[^<]{0,40}\d{5}(-\d{4})?/i)
    || [])[0];

  const servicesGuess: string[] = [];
  const bag = html.toLowerCase();
  if (bag.includes("dental")) servicesGuess.push("Dental");
  if (bag.includes("pediatric")) servicesGuess.push("Pediatrics");
  if (bag.includes("behavioral") || bag.includes("mental")) servicesGuess.push("Mental Health");
  if (bag.includes("pharmacy")) servicesGuess.push("Pharmacy");
  if (bag.includes("vision") || bag.includes("optom")) servicesGuess.push("Vision");
  if (!servicesGuess.length) servicesGuess.push("Medical");

  return {
    name: title?.trim(),
    address: addr?.trim(),
    website: url,
    summary: metaDesc?.trim(),
    services: Array.from(new Set(servicesGuess)),
    phone: phone?.trim(),
  };
}

async function geocode(address?: string): Promise<[number, number] | undefined> {
  if (!address) return;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    { method: "GET", headers: { "User-Agent": "clinic-finder/1.0" } }
  );
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !data.length) return;
  const { lat, lon } = data[0];
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return;
  return [latNum, lonNum];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // Fetch the site
    const htmlRes = await fetch(url, { method: "GET" });
    const html = await htmlRes.text();

    let result: IngestResult = { website: url };

    // Try Gemini first if key available
    const key = process.env.GEMINI_API_KEY;
    if (key && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are a data extractor for a public healthcare clinic directory. Read the HTML content below and return ONLY a compact JSON object with these keys:

{
  "name": string,
  "address": string,
  "phone": string,
  "website": string,
  "summary": string,
  "services": string[],         // e.g. ["Medical","Dental","Pediatrics","Mental Health","Pharmacy","Vision"]
  "languages": string[],        // e.g. ["English","Spanish"]
  "eligibility": string[],      // e.g. ["Uninsured welcome","Medicaid accepted"]
  "hours": { "Mon": "...", "Tue": "...", "Wed": "...", "Thu": "...", "Fri": "...", "Sat": "...", "Sun": "..." }
}

Rules:
- Prefer concise, user-friendly values.
- If you can't find a field, set it to "" or [] as appropriate.
- DO NOT include any commentary, only JSON.

HTML:
${html.slice(0, 200_000)}
        `.trim();

        const resp = await model.generateContent([{ text: prompt }]);
        const raw = resp.response?.text?.() ?? "";
        const jsonText = stripCodeFence(raw);
        const parsed = JSON.parse(jsonText) as IngestResult;
        result = { ...result, ...parsed, website: parsed.website || url };
      } catch (e) {
        // Continue with fallback
      }
    }

    // Fallback heuristic if missing critical fields
    if (!result.name || !result.address) {
      const fb = fallbackExtract(html, url);
      result = { ...fb, ...result }; // prefer Gemini values, fill gaps with fallback
    }

    // Geocode if coords missing but address present
    if (!result.coords && result.address) {
      const gc = await geocode(result.address);
      if (gc) result.coords = gc;
    }

    // Normalize hours keys to short form if present
    if (result.hours) {
      const map: Record<string, string> = {};
      const keyMap: Record<string, string> = {
        Monday: "Mon", Mon: "Mon",
        Tuesday: "Tue", Tue: "Tue",
        Wednesday: "Wed", Wed: "Wed",
        Thursday: "Thu", Thu: "Thu",
        Friday: "Fri", Fri: "Fri",
        Saturday: "Sat", Sat: "Sat",
        Sunday: "Sun", Sun: "Sun",
      };
      Object.entries(result.hours).forEach(([k, v]) => {
        const kk = keyMap[k] || k;
        map[kk] = String(v || "").trim();
      });
      result.hours = map;
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ingest failed" }, { status: 500 });
  }
}
