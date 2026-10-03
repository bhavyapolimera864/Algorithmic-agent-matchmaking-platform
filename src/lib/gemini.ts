import { buildPublicContextText, type PublicProfileContext } from "@/lib/profile-source";
import { buildSummary, deriveTraitsFromSeed } from "@/lib/trait-engine";
import type { AnalysisSource, ProfileAnalysis } from "@/lib/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    profession: { type: "STRING" },
    location: { type: "STRING" },
    education: { type: "ARRAY", items: { type: "STRING" } },
    interests: { type: "ARRAY", items: { type: "STRING" } },
    hobbies: { type: "ARRAY", items: { type: "STRING" } },
    personality_traits: { type: "ARRAY", items: { type: "STRING" } },
    lifestyle: { type: "ARRAY", items: { type: "STRING" } },
    career_goals: { type: "ARRAY", items: { type: "STRING" } },
    social_preferences: { type: "ARRAY", items: { type: "STRING" } },
    relationship_preferences: { type: "ARRAY", items: { type: "STRING" } },
    summary: { type: "STRING" },
  },
  required: [
    "name",
    "profession",
    "location",
    "education",
    "interests",
    "hobbies",
    "personality_traits",
    "lifestyle",
    "career_goals",
    "social_preferences",
    "relationship_preferences",
    "summary",
  ],
};

function buildPrompt(ctx: PublicProfileContext): string {
  return `You are "Agentic Dating"'s profile analysis AI agent. You only ever work with information the user has explicitly provided or marked as publicly available. You never infer private information, and you never claim to have browsed or scraped LinkedIn/Instagram.

Analyze the following publicly-provided information about a person and extract structured dating-relevant traits.

${buildPublicContextText(ctx)}

Return ONLY a JSON object matching this exact schema (arrays should have 3-6 concise items each, written in title case, no duplicates):
{
  "name": string,
  "profession": string,
  "location": string,
  "education": string[],
  "interests": string[],
  "hobbies": string[],
  "personality_traits": string[],
  "lifestyle": string[],
  "career_goals": string[],
  "social_preferences": string[],
  "relationship_preferences": string[],
  "summary": string (2-3 sentences, warm and specific, written in third person)
}`;
}

function coerceStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const arr = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    if (arr.length > 0) return arr.slice(0, 8);
  }
  return fallback;
}

function coerceAnalysis(raw: unknown, ctx: PublicProfileContext): ProfileAnalysis {
  const fallback = fallbackAnalysis(ctx);
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  return {
    name: typeof r.name === "string" && r.name.trim() ? r.name : fallback.name,
    profession:
      typeof r.profession === "string" && r.profession.trim() ? r.profession : fallback.profession,
    location: typeof r.location === "string" && r.location.trim() ? r.location : fallback.location,
    education: coerceStringArray(r.education, fallback.education),
    interests: coerceStringArray(r.interests, fallback.interests),
    hobbies: coerceStringArray(r.hobbies, fallback.hobbies),
    personality_traits: coerceStringArray(r.personality_traits, fallback.personality_traits),
    lifestyle: coerceStringArray(r.lifestyle, fallback.lifestyle),
    career_goals: coerceStringArray(r.career_goals, fallback.career_goals),
    social_preferences: coerceStringArray(r.social_preferences, fallback.social_preferences),
    relationship_preferences: coerceStringArray(
      r.relationship_preferences,
      fallback.relationship_preferences,
    ),
    summary: typeof r.summary === "string" && r.summary.trim() ? r.summary : fallback.summary,
  };
}

export function fallbackAnalysis(ctx: PublicProfileContext): ProfileAnalysis {
  const seedKey = `${ctx.name}|${ctx.profession ?? ""}`;
  const traits = deriveTraitsFromSeed(seedKey);
  const profession = ctx.profession?.trim() || "Professional";
  const location = ctx.location?.trim() || "Location not specified";
  return {
    name: ctx.name,
    profession,
    location,
    ...traits,
    summary: buildSummary(ctx.name, profession, traits.interests, traits.hobbies),
  };
}

export async function analyzeProfile(
  ctx: PublicProfileContext,
): Promise<{ analysis: ProfileAnalysis; source: AnalysisSource; note: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      analysis: fallbackAnalysis(ctx),
      source: "fallback",
      note: "GEMINI_API_KEY is not configured, so Agentic Dating used its deterministic fallback reasoning engine instead of calling Gemini.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(ctx) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Gemini API error ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response.");

    const parsed = JSON.parse(text);
    return {
      analysis: coerceAnalysis(parsed, ctx),
      source: "gemini",
      note: `Analyzed live by Google ${GEMINI_MODEL} using the publicly provided profile context.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling Gemini.";
    return {
      analysis: fallbackAnalysis(ctx),
      source: "fallback",
      note: `Gemini API call failed (${message}). Agentic Dating automatically used its deterministic fallback reasoning engine so the demo keeps working.`,
    };
  }
}
