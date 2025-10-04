import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const modelId = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelId });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Respond with a short acknowledgement so we can confirm Gemini access." }],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 40 },
    });

    const sample = result.response?.text?.()?.trim();
    if (!sample) throw new Error("Gemini returned an empty response");

    return NextResponse.json({ ok: true, model: modelId, sample });
  } catch (error: any) {
    console.error("gemini-health-error", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Gemini health check failed" },
      { status: 500 }
    );
  }
}
