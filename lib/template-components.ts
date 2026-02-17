import type { TemplateShape } from "@/lib/types";

/**
 * Premium component presets
 * These are defined on a base canvas (1080x1350) and then scaled to your editor canvas.
 */

const BASE_W = 1080;
const BASE_H = 1350;

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function withDefaults(s: Partial<TemplateShape>): TemplateShape {
  // Ensure every shape has the properties your canvas expects.
  // (Matches the defaults you used in handleAddShape)
  return {
    id: s.id || id("shape"),
    type: s.type as any,
    x: s.x ?? 50,
    y: s.y ?? 50,
    width: s.width ?? 200,
    height: s.height ?? 80,

    backgroundColor: s.backgroundColor,
    borderColor: s.borderColor ?? "#000000",
    borderWidth: s.borderWidth ?? 0,

    textColor: s.textColor ?? "#111111",
    fontSize: s.fontSize ?? 36,
    fontFamily: s.fontFamily ?? "Arial",
    fontWeight: s.fontWeight ?? 700,
    textAlign: s.textAlign ?? "left",
    padding: s.padding ?? 10,

    opacity: s.opacity ?? 1,
    shadowBlur: s.shadowBlur ?? 0,
    shadowX: s.shadowX ?? 0,
    shadowY: s.shadowY ?? 0,
    shadowColor: s.shadowColor ?? "#000000",

    zIndex: s.zIndex ?? 1,

    // very important: map a text shape to a campaignData field
    dataField: s.dataField as any,
  } as TemplateShape;
}

function scaleShapes(
  shapes: TemplateShape[],
  toW: number,
  toH: number,
  fromW: number = BASE_W,
  fromH: number = BASE_H
) {
  const sx = toW / fromW;
  const sy = toH / fromH;

  return shapes.map((s) => ({
    ...s,
    x: Math.round(s.x * sx),
    y: Math.round(s.y * sy),
    width: Math.round(s.width * sx),
    height: Math.round(s.height * sy),
    fontSize: s.fontSize ? Math.max(10, Math.round(s.fontSize * Math.min(sx, sy))) : s.fontSize,
    padding: s.padding ? Math.max(4, Math.round(s.padding * Math.min(sx, sy))) : s.padding,
  }));
}

/**
 * 1) OFFER / DISCOUNT LAYOUT (Coursera-like vibe)
 */
function offerLayoutBase(): TemplateShape[] {
  return [
    // Top small label
    withDefaults({
      id: id("label"),
      type: "text",
      x: 90,
      y: 90,
      width: 700,
      height: 60,
      fontSize: 34,
      fontWeight: 600,
      textColor: "#7a7a7a",
      dataField: "subheading",
      zIndex: 2,
    }),

    // Big headline
    withDefaults({
      id: id("headline"),
      type: "text",
      x: 90,
      y: 170,
      width: 880,
      height: 220,
      fontSize: 76,
      fontWeight: 900,
      textColor: "#111111",
      dataField: "hook",
      zIndex: 3,
    }),

    // Badge background circle
    withDefaults({
      id: id("badge-circle"),
      type: "circle",
      x: 760,
      y: 70,
      width: 260,
      height: 260,
      backgroundColor: "#f5e7ff",
      borderWidth: 0,
      shadowBlur: 12,
      shadowX: 0,
      shadowY: 6,
      shadowColor: "rgba(0,0,0,0.18)",
      zIndex: 2,
    }),

    // Badge text (use proof field)
    withDefaults({
      id: id("badge-text"),
      type: "text",
      x: 790,
      y: 135,
      width: 220,
      height: 160,
      fontSize: 42,
      fontWeight: 900,
      textAlign: "center",
      textColor: "#111111",
      dataField: "proof",
      zIndex: 3,
    }),

    // Decorative “burst” circles (fake confetti)
    withDefaults({
      id: id("burst1"),
      type: "circle",
      x: 980,
      y: 360,
      width: 70,
      height: 70,
      backgroundColor: "#c7d2ff",
      borderWidth: 0,
      opacity: 0.55,
      zIndex: 1,
    }),
    withDefaults({
      id: id("burst2"),
      type: "circle",
      x: 950,
      y: 420,
      width: 42,
      height: 42,
      backgroundColor: "#ffd1f8",
      borderWidth: 0,
      opacity: 0.65,
      zIndex: 1,
    }),
    withDefaults({
      id: id("burst3"),
      type: "circle",
      x: 1000,
      y: 470,
      width: 28,
      height: 28,
      backgroundColor: "#d3fff5",
      borderWidth: 0,
      opacity: 0.65,
      zIndex: 1,
    }),

    // Bullets
    withDefaults({
      id: id("bullets"),
      type: "bullet-group",
      x: 90,
      y: 450,
      width: 900,
      height: 420,
      fontSize: 40,
      fontWeight: 700,
      textColor: "#333333",
      dataField: "bullets",
      zIndex: 3,
    }),

    // CTA button (rounded rect)
    withDefaults({
      id: id("cta-btn"),
      type: "rounded-rect",
      x: 170,
      y: 980,
      width: 740,
      height: 140,
      backgroundColor: "#0b6bff",
      borderWidth: 0,
      shadowBlur: 18,
      shadowX: 0,
      shadowY: 10,
      shadowColor: "rgba(0,0,0,0.25)",
      zIndex: 2,
    }),
    withDefaults({
      id: id("cta-text"),
      type: "text",
      x: 200,
      y: 1015,
      width: 680,
      height: 80,
      fontSize: 32,
      fontWeight: 800,
      textAlign: "center",
      textColor: "#ffffff",
      dataField: "cta",
      zIndex: 3,
    }),

    // Footer line
    withDefaults({
      id: id("footer-line"),
      type: "rectangle",
      x: 90,
      y: 1200,
      width: 900,
      height: 6,
      backgroundColor: "#d9d9d9",
      borderWidth: 0,
      opacity: 0.8,
      zIndex: 1,
    }),

    // Footer company name
    withDefaults({
      id: id("footer-brand"),
      type: "text",
      x: 90,
      y: 1230,
      width: 900,
      height: 60,
      fontSize: 28,
      fontWeight: 700,
      textAlign: "center",
      textColor: "#9a9a9a",
      dataField: "companyName",
      zIndex: 2,
    }),
  ];
}

