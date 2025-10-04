// src/lib/ai.ts

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type GeminiContent = {
  role: "user" | "model" | "system";
  parts: Array<{ text: string }>;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function toGeminiRole(role: Message["role"]): GeminiContent["role"] {
  if (role === "assistant") return "model";
  return role;
}

export async function runTriageCompletion(messages: Message[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const body = {
    contents: messages.map((m) => ({
      role: toGeminiRole(m.role),
      parts: [{ text: m.content }],
    }) satisfies GeminiContent),
    safetySettings: [
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUAL", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SELF_HARM", threshold: "BLOCK_NONE" },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) {
    throw new Error(json?.error?.message || "Gemini request failed");
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export type ChatMessage = Message;
