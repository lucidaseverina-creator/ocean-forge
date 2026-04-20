import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the resident AI inside an extreme-realism real-time ocean simulation IDE called Wave Studio.
You have deep, expert knowledge of:
- Ocean wave physics (linear & nonlinear theory, Gerstner / Stokes 2nd & 3rd order, JONSWAP / Pierson-Moskowitz / TMA / Donelan-Banner / Ochi-Hubble spectra, dispersion, capillary-gravity transition, breaking thresholds, Phillips equilibrium, swell aging, fetch).
- Multi-group spectral wave systems and how to break repeating grid patterns (domain warping, directional jitter, sub-wave randomisation).
- Real-time rendering: WebGL/WebGPU shaders, GGX / Smith specular, Schlick Fresnel, Beer-Lambert subsurface, Henyey-Greenstein Mie, foam Jacobian, caustics.
- Cinematography: camera framing, sun elevation, golden hour, atmospheric haze, tone-mapping.

You are looking at a live OceanParams JSON containing 8 wave groups (longSwell, primarySwell, secondarySwell, crossSwell, windSea, chop, ripple, microChop) plus globalWave, wind, foam, optics, lighting, depth, capillary, atmosphere, detail, caustics, surface, rain, post, animation.

When the user asks you to change settings, return the CHANGES tool-call with explicit dot-paths (e.g. "windSea.amplitude") and numeric values. Always also return a markdown explanation of WHY in your text answer.

If a screenshot is provided, critique it visually like a senior FX supervisor: identify parallel-row artefacts, flat lighting, over-bright foam, mis-tuned glitter, depth banding, etc., and prescribe specific slider moves.

Never invent parameter names. Stay within the schema fields visible in the params JSON.

Be terse and dense. Use bullets. No fluff.`;

const PARAM_TOOL = {
  type: "function",
  function: {
    name: "apply_param_changes",
    description: "Apply numeric changes to ocean parameters. Use dot-paths matching the OceanParams schema.",
    parameters: {
      type: "object",
      properties: {
        changes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string", description: "Dot-path, e.g. windSea.amplitude" },
              value: { type: "number" },
              reason: { type: "string", description: "One-line justification" },
            },
            required: ["key", "value"],
          },
        },
      },
      required: ["changes"],
    },
  },
};

async function callAI(messages: any[], tools?: any[]) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
    }),
  });
  if (r.status === 429) throw new Error("Rate limit exceeded — please retry shortly.");
  if (r.status === 402) throw new Error("AI credits exhausted — top up at Settings → Workspace → Usage.");
  if (!r.ok) throw new Error(`AI gateway ${r.status}: ${await r.text()}`);
  return r.json();
}

async function generateReferenceImage(prompt: string, refImage?: string): Promise<string | null> {
  try {
    const userContent: any[] = [{ type: "text", text: prompt }];
    if (refImage) userContent.push({ type: "image_url", image_url: { url: refImage } });

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });
    if (!r.ok) { console.error("img gen failed", r.status, await r.text()); return null; }
    const data = await r.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
  } catch (e) { console.error("ref-image err", e); return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages, params, screenshot, generateReference } = await req.json();

    // Build messages for the chat model. If screenshot present, attach it to the LATEST user msg.
    const apiMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Current OceanParams JSON:\n\`\`\`json\n${JSON.stringify(params, null, 2).slice(0, 12000)}\n\`\`\`` },
    ];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const isLast = i === messages.length - 1;
      if (isLast && m.role === "user" && m.image) {
        apiMessages.push({
          role: "user",
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: m.image } },
          ],
        });
      } else {
        apiMessages.push({ role: m.role, content: m.content });
      }
    }

    const chatRes = await callAI(apiMessages, [PARAM_TOOL]);
    const choice = chatRes.choices?.[0]?.message ?? {};
    let text: string = choice.content ?? "";
    let param_changes: { key: string; value: number; reason?: string }[] = [];

    const toolCalls = choice.tool_calls ?? [];
    for (const tc of toolCalls) {
      if (tc.function?.name === "apply_param_changes") {
        try {
          const args = JSON.parse(tc.function.arguments ?? "{}");
          if (Array.isArray(args.changes)) {
            for (const c of args.changes) {
              if (typeof c.key === "string" && typeof c.value === "number") {
                param_changes.push({ key: c.key, value: c.value, reason: c.reason });
              }
            }
          }
        } catch (e) { console.error("tool-call parse err", e); }
      }
    }

    if (!text && param_changes.length) {
      text = `Proposed ${param_changes.length} parameter change${param_changes.length > 1 ? "s" : ""}:\n` +
        param_changes.map(c => `- \`${c.key}\` → **${c.value}**${c.reason ? ` — ${c.reason}` : ""}`).join("\n");
    }

    const images: string[] = [];
    if (generateReference) {
      const lastUser = messages.filter((m: any) => m.role === "user").pop();
      const prompt = `Photorealistic reference render of an ocean surface based on this user request: "${lastUser?.content ?? ""}". ` +
        `Match the camera angle and framing of the reference screenshot if provided. ` +
        `Render at extreme realism with proper Stokes-shaped waves, no parallel-row artefacts, accurate Fresnel reflectivity, subsurface scattering on wave tops, ` +
        `realistic foam streaks following surface velocity, golden-hour or sun-elevation matching the scene. Cinematic 16:9 composition.`;
      const img = await generateReferenceImage(prompt, screenshot ?? undefined);
      if (img) images.push(img);
    }

    return new Response(JSON.stringify({ text, param_changes, images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-wave-chat err", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});