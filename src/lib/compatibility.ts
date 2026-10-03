import type { AgentProfile, CompatibilityBreakdown, MatchComputation } from "@/lib/types";

/**
 * Deterministic, explainable agent-to-agent compatibility engine.
 *
 * This NEVER uses randomness. Every score is derived from actual overlap
 * and complementarity between the two agents' AI-extracted traits (which
 * themselves came from Gemini or the deterministic fallback analysis).
 * This keeps the ~300+ pairwise evaluations for 26 seeded people instant
 * and reproducible, while still being a genuine reasoning process driven by
 * each agent's profile -- exactly the "agent reasoning strategy" described
 * in each agent's `compatibilityStrategy`.
 */

function overlap(a: string[], b: string[]): string[] {
  const bLower = new Set(b.map((x) => x.toLowerCase()));
  return a.filter((x) => bLower.has(x.toLowerCase()));
}

function jaccardPercent(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 55;
  const setA = new Set(a.map((x) => x.toLowerCase()));
  const setB = new Set(b.map((x) => x.toLowerCase()));
  const inter = [...setA].filter((x) => setB.has(x)).length;
  // Overlap coefficient (intersection / smaller set size) is more generous
  // and realistic than Jaccard for short trait lists -- sharing 3 of 5
  // interests should read as strong compatibility, not a middling score.
  const minSize = Math.min(setA.size, setB.size) || 1;
  const ratio = inter / minSize;
  // Rescale so zero overlap still feels plausible (~22) and full overlap
  // reads as a near-perfect match (~97).
  return Math.round(22 + ratio * 75);
}

const COMPLEMENTARY_PAIRS: Array<[string, string]> = [
  ["Introverted", "Extroverted"],
  ["Early Riser", "Night Owl"],
  ["Driven", "Easygoing"],
  ["Analytical", "Creative"],
];

function personalityScore(a: string[], b: string[]): number {
  const base = jaccardPercent(a, b);
  let complementBonus = 0;
  for (const [x, y] of COMPLEMENTARY_PAIRS) {
    const hasPair =
      (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x));
    if (hasPair) complementBonus += 6;
  }
  return Math.max(0, Math.min(100, base + complementBonus));
}

function careerScore(
  professionA: string,
  professionB: string,
  careerGoalsA: string[],
  careerGoalsB: string[],
): number {
  const goalOverlap = jaccardPercent(careerGoalsA, careerGoalsB);
  const sameProfession =
    professionA.trim().toLowerCase() === professionB.trim().toLowerCase() &&
    professionA.trim().length > 0;
  return Math.max(0, Math.min(100, goalOverlap + (sameProfession ? 8 : 0)));
}

function decisionFromScore(score: number): string {
  if (score >= 85) return "Exceptional Match";
  if (score >= 70) return "Strong Match";
  if (score >= 55) return "Promising Match";
  if (score >= 40) return "Possible Match";
  return "Low Compatibility";
}

