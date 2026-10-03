import { buildSummary, deriveTraitsFromSeed } from "@/lib/trait-engine";
import type { ProfileAnalysis } from "@/lib/types";

export interface DemoPersonSeed {
  name: string;
  profession: string;
  location: string;
  linkedinUrl: string;
  instagramUrl: string;
  avatarSeed: string;
  publicBio: string;
  analysis: ProfileAnalysis;
}

const BASE_PEOPLE: Array<{ name: string; profession: string; location: string }> = [
  { name: "Alex Johnson", profession: "Software Engineer", location: "San Francisco, CA" },
  { name: "Priya Sharma", profession: "Product Manager", location: "Bangalore, India" },
  { name: "Rahul Mehta", profession: "Data Scientist", location: "Austin, TX" },
  { name: "Ananya Gupta", profession: "UX Designer", location: "Seattle, WA" },
  { name: "Jordan Lee", profession: "Marketing Manager", location: "New York, NY" },
  { name: "Maria Garcia", profession: "Physician", location: "Miami, FL" },
  { name: "Liam O'Connor", profession: "Architect", location: "Dublin, Ireland" },
  { name: "Sofia Rossi", profession: "Photographer", location: "Boston, MA" },
  { name: "Kenji Tanaka", profession: "Research Scientist", location: "Singapore" },
  { name: "Fatima Al-Sayed", profession: "Financial Analyst", location: "London, UK" },
  { name: "Noah Williams", profession: "Startup Founder", location: "Denver, CO" },
  { name: "Emma Davis", profession: "Registered Nurse", location: "Chicago, IL" },
  { name: "Lucas Silva", profession: "Civil Engineer", location: "Toronto, Canada" },
  { name: "Mei Chen", profession: "Graphic Designer", location: "Portland, OR" },
  { name: "Omar Hassan", profession: "Corporate Lawyer", location: "Berlin, Germany" },
  { name: "Isabella Martinez", profession: "Executive Chef", location: "Los Angeles, CA" },
  { name: "Ethan Brown", profession: "Mechanical Engineer", location: "Amsterdam, Netherlands" },
  { name: "Aaliyah Washington", profession: "High School Teacher", location: "Atlanta, GA" },
  { name: "Daniel Kim", profession: "Musician", location: "Nashville, TN" },
  { name: "Chloe Martin", profession: "Film Director", location: "Sydney, Australia" },
  { name: "Arjun Patel", profession: "Fitness Coach", location: "Mumbai, India" },
  { name: "Grace Thompson", profession: "Veterinarian", location: "Vancouver, Canada" },
  { name: "Mohammed Khan", profession: "Pharmacist", location: "Dubai, UAE" },
  { name: "Olivia Wilson", profession: "HR Business Partner", location: "Chicago, IL" },
  { name: "Ravi Kumar", profession: "Journalist", location: "Delhi, India" },
  { name: "Hannah Schmidt", profession: "Sales Director", location: "Munich, Germany" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function handlify(name: string): string {
  const parts = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  return parts.join(".");
}

export const DEMO_PEOPLE: DemoPersonSeed[] = BASE_PEOPLE.map((base) => {
  const seedKey = `${base.name}|${base.profession}`;
  const traits = deriveTraitsFromSeed(seedKey);
  const summary = buildSummary(base.name, base.profession, traits.interests, traits.hobbies);

  const analysis: ProfileAnalysis = {
    name: base.name,
    profession: base.profession,
    location: base.location,
    ...traits,
    summary,
  };

  const slug = slugify(base.name);
  const handle = handlify(base.name);

  return {
    name: base.name,
    profession: base.profession,
    location: base.location,
    linkedinUrl: `https://www.linkedin.com/in/${slug}`,
    instagramUrl: `https://www.instagram.com/${handle}`,
    avatarSeed: slug,
    publicBio: `[DEMO/SAMPLE DATA] ${base.name} is a ${base.profession.toLowerCase()} based in ${base.location}. This is synthetic sample text used for the Agentic Dating demo -- it was not collected from any real public profile.`,
    analysis,
  };
});
