// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Product = { id: string; name: string; category: string; price: string };

const CATALOG: Product[] = [
  { id: "wood-frame", name: "Custom Wood Frame", category: "frames", price: "₹499" },
  { id: "photo-mug", name: "Personalized Mug", category: "accessories", price: "₹299" },
  { id: "polaroid", name: "Polaroid Prints (Set of 12)", category: "prints", price: "₹349" },
  { id: "tote", name: "Printed Tote Bag", category: "apparel", price: "₹449" },
  { id: "tshirt", name: "Custom T-Shirt", category: "apparel", price: "₹599" },
  { id: "memory-book", name: "Memory Book", category: "books", price: "₹899" },
  { id: "photo-strip", name: "Photo Strip", category: "prints", price: "₹199" },
  { id: "gift-box", name: "Personalized Gift Box", category: "gifting", price: "₹1,199" },
];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(text: string): any | null {
  // Strip code fences and locate first {...} block.
  const cleaned = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch (_) {}
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const { occasion, recipientInterests, budget } = await req.json().catch(() => ({}));

    if (!occasion || !recipientInterests) {
      return json(400, { error: "occasion and recipientInterests are required" });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json(500, { error: "GEMINI_API_KEY is not configured" });

    const catalogText = CATALOG.map(
      (p) => `- ${p.id} | ${p.name} | category: ${p.category} | price: ${p.price}`
    ).join("\n");

    const prompt = `You are a thoughtful gifting expert for Framely, a personalized gifting studio.

Occasion: ${occasion}
Recipient interests: ${recipientInterests}
Budget: ${budget || "not specified"}

Choose the 3 BEST-matching products from this catalog:
${catalogText}

Return STRICT JSON only, no prose, no markdown fences. Shape:
{"recommendations":[{"productId":"<id from catalog>","reason":"<1-2 sentence personal reason>"}]}

Rules:
- Use exactly 3 items.
- productId MUST be one of the catalog ids above.
- Reasons must reference the occasion or interests.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error", geminiRes.status, errText);
      return json(502, { error: `Gemini API failed (${geminiRes.status})`, details: errText });
    }

    const geminiJson = await geminiRes.json();
    const text: string =
      geminiJson?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

    const parsed = extractJson(text);
    if (!parsed || !Array.isArray(parsed.recommendations)) {
      console.error("Invalid Gemini response", text);
      return json(502, { error: "AI response was not valid JSON", raw: text });
    }

    const matched = parsed.recommendations
      .map((r: any) => {
        const product = CATALOG.find((p) => p.id === r.productId);
        if (!product) return null;
        return { ...product, reason: String(r.reason || "") };
      })
      .filter(Boolean);

    if (matched.length === 0) {
      return json(502, { error: "No matching products from AI response", raw: parsed });
    }

    // Log to database (best-effort — never fail the response over logging).
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      let userId: string | null = null;
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = userData?.user?.id ?? null;
      }

      await supabase.from("recommendations_log").insert({
        user_id: userId,
        occasion,
        recipient_interests: recipientInterests,
        budget: budget ?? null,
        returned_product_ids: matched.map((m: any) => m.id),
        ai_response: parsed,
      });
    } catch (logErr) {
      console.error("Failed to log recommendation", logErr);
    }

    return json(200, { recommendations: matched });
  } catch (err) {
    console.error("recommend-gifts error", err);
    return json(500, { error: (err as Error).message || "Unexpected error" });
  }
});
