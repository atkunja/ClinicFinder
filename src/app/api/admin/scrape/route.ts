import type { NextRequest } from "next/server";
import { load } from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Fetch failed (${res.status})` }), {
        status: 502,
      });
    }

    const html = await res.text();
    const $ = load(html);

    // Extract meaningful chunks
    const title = $("h1").first().text().trim() || $("title").text().trim();
    const paragraphs = $("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const allText = paragraphs.join(" ");

    // Heuristic parsing
    const about = paragraphs[0] || "";
    const servicesMatch = allText.match(/services?:?(.+?)(\.|$)/i);
    const eligibilityMatch = allText.match(/eligib(?:le|ility)[^.:]*[:.]?(.+?)(\.|$)/i);
    const costMatch = allText.match(/cost[^.:]*[:.]?(.+?)(\.|$)/i);
    const hoursMatch = allText.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday).+?(\.|$)/i);

    // Build formatted summary
    const formatted = `${title || "This clinic"} is ${about}

• Services: ${servicesMatch ? servicesMatch[1].trim() : "Not specified"}.
• Eligibility: ${eligibilityMatch ? eligibilityMatch[1].trim() : "Not specified"}.
• Cost: ${costMatch ? costMatch[1].trim() : "Not specified"}.
• Hours: ${hoursMatch ? hoursMatch[0].trim() : "Not specified"}.
`;

    return new Response(JSON.stringify({ text: formatted }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Scrape failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
