"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TemplateCanvas from "@/components/template-canvas";
import { Template, CampaignData } from "@/lib/types";
import { Download, ArrowLeft, FileCheck, ImagePlus, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { generateLayoutShapes } from "@/lib/layout-engine";
import type { TemplateShape } from "@/lib/types";
import { uploadFileToSpaces } from "@/lib/upload-client";
import {
  attachMediaToContentItem,
  getTopicChat,
  getDraftById,
  getTemplateById,
} from "@/lib/api";
import CampaignDataForm from "@/components/campaign-data-form";

/* ---------------- utils ---------------- */

function safeDecodeURIComponent(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function normalizeUrlCandidate(v: string | null): string | null {
  if (!v) return null;
  const x = String(v).trim();
  if (!x) return null;
  if (x === "null" || x === "undefined") return null;
  return safeDecodeURIComponent(x);
}

function pickRandom(arr: string[]) {
  if (!arr?.length) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i] || null;
}

function safeArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x || "").trim()).filter(Boolean);

  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x || "").trim()).filter(Boolean);
      }
    } catch {}
    if (v.includes(",")) return v.split(",").map((x) => x.trim()).filter(Boolean);
    if (v.includes("\n")) return v.split("\n").map((x) => x.trim()).filter(Boolean);
    return [v.trim()].filter(Boolean);
  }
  return [];
}

function safeHashtags(v: any): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.map((x) => String(x || "").trim()).filter(Boolean).join(" ");
  return String(v || "").trim();
}

/**
 * ✅ Map DB draft -> CampaignData used by TemplateCanvas
 * ✅ NO localStorage/sessionStorage fallback (DB only)
 */
function buildCampaignDataFromDraft(draft: any): CampaignData {
  const s = draft?.structured || {};

  return {
    hook: (s.hook ?? "").toString(),
    subheading: (s.subheading ?? "").toString(),
    bullets: safeArray(s.bullets).slice(0, 3),
    proof: (s.proof ?? "").toString(),
    cta: (s.cta ?? "").toString(),
    ctaLink: (s.ctaLink ?? "").toString(),
    hashtags: safeHashtags(draft?.hashtags ?? s.hashtags ?? ""),
    companyName: (s.companyName ?? "NEUROFLOW").toString(),
    location: (s.location ?? "MARKETING").toString(),
    links: [],
  } as CampaignData;
}

/**
 * ✅ Force portrait rendering always
 */
const PORTRAIT_W = 1080;
const PORTRAIT_H = 1350;

/**
 * ✅ When template shapes were authored for another base size,
 * scale x/y/w/h and typography so nothing overlaps/crushes.
 */
