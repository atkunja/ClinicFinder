import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

type IngestResult = {
  name?: string;
  address?: string;
  website?: string;
  phone?: string;
  summary?: string;
  services?: string[];
  languages?: string[];
  eligibility?: string[];
  hours?: Record<string, string>;
  coords?: [number, number];
};

function stripCodeFence(s: string) {
  return s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

const LANG_LIST = [
  "English","Spanish","Arabic","French","Chinese","Mandarin","Cantonese",
  "Hindi","Urdu","Bengali","Russian","Portuguese","Vietnamese","Korean",
  "Japanese","German","Italian","Polish","Somali","Swahili","Amharic",
  "Farsi","Persian","Pashto","Turkish","Ukrainian"
];

function guessLanguages(html: string): string[] {
  const lower = html.toLowerCase();
  const hits = new Set<string>();
  for (const lang of LANG_LIST) if (new RegExp(`\\b${lang}\\b`, "i").test(lower)) hits.add(lang);
  return Array.from(hits);
}

function guessHours(html: string): Record<string,string> | undefined {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n");
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  const map: Record<string,string> = {};
  const dayMap: Record<string,string> = {
    monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu",
    friday:"Fri", saturday:"Sat", sunday:"Sun",
    mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun",
  };
  for (const line of lines) {
    const m = line.match(/^(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\s*[:\-–]\s*(.+)$/i);
    if (m) {
      const key = dayMap[m[1].toLowerCase()];
      if (key) map[key] = m[2].trim();
    }
  }
  return Object.keys(map).length ? map : undefined;
}

function fallbackExtract(html: string, url: string): Partial<IngestResult> {
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1];
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1];
  const phone = (html.match(/\+?1?[\s\-.(]*\d{3}[\s\-.)]*\d{3}[\s\-\.]*\d{4}/) || [])[0];
  const addr =
    (html.match(/\d{2,5}[^<,\n]{0,60},\s*[A-Za-z .'-]+,\s*[A-Za-z]{2}\s*\d{5}(-\d{4})?/)
     || html.match(/\d{2,5}[^<\n]{0,80}\b(MI|Michigan)\b[^<\n]{0,40}\d{5}(-\d{4})?/i)
     || [])[0];

  const bag = html.toLowerCase();
  const services: string[] = [];
  if (bag.includes("dental")) services.push("Dental");
  if (bag.includes("pediatric")) services.push("Pediatrics");
  if (bag.includes("behavioral") || bag.includes("mental")) services.push("Mental Health");
  if (bag.includes("pharmacy")) services.push("Pharmacy");
  if (bag.includes("vision") || bag.includes("optom")) services.push("Vision");
  if (!services.length) services.push("Medical");

  const languages = guessLanguages(html);
  const hours = guessHours(html);

  return {
    name: title?.trim(),
    summary: metaDesc?.trim(),
    address: addr?.trim(),
    phone: phone?.trim(),
    website: url,
    services: Array.from(new Set(services)),
    languages,
    hours,
  };
}

async function geocode(address?: string): Promise<[number, number] | undefined> {
  if (!address) return;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    { headers: { "User-Agent": "clinic-finder/1.0" } }
  );
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !data.length) return;
  const la = parseFloat(data[0].lat), lo = parseFloat(data[0].lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return;
  return [la, lo];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteUrl = searchParams.get("url");
    if (!siteUrl) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const r = await fetch(siteUrl, { headers: { "User-Agent": "clinic-finder/1.0" } });
    const html = await r.text();

    let out: IngestResult | null = null;
    const key = process.env.GEMINI_API_KEY;

    if (key) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
Return ONLY compact JSON for a public clinic's details from the HTML below.

Keys:
name,address,phone,website,summary,
services[],languages[],eligibility[],
hours{Mon,Tue,Wed,Thu,Fri,Sat,Sun}

- Prefer short, human-friendly values.
- If unknown: empty string or [].
- Website must be the original URL if not found.

HTML_START
${html.slice(0, 200000)}
HTML_END
`.trim();
        const resp = await model.generateContent([{ text: prompt }]);
        const json = stripCodeFence(resp.response.text());
        out = JSON.parse(json) as IngestResult;
        if (!out.website) out.website = siteUrl;
      } catch {
        // swallow → fallback
      }
    }

    const fb = fallbackExtract(html, siteUrl);
    const merged: IngestResult = { website: siteUrl, ...fb, ...(out || {}) };

    if (merged.hours) {
      const norm: Record<string,string> = {};
      const m: Record<string,string> = {
        Monday:"Mon", Mon:"Mon", Tuesday:"Tue", Tue:"Tue",
        Wednesday:"Wed", Wed:"Wed", Thursday:"Thu", Thu:"Thu",
        Friday:"Fri", Fri:"Fri", Saturday:"Sat", Sat:"Sat",
        Sunday:"Sun", Sun:"Sun",
      };
      for (const [k,v] of Object.entries(merged.hours)) norm[m[k] || k] = (v || "").trim();
      merged.hours = norm;
    }

    if (!merged.coords && merged.address) {
      const gc = await geocode(merged.address);
      if (gc) merged.coords = gc;
    }

    return NextResponse.json({ ok: true, data: merged });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ingest failed" }, { status: 500 });
  }
}
