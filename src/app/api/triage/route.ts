// src/app/api/triage/route.ts
import { NextResponse } from "next/server";
import { runTriageCompletion, ChatMessage } from "@/lib/ai";

const SYSTEM_PROMPT = `You are the Bibi Foundation intake assistant. Your job is to gather symptoms,
background, urgency signals, and any barriers (transportation, insurance, languages) so you can recommend
the most appropriate type of clinic or specialist. Provide empathetic, plain-language guidance. Avoid
making diagnoses or definitive clinical claims; instead, suggest likely types of care (e.g., dental emergency
clinic, urgent care, mental health counselor) and when to seek emergency services. Summarize the
information you collected and the recommended next steps.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const history = (body?.history ?? []) as ChatMessage[];
    const question = String(body?.question ?? "").trim();
    if (!question) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      ...history.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content ?? ""),
      })),
      { role: "user", content: question },
    ];

    const answer = await runTriageCompletion({
      systemPrompt: SYSTEM_PROMPT,
      history: messages,
    });
    return NextResponse.json({ message: answer });
  } catch (error: any) {
    console.error("triage-error", error);
    return NextResponse.json(
      { error: error?.message || "Triage assistant failed" },
      { status: 500 }
    );
  }
}
