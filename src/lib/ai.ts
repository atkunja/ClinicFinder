// src/lib/ai.ts

import OpenAI from "openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const clientCache = new Map<string, OpenAI>();

function getClient(apiKey: string) {
  if (!clientCache.has(apiKey)) {
    clientCache.set(apiKey, new OpenAI({ apiKey }));
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
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) throw new Error("OPEN_AI_KEY is not set");

  const client = getClient(apiKey);
  const model = process.env.OPEN_AI_MODEL ?? "gpt-4o-mini";

  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((message) => ({ role: message.role, content: message.content })),
    ],
    temperature: 0.2,
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}
