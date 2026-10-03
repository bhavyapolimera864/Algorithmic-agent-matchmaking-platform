/**
 * Compliant public-data collection layer.
 *
 * IMPORTANT / SAFETY NOTE
 * ------------------------
 * This application never scrapes, automates logins against, or bypasses
 * authentication / CAPTCHA / rate-limits on LinkedIn or Instagram. That would
 * violate both platforms' terms of service and the hackathon rules.
 *
 * Instead, the "compliant data collection method" implemented here is:
 *   1. The user supplies the *public* LinkedIn/Instagram URLs for their own
 *      profile (validated to be well-formed public profile links).
 *   2. The user may optionally paste public text they themselves copied from
 *      their own public headline / bio / about section ("publicBio"). This
 *      is first-party, user-provided public content -- not scraped data.
 *   3. That information (name, profession, location, public bio text, and
 *      the profile URLs for reference only) is what gets sent to the AI
 *      model for interest/trait extraction.
 *
 * No private information, login-gated content, or anti-bot bypass is ever
 * attempted. If a user has no public bio text to paste, the agent simply
 * falls back to reasoning from the name/profession/location fields alone.
 */

export interface PublicProfileContext {
  name: string;
  linkedinUrl: string;
  instagramUrl: string;
  profession?: string;
  location?: string;
  publicBio?: string;
}

export function buildPublicContextText(ctx: PublicProfileContext): string {
  const lines: string[] = [];
  lines.push(`Name: ${ctx.name}`);
  if (ctx.profession) lines.push(`Stated profession/headline: ${ctx.profession}`);
  if (ctx.location) lines.push(`Stated location: ${ctx.location}`);
  lines.push(`Public LinkedIn profile URL (reference only, not fetched): ${ctx.linkedinUrl}`);
  lines.push(`Public Instagram profile URL (reference only, not fetched): ${ctx.instagramUrl}`);
  if (ctx.publicBio && ctx.publicBio.trim().length > 0) {
    lines.push(`Public bio / about text provided by the user:\n"""${ctx.publicBio.trim()}"""`);
  } else {
    lines.push(
      "No public bio text was supplied. Infer plausible, general interests only from the name/profession/location above; keep inferences conservative and clearly generic.",
    );
  }
  return lines.join("\n");
}
