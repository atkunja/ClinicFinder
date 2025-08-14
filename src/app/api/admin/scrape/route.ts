// src/app/api/admin/scrape/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// --- tiny HTML utils (typed) ---------------------------------
function stripTags(htmlIn: string): string {
  let html = htmlIn;
  html = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, " ");
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  html = html.replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  html = html.replace(/<header[\s\S]*?<\/header>/gi, " ");

  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  html = mainMatch?.[1] ?? bodyMatch?.[1] ?? html;

  html = html.replace(/<[^>]+>/g, " ");

  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&quot;": '"',
    "&apos;": "'",
    "&rsquo;": "’",
    "&lsquo;": "‘",
    "&rdquo;": "”",
    "&ldquo;": "“",
    "&mdash;": "—",
    "&ndash;": "–",
  };
  for (const [k, v] of Object.entries(entities)) {
    html = html.replace(new RegExp(k, "g"), v);
  }

  html = html.replace(/\s+/g, " ").trim();
  return html;
}

function takeMeaningful(text: string): string {
  const blacklist = [
    "donate", "newsletter", "cookie", "privacy", "terms",
    "copyright", "all rights reserved", "menu", "login",
    "sponsor", "become a sponsor", "volunteer sign up",
    "website design", "google+"
  ];

  const sliced = text.slice(0, 18000);

  const lines = sliced.split(/(?<=\.)\s+|(?<=\!)\s+|(?<=\?)\s+/);
  const kept = lines.filter((ln) => {
    const l = ln.toLowerCase();
    return !blacklist.some((w) => l.includes(w));
  });

  return kept.join(" ").replace(/\s+/g, " ").trim();
}

function extractBitsForSummary(text: string): string[] {
  const out: string[] = [];

  const addrRe =
    /\b\d{2,5}\s+[A-Za-z0-9.\-'\s]+,\s*[A-Za-z.\s]+,\s*[A-Z]{2}\s*\d{5}(\-\d{4})?\b/;
  const addr = text.match(addrRe)?.[0];
  if (addr) out.push(`Location: ${addr}.`);

  const phoneRe =
    /\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;
  const phone = text.match(phoneRe)?.[0];
  if (phone) out.push(`Phone: ${phone}.`);

  const hoursRe =
    /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b[\s\S]{0,120}?(AM|PM)/gi;
  const hoursMatches = text.match(hoursRe);
  if (hoursMatches && hoursMatches.length) {
    const uniq = Array.from(
      new Set(hoursMatches.map((s) => s.replace(/\s+/g, " ").trim()))
    ).slice(0, 4);
    if (uniq.length) out.push(`Hours: ${uniq.join("; ")}.`);
  }

  const svcKeywords = [
    "primary care",
    "dental",
    "vision",
    "pediatrics",
    "mental health",
    "pharmacy",
    "specialty",
  ];
  const svcFound = svcKeywords.filter((k) =>
    text.toLowerCase().includes(k)
  );
  if (svcFound.length) {
    out.push(`Services: ${svcFound.join(", ")}.`);
  }

  return out;
}

function buildConciseSummary(siteText: string): string {
  const intro =
    "This free/low‑cost clinic serves uninsured and underinsured patients in Southeast Michigan.";
  const bits = extractBitsForSummary(siteText);

  let mission = "";
  const missionRe =
    /\b(our mission|we (believe|serve|provide)|we (help|support)|improving the lives)/i;
  const m = siteText.match(missionRe);
  if (m && typeof m.index === "number") {
    const idx = m.index;
    const slice = siteText.slice(Math.max(0, idx - 120), idx + 200);
    const tidy = slice.replace(/\s+/g, " ").trim();
    const end = tidy.search(/[.!?]\s/);
    mission = end > 40 ? tidy.slice(0, end + 1) : "";
  }

  const lines = [intro, ...bits];
  if (mission) lines.push(mission);

  if (lines.length < 4) {
    lines.push(
      "Walk‑ins may be limited; specialty services often require an appointment."
    );
  }
  if (lines.length < 5) {
    lines.push(
      "Bring a photo ID if available, any medications, and proof of address/income if requested."
    );
  }

  return lines.join(" ").replace(/\s+/g, " ").trim();
}

// ------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing 'url'." }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ClinicFinderBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed (${res.status})` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const cleaned = takeMeaningful(stripTags(html));
    const truncated = cleaned.slice(0, 24000);

    const summary = buildConciseSummary(truncated);

    return NextResponse.json({ text: summary }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to scrape.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
