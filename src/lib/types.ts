// Shared TypeScript types used across the backend (API routes), the
// compatibility reasoning engine, and the frontend pages.

export interface ProfileAnalysis {
  name: string;
  profession: string;
  location: string;
  education: string[];
  interests: string[];
  hobbies: string[];
  personality_traits: string[];
  lifestyle: string[];
  career_goals: string[];
  social_preferences: string[];
  relationship_preferences: string[];
  summary: string;
}

export type AnalysisSource = "gemini" | "fallback" | "demo-seed";

export interface CompatibilityBreakdown {
  interests: number;
  lifestyle: number;
  personality: number;
  hobbies: number;
  career: number;
}

export interface ConversationLine {
  speaker: "A" | "B";
  text: string;
}

export interface MatchComputation {
  score: number;
  breakdown: CompatibilityBreakdown;
  sharedInterests: string[];
  sharedHobbies: string[];
  reasons: string[];
  concerns: string[];
  conversationTopics: string[];
  conversation: ConversationLine[];
  decision: string;
}

export interface MatchHighlight {
  matchId?: number;
  personAId: number;
  personAName: string;
  personBId: number;
  personBName: string;
  score: number;
  decision: string;
  sharedInterests: string[];
}

export interface AgentProfile {
  interests: string[];
  hobbies: string[];
  personality: string[];
  lifestyle: string[];
  careerGoals: string[];
  socialPreferences: string[];
  relationshipPreferences: string[];
  summary: string;
  compatibilityStrategy: string;
}
