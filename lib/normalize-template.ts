function normalizeTemplateFromApi(t: any) {
  const safeParse = (v: any, fallback: any) => {
    if (!v) return fallback
    if (typeof v === "object") return v
    if (typeof v === "string") {
      try { return JSON.parse(v) } catch { return fallback }
    }
    return fallback
  }

  return {
    id: String(t.id),
    name: t.name || "",
    description: t.description || "",
    shapes: safeParse(t.shapes_json ?? t.shapes, []),
    canvasWidth: Number(t.canvas_width ?? t.canvasWidth ?? 1200),
    canvasHeight: Number(t.canvas_height ?? t.canvasHeight ?? 675),
    backgroundImage: t.background_image ?? t.backgroundImage ?? null,
    logoPlacement: safeParse(t.logo_placement_json ?? t.logoPlacement, undefined),
    thumbnailUrl: t.thumbnail_url ?? t.thumbnailUrl ?? null,
    previewUrl: t.preview_url ?? t.previewUrl ?? null,
    createdAt: t.created_at ?? t.createdAt ?? null,
    updatedAt: t.updated_at ?? t.updatedAt ?? null,
  }
}
