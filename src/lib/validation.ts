// Compliant, conservative URL validation. We only ever accept well-formed
// *public profile* URLs. We never fetch, scrape, or attempt to authenticate
// against LinkedIn / Instagram -- see src/lib/profile-source.ts for details.

export function isValidLinkedInUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (!/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (!(host === "linkedin.com" || host.endsWith(".linkedin.com"))) return false;
    return /^\/(in|company)\/[a-zA-Z0-9\-_%.]{2,100}\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

export function isValidInstagramUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (!/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (!(host === "instagram.com" || host.endsWith(".instagram.com"))) return false;
    const reserved = ["p", "explore", "reels", "stories", "accounts", "direct", "tv"];
    const match = url.pathname.match(/^\/([a-zA-Z0-9_.]{1,30})\/?$/);
    if (!match) return false;
    if (reserved.includes(match[1].toLowerCase())) return false;
    return true;
  } catch {
    return false;
  }
}

export interface PersonInput {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  profession?: string;
  location?: string;
  publicBio?: string;
}

export function validatePersonInput(input: Partial<PersonInput>): string[] {
  const errors: string[] = [];
  if (!input.name || input.name.trim().length < 2) {
    errors.push("Full name is required (min 2 characters).");
  }
  if (!input.linkedinUrl || !isValidLinkedInUrl(input.linkedinUrl)) {
    errors.push(
      "Invalid LinkedIn URL. Please provide a public profile link such as https://www.linkedin.com/in/your-name",
    );
  }
  if (!input.instagramUrl || !isValidInstagramUrl(input.instagramUrl)) {
    errors.push(
      "Invalid Instagram URL. Please provide a public profile link such as https://www.instagram.com/yourhandle",
    );
  }
  return errors;
}
