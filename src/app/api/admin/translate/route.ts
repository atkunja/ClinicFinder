import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const geminiClient = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (!geminiClient) {
      return NextResponse.json({ error: "Translation service unavailable" }, { status: 503 });
    }

    const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    const response = await model.generateContent({
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are a professional English-to-Spanish translator for a healthcare clinic directory. Translate the following clinic description into natural, clear Spanish. Return ONLY the translated text, no explanation." }],
      },
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: { temperature: 0.1 },
    });

    const translated = response.response?.text?.()?.trim();
    if (!translated) {
      return NextResponse.json({ error: "Translation returned empty" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, summary_es: translated });
  } catch (e: any) {
    console.error("translate-error", e);
    return NextResponse.json({ error: e?.message || "Translation failed" }, { status: 500 });
  }
}