function scaleTemplateShapes(
  shapes: TemplateShape[],
  fromW: number,
  fromH: number,
  toW: number,
  toH: number
): TemplateShape[] {
  const sx = toW / fromW;
  const sy = toH / fromH;
  const sFont = Math.min(sx, sy);

  return (shapes || []).map((sh) => {
    const anySh: any = sh;
    return {
      ...sh,
      x: (sh.x || 0) * sx,
      y: (sh.y || 0) * sy,
      width: (sh.width || 0) * sx,
      height: (sh.height || 0) * sy,

      fontSize: sh.fontSize ? Math.round(sh.fontSize * sFont) : sh.fontSize,
      padding: sh.padding ? Math.round(sh.padding * sFont) : sh.padding,

      borderWidth: sh.borderWidth ? Math.max(1, Math.round(sh.borderWidth * sFont)) : sh.borderWidth,
      borderRadius: sh.borderRadius ? Math.round(sh.borderRadius * sFont) : sh.borderRadius,

      shadowBlur: sh.shadowBlur ? Math.round(sh.shadowBlur * sFont) : sh.shadowBlur,
      shadowX: sh.shadowX ? Math.round(sh.shadowX * sx) : sh.shadowX,
      shadowY: sh.shadowY ? Math.round(sh.shadowY * sy) : sh.shadowY,

      // some of your shapes use radius/fit/bulletSpacing, etc.
      radius: anySh.radius ? Math.round(anySh.radius * sFont) : anySh.radius,
      bulletSpacing: anySh.bulletSpacing ? Math.round(anySh.bulletSpacing * sFont) : anySh.bulletSpacing,
      bulletIndent: anySh.bulletIndent ? Math.round(anySh.bulletIndent * sFont) : anySh.bulletIndent,
    } as TemplateShape;
  });
}

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const draftId = searchParams.get("q");
  const topicId = searchParams.get("topic");

  // ✅ support both ?templateId= and ?tpl=
  const templateId = searchParams.get("templateId") || searchParams.get("tpl");
  const bgFromUrl = normalizeUrlCandidate(searchParams.get("bg"));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [template, setTemplate] = useState<Template | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [finalBgUrl, setFinalBgUrl] = useState<string | null>(null);

  const [draftRaw, setDraftRaw] = useState<any | null>(null);

  const [instructions, setInstructions] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [generatedShapes, setGeneratedShapes] = useState<TemplateShape[]>([]);
  const [layoutUsed, setLayoutUsed] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  /**
   * ✅ DB-driven load: template + draft
   * ✅ NO session/local storage
   * ✅ IMPORTANT: shapes come from DB template when available
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setErr(null);
      setSuccessMsg(null);
      setLoading(true);

      try {
        if (!draftId) throw new Error("Missing draft id (?q=...).");
        if (!templateId) throw new Error("Missing template id (?templateId=... or ?tpl=...).");

        // 1) Template (DB)
        const tpl: any = await getTemplateById(templateId);
        if (cancelled) return;

        setTemplate(tpl);
        console.log("Loaded template:", tpl);

        // 2) Draft (DB)
        const draft = await getDraftById(draftId);
        if (cancelled) return;

        setDraftRaw(draft);
        console.log("Loaded draft:", draft);

        const cd = buildCampaignDataFromDraft(draft);
        setCampaignData(cd);

        // ✅ SHAPES: use DB template shapes if present
        const tplShapes = (tpl?.shapes || tpl?.template_shapes || tpl?.layout?.shapes) as
          | TemplateShape[]
          | undefined;

        if (tplShapes?.length) {
          const baseW = Number(tpl?.canvasWidth || tpl?.width || tpl?.canvas_width || PORTRAIT_W);
          const baseH = Number(tpl?.canvasHeight || tpl?.height || tpl?.canvas_height || PORTRAIT_H);

          const scaled = scaleTemplateShapes(tplShapes, baseW, baseH, PORTRAIT_W, PORTRAIT_H);
          setGeneratedShapes(scaled);
          setLayoutUsed(String(tpl?.layoutId || tpl?.layout_id || "template-db"));
        } else {
          // fallback: if template has no shapes saved, generate
          const { layoutId, shapes } = generateLayoutShapes({
            campaignData: cd,
            canvasWidth: PORTRAIT_W,
            canvasHeight: PORTRAIT_H,
          });
          setLayoutUsed(layoutId);
          setGeneratedShapes(shapes);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [draftId, templateId]);

  /**
   * ✅ Background selection:
   * bg param > random topic chat bg > template background > null
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setErr(null);

      // 1) explicit bg from url
      if (bgFromUrl) {
        if (!cancelled) setFinalBgUrl(bgFromUrl);
        return;
      }

      // 2) topic chat backgrounds (DB)
      if (topicId) {
        try {
          const chat = await getTopicChat(topicId);
          const arr = Array.isArray((chat as any)?.background_images)
            ? ((chat as any).background_images as string[])
            : [];

          const picked = pickRandom(arr);
          if (!cancelled) setFinalBgUrl(picked);
          return;
        } catch {
          // ignore
        }
      }

      // 3) fallback null (template can still provide backgroundImage in render)
      if (!cancelled) setFinalBgUrl(null);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bgFromUrl, topicId]);

  const fileBaseName = useMemo(() => {
    const company = campaignData?.companyName || "campaign";
    const date = new Date().toISOString().split("T")[0];
    return `${company}-${date}`;
  }, [campaignData?.companyName]);

  const canvasBackground =
    finalBgUrl ||
    (template as any)?.backgroundImage ||
    (template as any)?.background_image ||
    null;

  // ✅ token-free prompt section (still reads from DB draft)
  const imagePrompt: string = useMemo(() => {
    const s = draftRaw?.structured || {};
    return (s.image_prompt || s.imagePrompt || draftRaw?.image_prompt || "").toString().trim();
  }, [draftRaw]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMsg("✅ Copied to clipboard.");
      setTimeout(() => setSuccessMsg(null), 1600);
    } catch {
      setErr("Copy failed (browser blocked clipboard). You can manually select and copy.");
    }
  };

  /**
   * ✅ Export always full 1080×1350 from actual canvas pixels.
   * NOTE: This assumes your zoom is CSS-only (recommended).
   */

   const fitCanvas = () => {
    setZoom(1) 
    setPan({ x: 0, y: 0 })
  }

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    fitCanvas()
    setIsExporting(true);
    try {
      // wait 2 frames to ensure the latest draw landed
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const link = document.createElement("a");
      link.href = canvasRef.current.toDataURL("image/png");
      link.download = `${fileBaseName}.png`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const canvasToFile = async (canvas: HTMLCanvasElement, filename: string) => {
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Failed to export canvas as PNG blob"));
          resolve(b);
        },
        "image/png",
        1.0
      );
    });
    return new File([blob], filename, { type: "image/png" });
  };

  const addMedia = async () => {
    setErr(null);
    setSuccessMsg(null);
    fitCanvas()

    if (!draftId) {
      setErr("Missing draft id. Ensure the URL has ?q=<draftId>.");
      return;
    }
    if (!canvasRef.current) {
      setErr("Canvas not ready.");
      return;
    }

    setIsAddingMedia(true);
    try {
      const file = await canvasToFile(canvasRef.current, `${fileBaseName}.png`);
      const url = await uploadFileToSpaces(file);

      await attachMediaToContentItem(draftId, {
        media_type: "image",
        media_url: url,
        media_urls: [url],
        media_provider: "do_spaces",
        media_caption: instructions?.trim() ? instructions.trim() : null,
      });

      setSuccessMsg("✅ Media uploaded and attached to draft.");
      router.push(`/dashboard/topic-chats/${topicId}?active=${draftId}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to add media");
    } finally {
      setIsAddingMedia(false);
    }
  };

  /**
   * ✅ Randomize Layout:
   * If template has DB shapes, randomize should regenerate shapes (engine).
   * (This keeps your “randomize layout” button useful.)
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-border text-center">
          <div className="text-sm text-muted-foreground">Loading…</div>
        </Card>
      </div>
    );
  }

  if (!template || !campaignData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-border text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Cannot generate</h2>
          <p className="text-muted-foreground mb-3">{err || "Missing template or draft data."}</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/user/content">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                Review & Generate
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Template</p>
              <p className="font-semibold text-foreground">{(template as any).name}</p>
              
            </div>
          </div>

          {err && (
            <div className="mt-3 p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">
              {err}
            </div>
          )}
          {successMsg && (
            <div className="mt-3 p-3 rounded border border-green-600/30 bg-green-600/10 text-sm text-green-700">
              {successMsg}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Canvas Preview */}
          <div className="col-span-2">
            <Card className="p-6 border-border">
              <div className="flex items-center justify-center bg-secondary rounded-lg overflow-hidden ">
                <TemplateCanvas
                  ref={canvasRef}
                  zoom={zoom}
                  setZoom={setZoom}
                  pan={pan}
                  setPan={setPan}
                  backgroundImage={canvasBackground}
                  logoUrl={(template as any)?.logoPlacement?.url}
                  campaignData={campaignData}
                  selectedShapeId={null}
                  onShapeSelect={() => {}}
                  shapes={generatedShapes}
                  canvasWidth={PORTRAIT_W}
                  canvasHeight={PORTRAIT_H}
                  isEditable={false}
                />
              </div>
            </Card>

            <div className="mt-3 text-xs text-muted-foreground">
              Draft ID: <span className="font-mono">{draftId}</span>
            </div>
          </div>

          {/* Right */}
          <div className="col-span-1 space-y-1 sticky top-24">

            <div className="mt-2 text-xs text-muted-foreground">
              Layout: <span className="font-mono">{layoutUsed || "—"}</span>
            </div>

 
            <CampaignDataForm data={campaignData} onChange={setCampaignData} />

            <div className="space-y-2">
              <Button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export as PNG"}
              </Button>

              <Button
                onClick={addMedia}
                disabled={isAddingMedia || !draftId}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                {isAddingMedia ? "Uploading..." : "Add Media to Draft"}
              </Button>

              <Button asChild variant="outline" className="w-full border-border bg-transparent">
                <Link href="/user/content">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit Content
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full border-border bg-transparent">
                <Link href="/user/content">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Create Another
                </Link>
              </Button>
            </div>

            {!draftId && (
              <div className="text-xs text-red-600">
                Missing <b>?q=</b> draft id in the URL.
              </div>
            )}
            {!templateId && (
              <div className="text-xs text-red-600">
                Missing <b>?templateId=</b> (or <b>?tpl=</b>) template id in the URL.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
