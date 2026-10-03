import type { AgentProfile, ProfileAnalysis } from "@/lib/types";

export function buildAgentProfile(name: string, analysis: ProfileAnalysis): AgentProfile {
  const firstName = name.split(" ")[0] || name;
  const topInterests = analysis.interests.slice(0, 2).join(" and ") || "new experiences";
  const topLifestyle = analysis.lifestyle[0] || "a balanced lifestyle";
  const topRelationshipPref =
    analysis.relationship_preferences[0] || "a genuine, compatible connection";

  const compatibilityStrategy = `Represents ${firstName} by prioritizing partners who share a passion for ${topInterests}, align on a ${topLifestyle.toLowerCase()} lifestyle, and are seeking ${topRelationshipPref.toLowerCase()}. Weighs shared interests and hobbies most heavily, then lifestyle and personality fit, before considering career alignment.`;

  return {
    interests: analysis.interests,
    hobbies: analysis.hobbies,
    personality: analysis.personality_traits,
    lifestyle: analysis.lifestyle,
    careerGoals: analysis.career_goals,
    socialPreferences: analysis.social_preferences,
    relationshipPreferences: analysis.relationship_preferences,
    summary: `As ${firstName}'s AI dating agent, I represent someone who ${analysis.summary.charAt(0).toLowerCase()}${analysis.summary.slice(1)}`,
    compatibilityStrategy,
  };
}
