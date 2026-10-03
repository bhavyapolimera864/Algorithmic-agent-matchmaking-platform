import { analyzeProfile } from "@/lib/gemini";
import { validatePersonInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const errors = validatePersonInput(body);
    if (errors.length > 0) {
      return Response.json({ error: errors.join(" ") }, { status: 400 });
    }

    const name = String(body.name).trim();
    const linkedinUrl = String(body.linkedinUrl).trim();
    const instagramUrl = String(body.instagramUrl).trim();
    const profession = typeof body.profession === "string" ? body.profession.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const publicBio = typeof body.publicBio === "string" ? body.publicBio.trim() : "";

    const result = await analyzeProfile({
      name,
      linkedinUrl,
      instagramUrl,
      profession,
      location,
      publicBio,
    });

    return Response.json(result);
  } catch (err) {
    console.error("POST /api/analyze-preview failed", err);
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return Response.json({ error: `AI analysis failed: ${message}` }, { status: 500 });
  }
}
