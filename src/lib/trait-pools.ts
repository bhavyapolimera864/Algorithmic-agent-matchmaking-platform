// Shared trait vocabularies used by both the demo seed generator and the
// deterministic fallback analysis engine (used when Gemini is unavailable).
// Keeping the pools modest in size intentionally produces realistic overlap
// across different people -- which is what lets the compatibility engine
// find genuine shared interests/hobbies instead of relying on randomness.

export const INTERESTS_POOL = [
  "Artificial Intelligence",
  "Travel",
  "Photography",
  "Yoga",
  "Hiking",
  "Cooking",
  "Reading",
  "Music Production",
  "Startups & Entrepreneurship",
  "Sustainability",
  "Fitness & Wellness",
  "Gaming",
  "Fashion & Style",
  "Art & Design",
  "Investing & Personal Finance",
  "Space & Science",
];

export const HOBBIES_POOL = [
  "Rock Climbing",
  "Painting",
  "Playing Guitar",
  "Running",
  "Cycling",
  "Board Games",
  "Scuba Diving",
  "Pottery",
  "Blogging",
  "Surfing",
  "Chess",
  "Gardening",
  "Baking",
  "Stand-up Comedy",
];

export const LIFESTYLE_POOL = [
  "Early Riser",
  "Night Owl",
  "Minimalist",
  "Frequent Traveler",
  "Health-Conscious",
  "Homebody",
  "Social Butterfly",
  "Remote-first Worker",
  "Pet Lover",
  "Foodie",
];

export const PERSONALITY_POOL = [
  "Curious",
  "Ambitious",
  "Empathetic",
  "Analytical",
  "Adventurous",
  "Introverted",
  "Extroverted",
  "Easygoing",
  "Driven",
  "Creative",
  "Pragmatic",
  "Optimistic",
];

export const CAREER_GOALS_POOL = [
  "Building an AI-driven startup",
  "Climbing into executive leadership",
  "Becoming a creative director",
  "Launching a nonprofit initiative",
  "Mastering a creative craft",
  "Transitioning into a tech career",
  "Growing an independent personal brand",
  "Achieving sustainable work-life balance",
];

export const SOCIAL_PREFERENCES_POOL = [
  "Prefers small, close-knit gatherings",
  "Enjoys large social events",
  "Values deep one-on-one conversations",
  "Likes professional networking events",
  "Prefers quiet nights in",
  "Enjoys group travel with friends",
];

export const RELATIONSHIP_PREFERENCES_POOL = [
  "Looking for a long-term partner",
  "Open to casually dating first",
  "Seeks an intellectual connection",
  "Wants someone with shared ambitions",
  "Prioritizes emotional honesty",
  "Looking for an adventure partner",
];

export const DEGREES_POOL = [
  "B.S. Computer Science",
  "B.A. Communications",
  "MBA",
  "B.S. Mechanical Engineering",
  "M.S. Data Science",
  "B.A. Fine Arts",
  "B.S. Business Administration",
  "M.A. Psychology",
];

export const SCHOOLS_POOL = [
  "Stanford University",
  "University of Michigan",
  "UC Berkeley",
  "New York University",
  "University of Toronto",
  "Indian Institute of Technology",
  "National University of Singapore",
  "University College London",
  "Technical University of Munich",
  "University of Sydney",
];

/** Deterministic djb2-style string hash (never random, always reproducible). */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

export function pickMany(pool: string[], seed: string, count: number): string[] {
  const picks: string[] = [];
  const used = new Set<number>();
  let idx = hashString(seed) % pool.length;
  const step = (hashString(`${seed}:step`) % (pool.length - 1 || 1)) + 1;
  let guard = 0;
  while (picks.length < Math.min(count, pool.length) && guard < pool.length * 2) {
    if (!used.has(idx)) {
      used.add(idx);
      picks.push(pool[idx]);
    }
    idx = (idx + step) % pool.length;
    guard++;
  }
  return picks;
}

export function pickOne(pool: string[], seed: string): string {
  return pool[hashString(seed) % pool.length];
}