/**
 * 2) HERO PRODUCT LAYOUT (Galaxy-like vibe)
 * Uses a big number + big headline + CTA + image placeholder rectangle
 * (Later you’ll upgrade to a true "image" shape type.)
 */
function heroProductBase(): TemplateShape[] {
  return [
    // Big number background
    withDefaults({
      id: id("big-number"),
      type: "text",
      x: 60,
      y: 40,
      width: 360,
      height: 260,
      fontSize: 220,
      fontWeight: 900,
      textColor: "rgba(0,0,0,0.12)",
      dataField: "proof", // temporary: you can change in inspector to a fixed text later
      zIndex: 1,
    }),

    // Main headline
    withDefaults({
      id: id("hero-headline"),
      type: "text",
      x: 300,
      y: 120,
      width: 720,
      height: 260,
      fontSize: 72,
      fontWeight: 900,
      textColor: "#111111",
      dataField: "hook",
      zIndex: 3,
    }),

    // Subheading
    withDefaults({
      id: id("hero-sub"),
      type: "text",
      x: 300,
      y: 340,
      width: 720,
      height: 110,
      fontSize: 34,
      fontWeight: 600,
      textColor: "#6b6b6b",
      dataField: "subheading",
      zIndex: 3,
    }),

    // Hero image placeholder panel (for now rectangle)
    withDefaults({
      id: id("image-panel"),
      type: "rounded-rect",
      x: 130,
      y: 520,
      width: 820,
      height: 520,
      backgroundColor: "#ededed",
      borderWidth: 0,
      shadowBlur: 22,
      shadowX: 0,
      shadowY: 12,
      shadowColor: "rgba(0,0,0,0.22)",
      zIndex: 2,
    }),

    // Note text inside image panel (optional)
    withDefaults({
      id: id("image-note"),
      type: "text",
      x: 170,
      y: 750,
      width: 740,
      height: 120,
      fontSize: 28,
      fontWeight: 700,
      textAlign: "center",
      textColor: "#777777",
      dataField: "location",
      zIndex: 3,
    }),

    // CTA pill
    withDefaults({
      id: id("hero-cta"),
      type: "rounded-rect",
      x: 610,
      y: 1120,
      width: 380,
      height: 120,
      backgroundColor: "#111111",
      borderWidth: 0,
      shadowBlur: 18,
      shadowX: 0,
      shadowY: 10,
      shadowColor: "rgba(0,0,0,0.22)",
      zIndex: 2,
    }),
    withDefaults({
      id: id("hero-cta-text"),
      type: "text",
      x: 630,
      y: 1148,
      width: 340,
      height: 80,
      fontSize: 30,
      fontWeight: 800,
      textAlign: "center",
      textColor: "#ffffff",
      dataField: "cta",
      zIndex: 3,
    }),
  ];
}

export type PremiumComponentKey = "offer" | "hero";

export function getPremiumComponent(
  key: PremiumComponentKey,
  canvasWidth: number,
  canvasHeight: number
): TemplateShape[] {
  let base: TemplateShape[] = [];
  if (key === "offer") base = offerLayoutBase();
  if (key === "hero") base = heroProductBase();
  return scaleShapes(base, canvasWidth, canvasHeight);
}
