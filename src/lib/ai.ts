// src/lib/ai.ts

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Intent =
  | "greeting"
  | "closing"
  | "symptom_detail"
  | "contact_info"
  | "unknown";

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

const GREETING_REGEX = /\b(hi|hello|hey|good\s+(?:morning|afternoon|evening)|what's up|help)\b/i;

const CONDITION_PATTERNS: Array<{
  keywords: RegExp;
  condition: string;
  clinic: string;
}> = [
  { keywords: /(burns? when (?:i )?pee|painful urination|dysuria|urinary burning)/i, condition: "possible urinary tract infection", clinic: "primary care or urgent care clinic" },
  { keywords: /(abscess|infection|pus|swollen gum)/i, condition: "possible tooth abscess", clinic: "urgent dental clinic" },
  { keywords: /(broken tooth|chipped tooth|tooth broke)/i, condition: "dental fracture", clinic: "emergency dental clinic" },
  { keywords: /(bleeding gums|gum bleed)/i, condition: "gum disease or gingivitis", clinic: "dental clinic" },
  { keywords: /(shortness of breath|difficulty breathing|tight chest)/i, condition: "respiratory distress", clinic: "urgent care or emergency room" },
  { keywords: /(panic attack|anxiety attack|can't stop thinking)/i, condition: "panic or acute anxiety episode", clinic: "mental health counselor" },
  { keywords: /(depression|hopeless|suicidal)/i, condition: "severe depression", clinic: "mental health crisis center" },
  { keywords: /(rash|hives|itching)/i, condition: "skin rash or allergic reaction", clinic: "urgent care or dermatology" },
  { keywords: /(stomach pain|abdominal pain|cramps)/i, condition: "abdominal pain", clinic: "urgent care or gastroenterology" },
  { keywords: /(pregnant|pregnancy|prenatal)/i, condition: "pregnancy-related concern", clinic: "women's health clinic" },
  { keywords: /(high blood pressure|hypertension)/i, condition: "hypertension", clinic: "primary care clinic" },
];

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

function detectIntent(message: string): Intent {
  if (!message.trim()) return "unknown";
  const lower = message.toLowerCase();
  if (/(thank you|thanks|bye|goodbye|talk later)/i.test(lower)) return "closing";
  if (GREETING_REGEX.test(lower)) return "greeting";
  if (/(address|where.*located|near me|close by)/i.test(lower)) return "contact_info";
  if (lower.length > 10) return "symptom_detail";
  return "unknown";
}

function inferCondition(text: string): { condition: string; clinic: string } | null {
  for (const pattern of CONDITION_PATTERNS) {
    if (pattern.keywords.test(text)) {
      return { condition: pattern.condition, clinic: pattern.clinic };
    }
  }
  return null;
}

function prepareGeminiContents(history: ChatMessage[]) {
  const trimmed = [...history];
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  if (!trimmed.length) return [];
  return trimmed.map((message) => ({
    role: toGeminiRole(message.role),
    parts: [{ text: message.content }],
  }));
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

  const contents = prepareGeminiContents(history);
  if (!contents.length) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      contents,
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
  const durationCues = extractDurations(userTranscript);
  const barriers = detectBarriers(userTranscript);
  const symptomsSummary = summarizeSymptoms(userTranscript);
  const careRecommendation = recommendCare(userTranscript);
  const urgent = EMERGENCY_KEYWORDS.test(userTranscript);
  const intent = detectIntent(latestUser);
  const inferred = inferCondition(userTranscript);

  if (intent === "greeting" && !symptomsSummary || symptomsSummary === "not clearly specified") {
    return "Hello! I’m here to help with medical, dental, and mental health questions. Tell me what symptoms you’re seeing, when they started, and anything that might make it hard to get care.";
  }

  if (!latestUser.trim()) {
    return "Could you share a bit about the symptoms or concerns you want to talk through today?";
  }

  const lines = [
    "Here’s what I’m hearing so far:",
    `• Main concerns: ${symptomsSummary}.`,
    `• Latest details you mentioned: ${latestUser}.`,
    `• Duration clues: ${durationCues.length ? durationCues.join(", ") : "not mentioned"}.`,
    `• Barriers: ${barriers.length ? barriers.join(", ") : "none noted"}.`,
    "",
  ];

  if (inferred) {
    lines.push(
      `Based on what you shared, this could indicate ${inferred.condition}.`,
      `Recommended clinic type: ${inferred.clinic}.`
    );
  } else {
    lines.push(`Recommended clinic type: ${careRecommendation}.`);
  }

  lines.push(
    "",
    urgent
      ? "This sounds urgent. Call 911 or go to the nearest emergency room right away."
      : "Next steps:",
  );

  if (!urgent) {
    lines.push(
      "1. Reach out to the recommended clinic to describe symptoms and ask about availability.",
      "2. Bring photo ID, insurance details (or proof of income if uninsured), and a list of medications.",
      barriers.includes("transport")
        ? "3. Ask the clinic about transportation help or bus vouchers."
        : barriers.includes("language")
        ? "3. Request interpreter support ahead of the visit."
        : "3. Jot down questions about triggers, recent changes, and anything you want the clinician to focus on."
    );
  } else {
    lines.push(
      "If safe, contact someone who can help with transportation and take your medications and ID with you."
    );
  }

  lines.push(
    "",
    "If new warning signs show up—like trouble breathing, severe bleeding, or sudden confusion—seek emergency care immediately."
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

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await callGemini({ systemPrompt, history: historyPayload });
  if (!response) {
    throw new Error("Gemini returned an empty response");
  }

  return response;
}
