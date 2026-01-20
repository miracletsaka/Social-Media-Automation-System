"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTopics, type Platform, type ContentType, Brand, listBrands, generateTextDrafts } from "@/lib/api";
import { listPlatforms, type PlatformRow } from "@/lib/api";
import TopicsTutorialHeroSingle from "@/components/TopicsTutorialHeroSingle";
import BrandContextPanel from "@/components/BrandContextPanel";
import { getBrandProfile, type BrandProfile } from "@/lib/api";

const TYPE_OPTIONS: ContentType[] = ["text", "image", "video"];

type GenPlatform = "all" | Platform;
type GenType = "all" | ContentType;

type PreviewRow = {
  key: string;
  topic: string;
  platform: Platform;
  content_type: ContentType;
  status: "NEW";
};

export default function TopicsPage() {
  const router = useRouter();

  // Intake
  const [topicsText, setTopicsText] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [types, setTypes] = useState<ContentType[]>(["text"]);
  const [platformOptions, setPlatformOptions] = useState<PlatformRow[]>([]);
  // Generation scope
  const [genPlatform, setGenPlatform] = useState<GenPlatform>("all");
  const [genType, setGenType] = useState<GenType>("text");

  // UI state
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [p, setP] = useState<BrandProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await listBrands(true);
      setBrands(data);
      if (!brandId && data.length > 0) setBrandId(data[0].id);
    })();

    (async () => {
      const p = await listPlatforms(true);
      setPlatformOptions(p);

      // if nothing selected yet, select all active platforms by default
      if (platforms.length === 0 && p.length > 0) {
        setPlatforms(p.map((x) => x.id as any));
      }
    })();
  }, []);

  useEffect(() => {
    if (!brandId) return;

    (async () => {
      setProfileLoading(true);
      try {
        const bp = await getBrandProfile(brandId);
        setP(bp);
      } catch {
        setP(null);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [brandId]);

  const topics = useMemo(() => {
    return topicsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [topicsText]);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const toggleType = (t: ContentType) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // Build a clear "what will be created + generated" preview table
  const buildPreview = (): PreviewRow[] => {
    const effectivePlatforms: Platform[] =
      genPlatform === "all"
        ? platforms
        : platforms.includes(genPlatform)
        ? [genPlatform]
        : []; // If user selects a genPlatform not included in intake, nothing will be generated for that platform.

    const effectiveTypes: ContentType[] =
      genType === "all"
        ? types
        : types.includes(genType)
        ? [genType]
        : []; // If user selects a genType not included in intake, nothing will be generated for that type.

    const rows: PreviewRow[] = [];

    for (const topic of topics) {
      for (const p of platforms) {
        for (const t of types) {
          rows.push({
            key: `${topic}__${p}__${t}`,
            topic,
            platform: p,
            content_type: t,
            status: "NEW",
          });
        }
      }
    }

    // Preview table shows ALL records to be created (platforms/types)
    // but also indicates what subset will be AI-generated (effectivePlatforms/effectiveTypes)
    // We'll compute those counts separately.
    return rows;
  };

  const counts = useMemo(() => {
    const totalCreate = topics.length * platforms.length * types.length;

    const genPlatforms: Platform[] =
      genPlatform === "all"
        ? platforms
        : platforms.includes(genPlatform)
        ? [genPlatform]
        : [];

    const genTypes: ContentType[] =
      genType === "all" ? types : types.includes(genType) ? [genType] : [];

    // V1: generation only supported for TEXT
    const willGenerateTextOnly = genTypes.includes("text") ? ["text"] : [];

    const totalGenerate = topics.length * genPlatforms.length * willGenerateTextOnly.length;

    return { totalCreate, totalGenerate, genPlatforms, genTypes };
  }, [topics.length, platforms, types, genPlatform, genType]);

  const openReview = async () => {
    setResult(null);

    if (topics.length === 0) {
      setResult("❌ Please enter at least 1 topic (one per line).");
      return;
    }
    if (platforms.length === 0) {
      setResult("❌ Select at least one platform.");
      return;
    }
    if (types.length === 0) {
      setResult("❌ Select at least one content type.");
      return;
    }

    setPreviewRows(buildPreview());
    setReviewOpen(true);
  };

  const createRecordsThenReview = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await createTopics({
        topics,
        brand_id: brandId,
        platforms,
        content_types: types,
      });

      setResult(`✅ Created ${res.content_items_created} content item(s). Review then generate AI drafts below.`);
      setTopicsText("");
      setReviewOpen(true);
    } catch (e: any) {
      setResult(`❌ ${e.message}`);
      setReviewOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmGenerate = async () => {
    setGenLoading(true);
    setResult(null);

    try {

      await createRecordsThenReview()
      
      const platformFilter = genPlatform === "all" ? undefined : genPlatform;

      const res = await generateTextDrafts({
        brand_id: brandId,
        mode: "new",
        platform: platformFilter as any,
        content_type: genType === "all" ? undefined : (genType as any),
        brand_profile_summary: p?.profile_summary || undefined,
        brand_profile_json: p?.profile_json || undefined,
      });

      setReviewOpen(false);

      if (res.generated > 0) {
        setResult(`✅ AI generated ${res.generated} draft(s) → Pending Approval.`);
        router.push("/dashboard/approvals");
      } else {
        setResult(`⚠️ Generated 0 drafts. Check "failed" or backend logs.`);
        // do NOT redirect
      }
    } catch (e: any) {
      setResult(`❌ ${e.message}`);
    } finally {
      setGenLoading(false);
    }
  };

  const togglePlatformAndMaybeGen = (plat: Platform) => {
  setPlatforms((prev) => {
    const isSelected = prev.includes(plat);
    const next = isSelected ? prev.filter((x) => x !== plat) : [...prev, plat];

    // If user removed the platform that genPlatform is locked to, fallback to "all"
    if (isSelected && genPlatform !== "all" && genPlatform === plat) {
      setGenPlatform("all");
    }

    // If user added a platform and genPlatform is "all", keep it "all" (no forced change)
    // If you want to auto-lock on first selection, uncomment below:
    // if (!isSelected && genPlatform === "all") setGenPlatform(plat);

    return next;
  });
};

const toggleTypeAndMaybeGen = (type: ContentType) => {
  setTypes((prev) => {
    const isSelected = prev.includes(type);
    const next = isSelected
      ? prev.filter((x) => x !== type)
      : [...prev, type];

    // If user REMOVED the type currently selected for generation → fallback
    if (isSelected && genType !== "all" && genType === type) {
      setGenType("all");
    }

    // Optional: if user ADDS a type and genType is "all",
    // you may auto-lock generation to it (usually NOT recommended)
    // if (!isSelected && genType === "all") {
    //   setGenType(type);
    // }

    return next;
  });
};



  return (
    <div className="space-y-6 pt-5 bg-gray-100">
       <TopicsTutorialHeroSingle
        youtubeId="kLxNJzGCzt8&t=283s"
        tutorialTitle="NeuroFlow Marketing — Content Generation Tutorial"
      />
      <Card className="p-6 space-y-4" id="topic">
        {/* Brand */}
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brand/Page</Label>
          <select className="text-xs font-bold text-gray-400 bg-white shadow rounded px-3 py-2 w-full" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.display_name} ({b.id})
              </option>
            ))}
          </select>
        </div>
        <BrandContextPanel brandId={brandId} />
        {/* Topics input */}
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topics (one per line)</Label>
          <Textarea
          style={{
            backgroundColor:"white"
          }}
            className="bg-white shadow border-none text-xs text-gray-500 font-normal"
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            placeholder={"Example:\nAI receptionist reduces missed calls\nWhatsApp blog automation case study"}
            rows={8}
          />
          <div className="text-[11px] text-gray-400">
            Topics entered: <b>{topics.length}</b>
          </div>
        </div>

        {/* Intake: platforms */}
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Platforms to create records for</Label>
          <div className="flex flex-wrap gap-4">
            {platformOptions.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                <Checkbox
                  checked={platforms.includes(p.id as Platform)}
                  onCheckedChange={() => togglePlatformAndMaybeGen(p.id as Platform)}
                />
                <span>{p.display_name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Intake: types */}
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Content types to create records for</Label>
          <div className="flex flex-wrap gap-4">
            {TYPE_OPTIONS.map((t) => (
              <label key={t} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                <Checkbox checked={types.includes(t)} onCheckedChange={() => toggleTypeAndMaybeGen(t)} />
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
          <div className="text-[11px] text-gray-400">
            Note: AI generation in V1 supports <b>Text</b> only. Image/Video will be added later with Canva/Reels pipeline.
          </div>
        </div>

        {/* Generation scope
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">AI generation scope (what AI will generate)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="text-xs font-bold text-gray-400 bg-white shadow rounded px-3 py-2"
              value={genPlatform}
              onChange={(e) => setGenPlatform(e.target.value as any)}
            >
              <option value="all">All Platforms</option>
              {platformOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
            <select
              className="text-xs font-bold text-gray-400 bg-white shadow rounded px-3 py-2"
              value={genType}
              onChange={(e) => setGenType(e.target.value as any)}
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="text-[11px] text-gray-400">
            Will create <b>{counts.totalCreate}</b> record(s). Will generate <b>{counts.totalGenerate}</b> AI text draft(s).
          </div>
        </div> */}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Single primary action: open review dialog */}
          <Button className="text-white text-xs font-bold" onClick={openReview} disabled={loading || genLoading}>
            {loading ? "Creating..." : "Create Draft (Review Before AI)"}
          </Button>
        </div>

        {/* Result */}
        {result && <div className="text-gray-500 font-bold text-xs">{result}</div>}
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Review Content Drafts Before AI Generation</DialogTitle>
            <DialogDescription>
              We will create content records (no AI cost), then generate AI text drafts for NEW items based on the scope below.
            </DialogDescription>
          </DialogHeader>

          {/* Summary */}
          <div className="text-xs text-gray-600">
            <div>
              <b>Brand:</b> {brandId}
            </div>
            <div>
              <b>Create Records:</b> {topics.length} topic(s) × {platforms.length} platform(s) × {types.length} type(s) ={" "}
              <b>{counts.totalCreate}</b>
            </div>
            <div>
              <b>AI Generation (V1 text only):</b>{" "}
              {genPlatform === "all" ? "All platforms" : genPlatform} × Text = <b>{counts.totalGenerate}</b> draft(s)
            </div>
          </div>

          {/* Preview Table */}
          <div className="max-h-[360px] overflow-auto border rounded bg-white">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-100">
                <tr className="text-gray-600">
                  <th className="text-left p-2 border-b">Topic</th>
                  <th className="text-left p-2 border-b">Platform</th>
                  <th className="text-left p-2 border-b">Type</th>
                  <th className="text-left p-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => {
                  const willGenPlatform =
                    genPlatform === "all" ? true : row.platform === genPlatform;
                  const willGenType =
                    genType === "all" ? true : row.content_type === genType;

                  const willGenerate = willGenPlatform && willGenType && row.content_type === "text";

                  return (
                    <tr key={row.key} className="border-b last:border-b-0">
                      <td className="p-2 text-gray-700">{row.topic}</td>
                      <td className="p-2 capitalize text-gray-600">{row.platform}</td>
                      <td className="p-2 capitalize text-gray-600">{row.content_type}</td>
                      <td className="p-2">
                        <span className="font-semibold text-gray-500">{row.status}</span>
                        {willGenerate ? (
                          <span className="ml-2 text-[11px] font-bold text-green-600">
                            (AI will generate)
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={loading || genLoading}>
              Cancel
            </Button>

            <Button
              className="text-white"
              onClick={confirmGenerate}
              disabled={genLoading || loading}
            >
              {genLoading ? "Generating..." : "2) Generate Drafts (AI)"}
            </Button>
          </DialogFooter>

          <div className="text-[11px] text-gray-400">
            Tip: If you want AI to generate only LinkedIn, choose LinkedIn above before confirming. V1 generates Text only.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
