"use client";

import { useEffect, useMemo, useState } from "react";
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

import TopicsTutorialHeroSingle from "@/components/TopicsTutorialHeroSingle";
import BrandContextPanel from "@/components/BrandContextPanel";

import {
  Brand,
  listBrands,
  getBrandProfile,
  type BrandProfile,
  createTopicChatAndGenerate, // ✅ new V2 API function
} from "@/lib/api";

// ---- V2 helpers (client-side estimate) ----
function postsInMonth(targetMonth: string, postsPerWeek: number) {
  // "YYYY-MM"
  const [yStr, mStr] = targetMonth.split("-");
  const y = Number(yStr);
  const m = Number(mStr); // 1-12

  // days in month
  const days = new Date(y, m, 0).getDate(); // JS trick: day 0 of next month
  const weeks = Math.ceil(days / 7);
  return Math.max(1, weeks * Math.max(1, postsPerWeek));
}

type PreviewRow = {
  key: string;
  topic: string;
  planned_posts: number;
  status: "NEW";
};

export default function TopicsPage() {
  // Intake
  const [topicsText, setTopicsText] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>("");

  // Brand profile (context)
  const [p, setP] = useState<BrandProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Monthly mode (V2 default ON)
  const [monthlyMode, setMonthlyMode] = useState(true);

  // default to current month in YYYY-MM
  const [targetMonth, setTargetMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [postsPerWeek, setPostsPerWeek] = useState<number>(3);

  // UI state
  const [loading, setLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [lastTopicChatId, setLastTopicChatId] = useState<string | null>(null);

  // Load brands
  useEffect(() => {
    (async () => {
      const data = await listBrands(true);
      setBrands(data);
      if (!brandId && data.length > 0) setBrandId(data[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load brand profile
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

  const totalPlannedPerTopic = useMemo(() => {
    if (!monthlyMode) return 1;
    if (!targetMonth || !postsPerWeek) return 1;
    return postsInMonth(targetMonth, postsPerWeek);
  }, [monthlyMode, targetMonth, postsPerWeek]);

  const counts = useMemo(() => {
    const topicsCount = topics.length;
    const plannedPerTopic = totalPlannedPerTopic;
    const totalGenerate = topicsCount * plannedPerTopic;

    return { topicsCount, plannedPerTopic, totalGenerate };
  }, [topics.length, totalPlannedPerTopic]);

  const buildPreview = (): PreviewRow[] => {
    const planned = totalPlannedPerTopic;
    return topics.map((t) => ({
      key: `${t}__${targetMonth}__${postsPerWeek}`,
      topic: t,
      planned_posts: planned,
      status: "NEW",
    }));
  };

  const openReview = () => {
    setResult(null);
    setLastTopicChatId(null);

    if (!brandId) {
      setResult("❌ Please select a brand.");
      return;
    }
    if (topics.length === 0) {
      setResult("❌ Please enter at least 1 topic (one per line).");
      return;
    }

    if (monthlyMode) {
      if (!targetMonth) {
        setResult("❌ Please select a target month.");
        return;
      }
      if (!postsPerWeek || postsPerWeek <= 0) {
        setResult("❌ Please choose posts per week.");
        return;
      }
    }

    setPreviewRows(buildPreview());
    setReviewOpen(true);
  };

  const confirmGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      // V2: generate for each topic -> create topic_chat + drafts
      const clientNow = new Date().toISOString(); // UTC ISO
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";

      let totalCreated = 0;
      let totalGenerated = 0;
      let totalFailed = 0;

      // Generate sequentially (simpler + avoids rate-limit spikes)
      for (const t of topics) {
        const res = await createTopicChatAndGenerate({
          brand_id: brandId,
          topic: t,
          mode: "monthly",
          target_month: targetMonth,
          posts_per_week: postsPerWeek,
          brand_profile_summary: p?.profile_summary || undefined,
          brand_profile_json: p?.profile_json || undefined,
          client_now: clientNow,
          timezone: tz,
          posting_hour_local: 9,
        });

        totalCreated += (res as any)?.created ?? 0;
        totalGenerated += (res as any)?.generated ?? 0;
        totalFailed += (res as any)?.failed ?? 0;

        // Keep the most recent chat id so user can open it
        if ((res as any)?.topic_chat_id) setLastTopicChatId((res as any)?.topic_chat_id);
      }

      setReviewOpen(false);
      setTopicsText("");

      if (totalGenerated > 0) {
        setResult(
          `✅ Generated ${totalGenerated} draft(s) across ${topics.length} topic chat(s).` +
          (totalFailed ? ` (${totalFailed} failed)` : "")
        );
      } else {
        setResult(
          `⚠️ Created ${totalCreated} planned draft(s) but generated 0. Check backend logs / failed drafts.`
        );
      }
    } catch (e: any) {
      setResult(`❌ ${e?.message || "Generation failed"}`);
    } finally {
      setLoading(false);
    }
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
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Brand/Page
          </Label>
          <select
            className="text-xs font-bold text-gray-400 bg-white shadow rounded px-3 py-2 w-full"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
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
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Topics (one per line)
          </Label>
          <Textarea
            style={{ backgroundColor: "white" }}
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

        {/* V2 Monthly planner */}
        <div className="space-y-2">
          <Label className="pt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Monthly Bulk Generation (V2)
          </Label>

          <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
            <Checkbox checked={monthlyMode} onCheckedChange={() => setMonthlyMode((v) => !v)} />
            <span>Generate a full month calendar automatically</span>
          </label>

          {monthlyMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Target month</Label>
                <input
                  type="month"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="text-xs font-bold text-gray-500 bg-white shadow rounded px-3 py-2 w-full"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">Posts per week</Label>
                <select
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                  className="text-xs font-bold text-gray-500 bg-white shadow rounded px-3 py-2 w-full"
                >
                  <option value={1}>1 / week</option>
                  <option value={2}>2 / week</option>
                  <option value={3}>3 / week</option>
                  <option value={4}>4 / week</option>
                  <option value={5}>5 / week</option>
                </select>
              </div>

              <div className="md:col-span-2 text-[11px] text-gray-400">
                Platforms are <b>dynamic</b> in V2 — the backend will generate drafts for all active platform pages.
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-gray-400">
              Non-monthly mode will generate <b>one</b> draft per topic (V2 optional).
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="text-[11px] text-gray-400">
          Planned drafts: <b>{counts.totalGenerate}</b> ({counts.plannedPerTopic} per topic × {counts.topicsCount} topics)
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="text-white text-xs font-bold" onClick={openReview} disabled={loading}>
            {loading ? "Generating..." : "Generate Drafts (Review First)"}
          </Button>
        </div>

        {/* Result */}
        {result && <div className="text-gray-500 font-bold text-xs">{result}</div>}

        {/* Optional: link to open the last chat */}
        {lastTopicChatId ? (
          <div className="text-xs text-gray-500">
            Latest topic chat:{" "}
            <a className="underline font-bold" href={`/dashboard/topic-chats/${lastTopicChatId}`}>
              Open
            </a>
          </div>
        ) : null}
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Review Before AI Generation</DialogTitle>
            <DialogDescription>
              V2 generates drafts directly from your inputs (no ContentItem table). Drafts will be stored and visible in Approvals.
            </DialogDescription>
          </DialogHeader>

          {/* Summary */}
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <b>Brand:</b> {brandId}
            </div>
            <div>
              <b>Topics:</b> {topics.length}
            </div>
            <div>
              <b>Target month:</b> {targetMonth}
            </div>
            <div>
              <b>Posts/week:</b> {postsPerWeek}
            </div>
            <div>
              <b>Planned drafts:</b> {counts.totalGenerate} ({counts.plannedPerTopic} per topic)
            </div>
            <div className="text-[11px] text-gray-400">
              Platforms are detected from active platform pages (dynamic platforms).
            </div>
          </div>

          {/* Preview Table */}
          <div className="max-h-[360px] overflow-auto border rounded bg-white">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-100">
                <tr className="text-gray-600">
                  <th className="text-left p-2 border-b">Topic</th>
                  <th className="text-left p-2 border-b">Planned drafts</th>
                  <th className="text-left p-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.key} className="border-b last:border-b-0">
                    <td className="p-2 text-gray-700">{row.topic}</td>
                    <td className="p-2 text-gray-600">{row.planned_posts}</td>
                    <td className="p-2">
                      <span className="font-semibold text-gray-500">{row.status}</span>
                      <span className="ml-2 text-[11px] font-bold text-green-600">(AI will generate)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={loading}>
              Cancel
            </Button>

            <Button className="text-white" onClick={confirmGenerate} disabled={loading}>
              {loading ? "Generating..." : "Confirm & Generate"}
            </Button>
          </DialogFooter>

          <div className="text-[11px] text-gray-400">
            Note: We stay on this page after generation (no redirect).
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
