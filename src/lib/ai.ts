// src/lib/ai.ts

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DURATION_REGEX = /(\d+\s*(?:minutes?|hours?|days?|weeks?|months?|years?))/gi;
const BARRIER_KEYWORDS = [
  { key: "transport", aliases: ["transport", "bus", "ride", "car"] },
  { key: "insurance", aliases: ["insurance", "uninsured", "medicaid", "no coverage"] },
  { key: "language", aliases: ["language", "spanish", "arabic", "translator", "interpret"] },
];

const CARE_PATTERNS: Array<{ keywords: RegExp; recommendation: string }> = [
  { keywords: /(tooth|teeth|dental|gum|cavity|jaw|filling)/i, recommendation: "dental clinic or emergency dentist" },
  { keywords: /(pregnan|ob\b|prenatal|postpartum)/i, recommendation: "OB-GYN or women's health clinic" },
  { keywords: /(mental|anxiety|depress|therapy|counselor|psych)/i, recommendation: "mental health counselor or psychiatrist" },
  { keywords: /(rash|fever|infection|cough|flu|cold)/i, recommendation: "urgent care or community health center" },
  { keywords: /(vision|eye|optom|glaucoma)/i, recommendation: "vision clinic or optometrist" },
  { keywords: /(vaccin|immunization|shots)/i, recommendation: "primary care or public health clinic" },
  { keywords: /(injury|fracture|sprain|break|stitches)/i, recommendation: "urgent care or emergency clinic" },
];

const EMERGENCY_KEYWORDS = /(chest pain|shortness of breath|trouble breathing|can't breathe|stroke|numbness on one side|loss of vision|severe bleeding|suicidal|overdose|unconscious)/i;

const TRIAGE_SERVICE_URL = process.env.TRIAGE_SERVICE_URL;
const TRIAGE_SERVICE_KEY = process.env.TRIAGE_SERVICE_KEY;

const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const OPEN_AI_MODEL = process.env.OPEN_AI_MODEL ?? "gpt-4o-mini";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

function collectUserText(history: ChatMessage[]): string {
  return history
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join("\n");
}

function extractDurations(text: string): string[] {
  const matches = text.match(DURATION_REGEX) || [];
  return Array.from(new Set(matches.map((d) => d.toLowerCase())));
}

function detectBarriers(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const { key, aliases } of BARRIER_KEYWORDS) {
    if (aliases.some((alias) => lower.includes(alias))) {
      hits.push(key);
    }
  }
  return hits;
}

function recommendCare(text: string): string {
  for (const pattern of CARE_PATTERNS) {
    if (pattern.keywords.test(text)) {
      return pattern.recommendation;
    }
  }
  return "community health clinic or primary care provider";
}

function summarizeSymptoms(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stopWords = new Set([
    "the","and","but","with","have","has","had","for","about","that","this","they","them","been","felt","feeling","feel","pain","issue","issues",
  ]);
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 4 || stopWords.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  return ranked.length ? ranked.join(", ") : "not clearly specified";
}

async function callCustomService({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string | null> {
  if (!TRIAGE_SERVICE_URL) return null;

  const res = await fetch(TRIAGE_SERVICE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(TRIAGE_SERVICE_KEY ? { Authorization: `Bearer ${TRIAGE_SERVICE_KEY}` } : {}),
    },
    body: JSON.stringify({ systemPrompt, history }),
  });

  if (!res.ok) {
    throw new Error(`Custom triage service failed (${res.status})`);
  }

  const payload = await res.json().catch(() => null);
  const message = typeof payload?.message === "string" ? payload.message.trim() : null;
  return message && message.length ? message : null;
}

async function callOpenAI({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string | null> {
  if (!OPEN_AI_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_AI_KEY}`,
    },
    body: JSON.stringify({
      model: OPEN_AI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim?.();
  return text && text.length ? text : null;
}

function toGeminiRole(role: ChatMessage["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

async function callGemini({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      contents: history.map((message) => ({
        role: toGeminiRole(message.role),
        parts: [{ text: message.content }],
      })),
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini request failed (${res.status})`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
        .join("\n")
        .trim()
    : null;
  return text && text.length ? text : null;
}

function buildHeuristicResponse(history: ChatMessage[]): string {
  const userTranscript = collectUserText(history);
  const latestUser = [...history].reverse().find((msg) => msg.role === "user")?.content ?? "";
  const durations = extractDurations(userTranscript);
  const barriers = detectBarriers(userTranscript);
  const symptomsSummary = summarizeSymptoms(userTranscript);
  const careRecommendation = recommendCare(userTranscript);
  const urgent = EMERGENCY_KEYWORDS.test(userTranscript);

  const lines = [
    "Here's what I captured so far:",
    `• Key concerns mentioned: ${symptomsSummary}.`,
    `• Most recent details: ${latestUser || "no new information provided yet."}`,
    `• Duration cues: ${durations.length ? durations.join(", ") : "not mentioned"}.`,
    `• Reported barriers: ${barriers.length ? barriers.join(", ") : "none noted"}.`,
    "",
    "Recommended next steps:",
  ];

  if (urgent) {
    lines.push(
      "1. Symptoms sound urgent. Call 911 or go to the nearest emergency room immediately.",
      "2. If safe to do so, contact a trusted person or emergency contact to assist with transportation.",
      "3. Bring any medications, ID, and insurance or financial aid documents with you."
    );
  } else {
    lines.push(
      `1. Follow up with a ${careRecommendation} to review symptoms in detail.`,
      "2. Bring photo ID, insurance documents (or proof of income if uninsured), and a current medication list.",
      barriers.includes("transport")
        ? "3. Ask about transportation programs or bus vouchers when you call."
        : barriers.includes("language")
        ? "3. Request interpreter support or language services ahead of the visit."
        : "3. Prepare questions about symptom changes, triggers, and available community resources."
    );
  }

  lines.push(
    "",
    "Reminder: If new warning signs appear (difficulty breathing, severe bleeding, sudden confusion), seek emergency care right away."
  );

  return lines.join("\n");
}

export async function runTriageCompletion({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: ChatMessage[];
}): Promise<string> {
  const historyPayload: ChatMessage[] = history.map((msg) => ({
    role: msg.role,
    content: String(msg.content ?? ""),
  }));

  const attempts: Array<() => Promise<string | null>> = [];

  if (TRIAGE_SERVICE_URL) {
    attempts.push(() => callCustomService({ systemPrompt, history: historyPayload }));
  }

  if (GEMINI_API_KEY) {
    attempts.push(() => callGemini({ systemPrompt, history: historyPayload }));
  }

  if (OPEN_AI_KEY) {
    attempts.push(() => callOpenAI({ systemPrompt, history: historyPayload }));
  }

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) {
        return result;
      }
    } catch (error) {
      console.error("triage-external-error", error);
    }
  }

  return buildHeuristicResponse(historyPayload);
}
