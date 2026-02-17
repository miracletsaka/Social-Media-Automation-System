import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicChatId, prompts } = body;

    if (!topicChatId || !prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: "Missing topicChatId or prompts array" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Enhance prompts for simple, flat, commercial backgrounds
    const enhancedPrompts = prompts.map((prompt: string) => {
      // Add style modifiers to ensure simple, flat, commercial look
      const basePrompt = prompt.trim();
      
      // Force simple, flat, realistic style
      const enhancedPrompt = `Dark green and black futuristic SaaS background with glowing emerald gradient, soft vignette lighting, smooth layered rounded shapes, abstract glassmorphism panels, subtle spotlight glow in center, premium tech advertisement background, modern automation software branding, minimal noise, high depth, soft reflections, clean negative space for UI mockup, professional marketing poster background, cinematic composition, 3D lighting effect, background only, no text, no devices, no icons
 on ${basePrompt}, flat graphic design, background only, no text, no objects,no phone,empty center space,minimal design, no illustration style, no cartoon, solid colors only, clean minimal commercial advertisement background, professional social media post style, portrait orientation`;
      
      return enhancedPrompt;
    });

    // Generate images for each enhanced prompt
    const images = await Promise.all(
      enhancedPrompts.map(async (enhancedPrompt: string, index: number) => {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1792",      // ✅ Portrait format (4:5 ratio) instead of square
            quality: "standard",     // ✅ Use "hd" for higher quality (costs more)
            style: "natural",        // ✅ CRITICAL: "natural" for realistic, NOT "vivid" (which creates cartoon-like)
            response_format: "b64_json",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`[v0] DALL-E error for prompt ${index}:`, error);
          throw new Error(error.error?.message || "Failed to generate image");
        }

        const data = await response.json();
        const base64 = data.data[0].b64_json;
        const dataUrl = `data:image/png;base64,${base64}`;

        return {
          url: dataUrl,
          prompt: prompts[index], // Return original prompt, not enhanced
          revisedPrompt: data.data[0].revised_prompt, // DALL-E 3 often revises prompts
          generatedAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("[v0] Background generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate backgrounds" },
      { status: 500 }
    );
  }
}