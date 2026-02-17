// frontend/src/lib/layout-engine.ts
import type { TemplateShape, CampaignData } from "@/lib/types";

type LayoutId = "hero_left" | "hero_center" | "split_bottom_cta" | "minimal_premium";

export type LayoutEngineInput = {
  campaignData: CampaignData;
  canvasWidth: number;   // e.g. 1080
  canvasHeight: number;  // e.g. 1350
  layoutId?: LayoutId;   // optional: if omitted -> random
  seed?: number;         // optional: deterministic randomness
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function makeRng(seed?: number) {
  // simple deterministic RNG if seed provided, else Math.random
  if (typeof seed !== "number") {
    return () => Math.random();
  }
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => (t = (t * 16807) % 2147483647) / 2147483647;
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function uid(prefix = "shape") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * A "text box" helper that your TemplateCanvas can auto-fit + wrap inside.
 * Important: height matters for auto-fit to prevent overflow.
 */
function textShape(opts: Partial<TemplateShape> & {
  dataField: string;
  x: number; y: number; width: number; height: number;
  zIndex: number;
}) : TemplateShape {
  return {
    id: uid("text"),
    type: "text",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    zIndex: opts.zIndex,

    // default typography (TemplateCanvas will auto-fit using shape.fontSize as max)
    fontFamily: opts.fontFamily || "Arial",
    fontWeight: opts.fontWeight ?? 700,
    fontSize: opts.fontSize ?? 52,           // treat as MAX size
    // allow your canvas to shrink further:
    // if your TemplateShape type doesn't include minFontSize, it will still be safe (canvas uses (shape as any).minFontSize)
    ...(opts as any).minFontSize ? { ...(opts as any) } : {},
    textAlign: opts.textAlign || "left",
    padding: opts.padding ?? 16,

    // leave textColor undefined to allow auto color (white/black) in canvas
    textColor: opts.textColor,

    // keep background transparent (we are NOT using overlay panels now)
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",

    opacity: opts.opacity ?? 1,
    shadowBlur: 0,
    shadowX: 0,
    shadowY: 0,
    shadowColor: "transparent",

    dataField: opts.dataField as any,
  } as TemplateShape;
}

function bulletGroupShape(opts: Partial<TemplateShape> & {
  x: number; y: number; width: number; height: number;
  zIndex: number;
}) : TemplateShape {
  return {
    id: uid("bullets"),
    type: "bullet-group",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    zIndex: opts.zIndex,

    fontFamily: opts.fontFamily || "Arial",
    fontWeight: opts.fontWeight ?? 600,
    fontSize: opts.fontSize ?? 34,           // MAX
    // your canvas uses (shape as any).minFontSize
    ...(opts as any).minFontSize ? { ...(opts as any) } : {},
    padding: opts.padding ?? 18,

    // bullets settings
    bulletMarker: (opts as any).bulletMarker || "•",
    bulletIndent: (opts as any).bulletIndent ?? 0,
    bulletSpacing: (opts as any).bulletSpacing ?? 18,

    textColor: opts.textColor, // allow auto if undefined
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    opacity: opts.opacity ?? 1,
  } as TemplateShape;
}

/** Optional: subtle premium tag/pill behind CTA (designer-y but not required) */
function roundedRect(opts: Partial<TemplateShape> & {
  x: number; y: number; width: number; height: number;
  zIndex: number;
  backgroundColor: string;
}) : TemplateShape {
  return {
    id: uid("rect"),
    type: "rounded-rect",
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    zIndex: opts.zIndex,
    backgroundColor: opts.backgroundColor,
    borderRadius: (opts as any).borderRadius ?? 22,
    borderWidth: 0,
    borderColor: "transparent",
    opacity: opts.opacity ?? 0.9,
    shadowBlur: (opts as any).shadowBlur ?? 16,
    shadowX: (opts as any).shadowX ?? 0,
    shadowY: (opts as any).shadowY ?? 10,
    shadowColor: (opts as any).shadowColor ?? "rgba(0,0,0,0.18)",
  } as TemplateShape;
}

/**
 * Layout recipes
 * We keep things simple:
 * - consistent paddings
 * - clear reading order
 * - give each text area a real bounding height so auto-fit works
 */
function layoutHeroLeft(rng: () => number, W: number, H: number): TemplateShape[] {
  const pad = Math.round(W * 0.07);     // ~75px on 1080
  const gap = Math.round(H * 0.03);     // ~40px
  const colW = W - pad * 2;

  // tiny variations so it doesn't look the same every time
  const topShift = Math.round((rng() - 0.5) * 40);
  const hookMax = 64 + Math.round(rng() * 10); // slight size variation

  let y = pad + topShift;

  const hookBoxH = Math.round(H * 0.23);       // big area for headline
  const subBoxH  = Math.round(H * 0.12);
  const bulletsH = Math.round(H * 0.30);
  const proofH   = Math.round(H * 0.12);
  const ctaH     = Math.round(H * 0.10);

  const shapes: TemplateShape[] = [];

  shapes.push(textShape({
    x: pad,
    y,
    width: colW,
    height: hookBoxH,
    zIndex: 10,
    dataField: "hook",
    fontSize: hookMax,
    // important: allow shrink far enough
    ...( { minFontSize: 30 } as any ),
    fontWeight: 800,
    textAlign: "left",
    padding: 10,
  }));

  y += hookBoxH + gap;

  shapes.push(textShape({
    x: pad,
    y,
    width: Math.round(colW * 0.92),
    height: subBoxH,
    zIndex: 11,
    dataField: "subheading",
    fontSize: 36,
    ...( { minFontSize: 18 } as any ),
    fontWeight: 600,
    padding: 8,
  }));

  y += subBoxH + gap;

  shapes.push(bulletGroupShape({
    x: pad,
    y,
    width: Math.round(colW * 0.95),
    height: bulletsH,
    zIndex: 12,
    fontSize: 34,
    ...( { minFontSize: 18 } as any ),
    padding: 12,
    bulletSpacing: 18,
  } as any));

  y += bulletsH + gap;

  shapes.push(textShape({
    x: pad,
    y,
    width: Math.round(colW * 0.90),
    height: proofH,
    zIndex: 13,
    dataField: "proof",
    fontSize: 28,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 600,
    padding: 8,
  }));

  // CTA near bottom, left aligned
  y = H - pad - ctaH;

  // optional pill behind CTA (very subtle)
  const pillW = Math.round(colW * 0.75);
  const pillH = Math.round(ctaH * 0.85);

  shapes.push(roundedRect({
    x: pad,
    y: y + Math.round((ctaH - pillH) / 2),
    width: pillW,
    height: pillH,
    zIndex: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 28,
    shadowBlur: 18,
    shadowY: 12,
    shadowColor: "rgba(0,0,0,0.18)",
  } as any));

  shapes.push(textShape({
    x: pad + 18,
    y,
    width: pillW - 36,
    height: ctaH,
    zIndex: 20,
    dataField: "cta",
    fontSize: 30,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 800,
    padding: 12,
  }));

  return shapes;
}

function layoutHeroCenter(rng: () => number, W: number, H: number): TemplateShape[] {
  const pad = Math.round(W * 0.08);
  const gap = Math.round(H * 0.03);
  const colW = W - pad * 2;

  const topShift = Math.round((rng() - 0.5) * 50);

  let y = pad + topShift;

  const hookH = Math.round(H * 0.26);
  const subH  = Math.round(H * 0.13);
  const bulletsH = Math.round(H * 0.30);
  const ctaH = Math.round(H * 0.12);

  const shapes: TemplateShape[] = [];

  shapes.push(textShape({
    x: pad,
    y,
    width: colW,
    height: hookH,
    zIndex: 10,
    dataField: "hook",
    fontSize: 72,
    ...( { minFontSize: 30 } as any ),
    fontWeight: 900,
    textAlign: "center",
    padding: 10,
  }));

  y += hookH + gap;

  shapes.push(textShape({
    x: pad,
    y,
    width: colW,
    height: subH,
    zIndex: 11,
    dataField: "subheading",
    fontSize: 38,
    ...( { minFontSize: 18 } as any ),
    fontWeight: 700,
    textAlign: "center",
    padding: 8,
  }));

  y += subH + gap;

  shapes.push(bulletGroupShape({
    x: Math.round(W * 0.12),
    y,
    width: Math.round(W * 0.76),
    height: bulletsH,
    zIndex: 12,
    fontSize: 34,
    ...( { minFontSize: 18 } as any ),
    padding: 12,
    bulletSpacing: 18,
  } as any));

  // CTA bottom center with pill
  const pillW = Math.round(W * 0.78);
  const pillH = Math.round(ctaH * 0.82);
  const ctaY = H - pad - ctaH;

  shapes.push(roundedRect({
    x: Math.round((W - pillW) / 2),
    y: ctaY + Math.round((ctaH - pillH) / 2),
    width: pillW,
    height: pillH,
    zIndex: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 28,
  } as any));

  shapes.push(textShape({
    x: Math.round((W - pillW) / 2) + 18,
    y: ctaY,
    width: pillW - 36,
    height: ctaH,
    zIndex: 20,
    dataField: "cta",
    fontSize: 30,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 800,
    textAlign: "center",
    padding: 12,
  }));

  return shapes;
}

function layoutSplitBottomCTA(rng: () => number, W: number, H: number): TemplateShape[] {
  const pad = Math.round(W * 0.07);
  const gap = Math.round(H * 0.03);

  // Top: hook + sub
  const topH = Math.round(H * 0.45);
  const bottomH = H - topH;

  const shapes: TemplateShape[] = [];

  // Hook (top)
  shapes.push(textShape({
    x: pad,
    y: pad + Math.round((rng() - 0.5) * 30),
    width: W - pad * 2,
    height: Math.round(topH * 0.60),
    zIndex: 10,
    dataField: "hook",
    fontSize: 74,
    ...( { minFontSize: 32 } as any ),
    fontWeight: 900,
    textAlign: "left",
    padding: 10,
  }));

  // Subheading (top)
  shapes.push(textShape({
    x: pad,
    y: pad + Math.round(topH * 0.62),
    width: Math.round((W - pad * 2) * 0.92),
    height: Math.round(topH * 0.30),
    zIndex: 11,
    dataField: "subheading",
    fontSize: 38,
    ...( { minFontSize: 18 } as any ),
    fontWeight: 700,
    padding: 8,
  }));

  // Bottom: bullets + proof + CTA
  const bottomY = topH + Math.round(gap * 0.4);

  shapes.push(bulletGroupShape({
    x: pad,
    y: bottomY,
    width: Math.round(W * 0.86),
    height: Math.round(bottomH * 0.55),
    zIndex: 12,
    fontSize: 34,
    ...( { minFontSize: 18 } as any ),
    padding: 12,
    bulletSpacing: 18,
  } as any));

  shapes.push(textShape({
    x: pad,
    y: bottomY + Math.round(bottomH * 0.58),
    width: Math.round(W * 0.86),
    height: Math.round(bottomH * 0.18),
    zIndex: 13,
    dataField: "proof",
    fontSize: 28,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 700,
    padding: 8,
  }));

  const ctaH = Math.round(bottomH * 0.20);
  const ctaY = H - pad - ctaH;
  const pillW = Math.round(W * 0.80);
  const pillH = Math.round(ctaH * 0.78);

  shapes.push(roundedRect({
    x: pad,
    y: ctaY + Math.round((ctaH - pillH) / 2),
    width: pillW,
    height: pillH,
    zIndex: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 28,
  } as any));

  shapes.push(textShape({
    x: pad + 18,
    y: ctaY,
    width: pillW - 36,
    height: ctaH,
    zIndex: 20,
    dataField: "cta",
    fontSize: 30,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 800,
    padding: 12,
  }));

  return shapes;
}

function layoutMinimalPremium(rng: () => number, W: number, H: number): TemplateShape[] {
  const pad = Math.round(W * 0.08);
  const gap = Math.round(H * 0.035);

  const shapes: TemplateShape[] = [];
  const hookH = Math.round(H * 0.22);
  const bulletsH = Math.round(H * 0.30);
  const ctaH = Math.round(H * 0.12);

  // Hook small-ish but bold, with lots of negative space
  shapes.push(textShape({
    x: pad,
    y: pad + Math.round((rng() - 0.5) * 40),
    width: Math.round(W * 0.72),
    height: hookH,
    zIndex: 10,
    dataField: "hook",
    fontSize: 62,
    ...( { minFontSize: 28 } as any ),
    fontWeight: 900,
    padding: 10,
  }));

  // Bullets mid
  shapes.push(bulletGroupShape({
    x: pad,
    y: pad + hookH + gap,
    width: Math.round(W * 0.78),
    height: bulletsH,
    zIndex: 12,
    fontSize: 32,
    ...( { minFontSize: 18 } as any ),
    padding: 12,
    bulletSpacing: 18,
  } as any));

  // CTA bottom left
  const ctaY = H - pad - ctaH;
  const pillW = Math.round(W * 0.68);
  const pillH = Math.round(ctaH * 0.80);

  shapes.push(roundedRect({
    x: pad,
    y: ctaY + Math.round((ctaH - pillH) / 2),
    width: pillW,
    height: pillH,
    zIndex: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 28,
  } as any));

  shapes.push(textShape({
    x: pad + 18,
    y: ctaY,
    width: pillW - 36,
    height: ctaH,
    zIndex: 20,
    dataField: "cta",
    fontSize: 28,
    ...( { minFontSize: 16 } as any ),
    fontWeight: 800,
    padding: 12,
  }));

  return shapes;
}

export function generateLayoutShapes(input: LayoutEngineInput): {
  layoutId: LayoutId;
  shapes: TemplateShape[];
} {
  const rng = makeRng(input.seed);

  const layouts: LayoutId[] = ["hero_left", "hero_center", "split_bottom_cta", "minimal_premium"];
  const layoutId = input.layoutId || pickOne(rng, layouts);

  const W = input.canvasWidth;
  const H = input.canvasHeight;

  // Safety: prevent impossible dims
  const safeW = clamp(W, 320, 4000);
  const safeH = clamp(H, 320, 6000);

  let shapes: TemplateShape[] = [];

  if (layoutId === "hero_left") shapes = layoutHeroLeft(rng, safeW, safeH);
  if (layoutId === "hero_center") shapes = layoutHeroCenter(rng, safeW, safeH);
  if (layoutId === "split_bottom_cta") shapes = layoutSplitBottomCTA(rng, safeW, safeH);
  if (layoutId === "minimal_premium") shapes = layoutMinimalPremium(rng, safeW, safeH);

  // Ensure increasing zIndex ordering (just in case)
  shapes = shapes.map((s, i) => ({ ...s, zIndex: s.zIndex ?? (10 + i) }));

  return { layoutId, shapes };
}
