// src/lib/ai.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function toGeminiRole(role: ChatMessage["role" ]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

const clientCache = new Map<string, GoogleGenerativeAI>();

function getClient(apiKey: string) {
  if (!clientCache.has(apiKey)) {
    clientCache.set(apiKey, new GoogleGenerativeAI(apiKey));
  }
  return clientCache.get(apiKey)!;
}

export async function runTriageCompletion({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const client = getClient(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-pro" });

  const res = await model.generateContent({
    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    contents: history.map((message) => ({
      role: toGeminiRole(message.role),
      parts: [{ text: message.content }],
    })),
  });

  const text = res?.response?.text?.().trim?.();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}
