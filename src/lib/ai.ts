// src/lib/ai.ts

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function runTriageCompletion({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string> {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) throw new Error("OPEN_AI_KEY is not set");

  const model = process.env.OPEN_AI_MODEL ?? "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim?.();
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}