export function computeCompatibility(
  nameA: string,
  agentA: AgentProfile,
  professionA: string,
  nameB: string,
  agentB: AgentProfile,
  professionB: string,
): MatchComputation {
  const sharedInterests = overlap(agentA.interests, agentB.interests);
  const sharedHobbies = overlap(agentA.hobbies, agentB.hobbies);
  const sharedLifestyle = overlap(agentA.lifestyle, agentB.lifestyle);
  const sharedSocial = overlap(agentA.socialPreferences, agentB.socialPreferences);
  const sharedRelationship = overlap(
    agentA.relationshipPreferences,
    agentB.relationshipPreferences,
  );

  const breakdown: CompatibilityBreakdown = {
    interests: jaccardPercent(agentA.interests, agentB.interests),
    lifestyle: jaccardPercent(agentA.lifestyle, agentB.lifestyle),
    personality: personalityScore(agentA.personality, agentB.personality),
    hobbies: jaccardPercent(agentA.hobbies, agentB.hobbies),
    career: careerScore(professionA, professionB, agentA.careerGoals, agentB.careerGoals),
  };

  const weightedAverage =
    breakdown.interests * 0.3 +
    breakdown.lifestyle * 0.2 +
    breakdown.personality * 0.2 +
    breakdown.hobbies * 0.15 +
    breakdown.career * 0.15;

  // Synergy bonus: when an agent pair aligns strongly across *multiple*
  // dimensions at once (not just one), reward that compounding fit -- this
  // is what produces the standout 85-95% "exceptional match" pairs that a
  // purely averaged score would otherwise flatten out.
  const strongDimensions = Object.values(breakdown).filter((v) => v >= 70).length;
  const synergyBonus = strongDimensions >= 4 ? 10 : strongDimensions === 3 ? 6 : strongDimensions === 2 ? 3 : 0;

  const score = Math.round(weightedAverage + synergyBonus);

  const firstA = nameA.split(" ")[0];
  const firstB = nameB.split(" ")[0];

  const reasons: string[] = [];
  sharedInterests
    .slice(0, 3)
    .forEach((i) => reasons.push(`Both are genuinely interested in ${i}.`));
  sharedHobbies
    .slice(0, 2)
    .forEach((h) => reasons.push(`They share a hobby: ${h}.`));
  sharedLifestyle
    .slice(0, 2)
    .forEach((l) => reasons.push(`Compatible lifestyle trait: ${l}.`));
  if (sharedSocial.length > 0) {
    reasons.push(`Similar social preferences: ${sharedSocial[0]}.`);
  }
  if (sharedRelationship.length > 0) {
    reasons.push(`Aligned on relationship goals: ${sharedRelationship[0]}.`);
  }
  for (const [x, y] of COMPLEMENTARY_PAIRS) {
    if (
      (agentA.personality.includes(x) && agentB.personality.includes(y)) ||
      (agentA.personality.includes(y) && agentB.personality.includes(x))
    ) {
      reasons.push(`Complementary personalities: one is ${x.toLowerCase()}, the other ${y.toLowerCase()}.`);
    }
  }
  if (reasons.length === 0) {
    reasons.push(
      `${firstA} and ${firstB} have different day-to-day interests, but both bring distinct strengths worth exploring.`,
    );
  }

  const concerns: string[] = [];
  if (sharedInterests.length === 0) {
    concerns.push("No directly overlapping interests were detected.");
  }
  if (sharedHobbies.length === 0) {
    concerns.push("Limited shared hobbies to bond over right away.");
  }
  if (
    professionA.trim().length > 0 &&
    professionB.trim().length > 0 &&
    professionA.trim().toLowerCase() !== professionB.trim().toLowerCase()
  ) {
    concerns.push(`Different professional fields: ${professionA} vs. ${professionB}.`);
  }
  if (agentA.lifestyle.includes("Early Riser") && agentB.lifestyle.includes("Night Owl")) {
    concerns.push("Different daily schedules (early riser vs. night owl).");
  }
  if (agentB.lifestyle.includes("Early Riser") && agentA.lifestyle.includes("Night Owl")) {
    concerns.push("Different daily schedules (early riser vs. night owl).");
  }
  if (sharedRelationship.length === 0) {
    concerns.push("Relationship expectations may need to be discussed openly.");
  }
  if (concerns.length === 0) {
    concerns.push("No significant concerns detected by the agents.");
  }

  const conversationTopics = [...new Set([...sharedInterests, ...sharedHobbies])].slice(0, 5);
  if (conversationTopics.length === 0) {
    conversationTopics.push(agentA.interests[0] ?? "Life goals", agentB.interests[0] ?? "Travel stories");
  }

  const decision = decisionFromScore(score);

  const topic = conversationTopics[0] ?? "shared interests";
  const concernLine = concerns[0];
  const conversation = [
    {
      speaker: "A" as const,
      text: `Hi, I'm ${firstA}'s agent. Reviewing ${firstB}'s profile now — I can already see potential around ${topic}.`,
    },
    {
      speaker: "B" as const,
      text:
        sharedInterests.length > 0
          ? `I'm ${firstB}'s agent. Agreed — we both care about ${sharedInterests.slice(0, 2).join(" and ")}. That's a great starting point.`
          : `I'm ${firstB}'s agent. Our interests differ a bit, but ${firstA} sounds intriguing — let's look deeper at lifestyle and values.`,
    },
    {
      speaker: "A" as const,
      text:
        sharedHobbies.length > 0
          ? `They also both enjoy ${sharedHobbies[0]} — that's a natural way to connect in person.`
          : `Lifestyle compatibility looks at ${breakdown.lifestyle}%, and personality compatibility is at ${breakdown.personality}%.`,
    },
    {
      speaker: "B" as const,
      text: `One thing worth flagging: ${concernLine.toLowerCase()} Still, overall compatibility computes to ${score}%.`,
    },
    {
      speaker: "A" as const,
      text:
        score >= 70
          ? `I'd recommend moving forward — this looks like a ${decision.toLowerCase()}.`
          : `I'll log this as a ${decision.toLowerCase()} and keep evaluating other agents.`,
    },
  ];

  return {
    score: Math.max(1, Math.min(99, score)),
    breakdown,
    sharedInterests,
    sharedHobbies,
    reasons: reasons.slice(0, 6),
    concerns: concerns.slice(0, 4),
    conversationTopics,
    conversation,
    decision,
  };
}
