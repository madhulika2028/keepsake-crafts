// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(text: string): any | null {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
  if (s !== -1 && e > s) { try { return JSON.parse(cleaned.slice(s, e + 1)); } catch (_) {} }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const { imageUrl } = await req.json().catch(() => ({}));
    if (!imageUrl || typeof imageUrl !== "string") {
      return json(400, { error: "imageUrl (string) is required" });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json(500, { error: "LOVABLE_API_KEY not configured" });

    const prompt = `You are a print-quality expert for a personalized gifting studio.
Analyze the attached photo for print suitability at up to 12x16 inches.

Return STRICT JSON only (no prose, no markdown fences):
{
  "score": <integer 0-100>,
  "verdict": "excellent" | "good" | "acceptable" | "poor",
  "resolution": "high" | "medium" | "low",
  "blur": "sharp" | "slight" | "blurry",
  "lighting": "great" | "ok" | "poor",
  "issues": ["short issue 1", "short issue 2"],
  "suggestions": ["short actionable tip 1", "short actionable tip 2"],
  "summary": "one friendly sentence for the customer"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Lovable AI error", aiRes.status, errText);
      if (aiRes.status === 429) return json(429, { error: "Rate limit — try again shortly." });
      if (aiRes.status === 402) return json(402, { error: "AI credits exhausted." });
      return json(502, { error: `AI gateway failed (${aiRes.status})`, details: errText });
    }

    const aiJson = await aiRes.json();
    const text = aiJson?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed.score !== "number") {
      console.error("Invalid AI response", text);
      return json(502, { error: "AI response was not valid JSON", raw: text });
    }

    return json(200, parsed);
  } catch (err) {
    console.error("check-photo-quality error", err);
    return json(500, { error: (err as Error).message || "Unexpected error" });
  }
});
