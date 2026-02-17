"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RefreshCcw, Image as ImageIcon, Video as VideoIcon, FileText, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import StructuredPost from "@/components/StructuredPost";
import { getAllDrafts, attachMediaToContentItem } from "@/lib/api";
import { uploadFileToSpaces } from "@/lib/upload-client";

/**
 * VISION 2 LIBRARY
 * - Uses /drafts (ContentDraft + TopicChat join)
 * - NOT /content/all (Vision 1)
 * - Tabs are status views
 * - Responsive layout
 * - Drawer preview includes structured + markdown + media thumbnails
 */

type DraftItem = {
  id: string;
  topic_chat_id: string;

  topic: string;
  brand_id: string;
  target_month: string;
  posts_per_week: number;

  platform: string;
  status: string;
  body_text?: string | null;
  hashtags?: string | null;
  structured?: any;
  scheduled_at?: string | null;

  media_type?: "image" | "video" | null;
  media_url?: string | null;
  media_urls?: string[] | null;
  thumbnail_url?: string | null;
  media_provider?: string | null;
  media_caption?: string | null;

  last_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const STAT_TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "PUBLISHED", label: "Published" },
  { key: "FAILED", label: "Failed" },
  { key: "REJECTED", label: "Rejected" },
] as const;

const PLATFORMS: Array<string> = ["all", "facebook", "instagram", "linkedin", "tiktok", "youtube"];

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

function normalizeStatus(s?: string | null) {
  return String(s || "").toUpperCase().trim() || "UNKNOWN";
}

function normalizePlatform(p?: string | null) {
  return String(p || "").toLowerCase().trim() || "unknown";
}

function draftType(d: DraftItem): "text" | "image" | "video" {
  const mt = String(d.media_type || "").toLowerCase();
  if (mt === "image") return "image";
  if (mt === "video") return "video";
  // If media_urls exist but media_type missing, infer "image" (safe default)
  if ((d.media_urls?.length || 0) > 0) return "image";
  if (d.media_url) return "image";
  return "text";
}

function safeList(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return [];
}

function firstMediaUrl(d: DraftItem) {
  return d.thumbnail_url || d.media_url || safeList(d.media_urls)[0] || null;
}

export default function LibraryPageV2() {
  const router = useRouter();

  const [items, setItems] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [tab, setTab] = useState<(typeof STAT_TABS)[number]["key"]>("ALL");
  const [platform, setPlatform] = useState<string>("all");
  const [q, setQ] = useState("");

  // preview
  const [active, setActive] = useState<DraftItem | null>(null);

  // media upload
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getAllDrafts(200);
      setItems(Array.isArray(data) ? data : []);
      setActive(null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load Vision 2 library (drafts)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) {
      const s = normalizeStatus(it.status);
      m[s] = (m[s] || 0) + 1;
      m["ALL"] = (m["ALL"] || 0) + 1;
    }
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return items.filter((it) => {
      const st = normalizeStatus(it.status);
      const pf = normalizePlatform(it.platform);

      if (tab !== "ALL" && st !== tab) return false;
      if (platform !== "all" && pf !== platform) return false;

      if (!needle) return true;

      const hay = `${it.id} ${it.topic_chat_id} ${it.brand_id} ${it.topic} ${it.target_month} ${it.posts_per_week} ${it.platform} ${it.status} ${it.body_text || ""} ${it.hashtags || ""} ${it.media_url || ""} ${(it.media_urls || []).join(" ")}`.toLowerCase();

      return hay.includes(needle);
    });
  }, [items, tab, platform, q]);

  async function onUploadMedia(file: File) {
    if (!active) return;
    setUploading(true);
    setErr(null);

    try {
      /**
       * You already have uploadFileToSpaces() in your project.
       * Import it from your existing util where it lives.
       *
       * Example:
       *   import { uploadFileToSpaces } from "@/lib/spaces";
       */
 
      const url: string = await uploadFileToSpaces(file);

      // ✅ This route is backwards compatible (updates ContentDraft when ID isn't a ContentItem)
      await attachMediaToContentItem(active.id, {
        media_type: file.type.startsWith("video/") ? "video" : "image",
        media_url: url,
        media_urls: [url],
        media_provider: "do_spaces",
      });

      await refresh();
      alert("✅ Uploaded and attached media.");
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Library</div>
          <div className="text-lg font-bold text-slate-800">All generated content </div>
          <div className="text-[11px] font-bold text-gray-400 tracking-wide">
            Browse drafts from Topic Chats — filter by status, platform, and search.
          </div>
        </div>

        <Button className="bg-white shadow rounded-full" onClick={refresh} disabled={loading}>
          {loading ? "Loading..." : <RefreshCcw />}
        </Button>
      </div>

      {err && <div className="px-4 mt-2 text-sm text-red-600">{err}</div>}

      {/* Tabs */}
      <div className="px-4 mt-3 flex flex-wrap gap-2">
        {STAT_TABS.map((t) => {
          const isActive = tab === t.key;
          const c = t.key === "ALL" ? counts["ALL"] ?? 0 : counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "px-3 py-2 rounded-full text-xs font-bold border transition",
                isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200",
              ].join(" ")}
            >
              {t.label} ({c})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mx-4 mt-3 p-4 shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Platform</div>
            <select
              className="w-full text-gray-600 rounded text-xs font-bold shadow bg-white px-3 py-2"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "All" : p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Search</div>
            <Input
              style={{ backgroundColor: "white" }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search id / topic / text / hashtags / url..."
              className="text-xs font-bold text-gray-600"
            />
          </div>
        </div>
      </Card>

      {/* Grid layout (responsive) */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="text-sm text-gray-600 p-6">Loading drafts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-600 p-6">No drafts match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {filtered.map((it) => {
              const st = normalizeStatus(it.status);
              const pf = normalizePlatform(it.platform);
              const type = draftType(it);
              const media = firstMediaUrl(it);

              return (
                <Card
                  key={it.id}
                  className="p-3 bg-white shadow rounded cursor-pointer hover:shadow-md transition"
                  onClick={() => setActive(it)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="capitalize">
                          {pf}
                        </Badge>

                        <Badge className="bg-gray-100 text-gray-600 shadow capitalize">
                          {type === "text" ? (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> text
                            </span>
                          ) : type === "image" ? (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> image
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <VideoIcon className="w-3 h-3" /> video
                            </span>
                          )}
                        </Badge>

                        <Badge className="capitalize bg-slate-900 text-white">
                          {st.toLowerCase().replaceAll("_", " ")}
                        </Badge>

                        <Badge className="bg-white border text-gray-600">
                          {it.target_month} • {it.posts_per_week}/wk
                        </Badge>
                      </div>

                      <div className="text-xs font-bold text-slate-700 truncate">
                        {it.topic || "—"}
                      </div>

                      <div className="text-xs text-gray-500 truncate">
                        {(it.body_text || it.hashtags || it.last_error || "").slice(0, 140) || "—"}
                      </div>

                      <div className="text-[11px] text-gray-400 font-bold">
                        Scheduled: {fmtDate(it.scheduled_at)} • Updated: {fmtDate(it.updated_at)}
                      </div>
                    </div>

                    {/* thumbnail */}
                    <div className="shrink-0">
                      {media ? (
                        // For video, show thumbnail if exists; else show a small icon
                        type === "video" && !it.thumbnail_url ? (
                          <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                            <VideoIcon className="w-5 h-5" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media}
                            alt="media"
                            className="w-16 h-16 rounded object-cover border"
                          />
                        )
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-4 bg-gray-100">
          <SheetHeader>
            <SheetTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Draft Preview 
            </SheetTitle>
          </SheetHeader>

          {active && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="capitalize">
                  {normalizePlatform(active.platform)}
                </Badge>
                <Badge className="capitalize bg-slate-900 text-white">
                  {normalizeStatus(active.status).toLowerCase().replaceAll("_", " ")}
                </Badge>
                <Badge className="bg-white border text-gray-600">
                  {active.target_month} • {active.posts_per_week}/wk
                </Badge>
              </div>

              <Card className="p-3 bg-white shadow rounded">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topic</div>
                <div className="text-sm font-bold text-slate-800">{active.topic || "—"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Brand: <b>{active.brand_id}</b> • Chat: <b className="break-all">{active.topic_chat_id}</b>
                </div>
              </Card>

              {/* Media block */}
              <div className="bg-white shadow rounded p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Media</div>

                {firstMediaUrl(active) ? (
                  <div className="space-y-2">
                    {draftType(active) === "video" ? (
                      <video
                        controls
                        className="w-full rounded border bg-black"
                        src={active.media_url || safeList(active.media_urls)[0] || undefined}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firstMediaUrl(active) as string}
                        alt="media"
                        className="w-full rounded border object-cover"
                      />
                    )}

                    <div className="text-xs text-gray-500 break-all">
                      URL:{" "}
                      <a
                        href={firstMediaUrl(active) as string}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline inline-flex items-center gap-1"
                      >
                        open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No media attached yet.</div>
                )}

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUploadMedia(f);
                  }}
                />
                <Button disabled={uploading} className="text-white text-xs">
                  {uploading ? "Uploading..." : "Upload Media"}
                </Button>
              </div>

              {/* Structured Preview */}
              <StructuredPost item={active.structured || {}} />

              {/* IDs */}
              <div className="bg-white shadow rounded p-3 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">IDs</div>
                <div className="text-xs text-gray-600 break-all">
                  <b>Draft:</b> {active.id}
                </div>
                <div className="text-xs text-gray-600 break-all">
                  <b>Chat:</b> {active.topic_chat_id}
                </div>
              </div>

              {/* Rendered body */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Body (Rendered)</div>
                <div className="shadow bg-white rounded-md p-3 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {active.body_text || "—"}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Hashtags */}
              <div className="bg-white shadow rounded p-3 space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hashtags</div>
                <div className="text-xs text-gray-600 whitespace-pre-wrap">
                  {active.hashtags || "—"}
                </div>
              </div>

              {/* schedule/meta */}
              <div className="bg-white shadow rounded p-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Scheduled</div>
                  <div className="text-xs text-gray-600">{fmtDate(active.scheduled_at)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Updated</div>
                  <div className="text-xs text-gray-600">{fmtDate(active.updated_at)}</div>
                </div>
              </div>

              {active.last_error && (
                <div className="bg-white shadow rounded p-3 space-y-1 border border-red-200">
                  <div className="text-[11px] font-bold text-red-700 uppercase tracking-wide">Last Error</div>
                  <div className="text-xs text-red-700 whitespace-pre-wrap">{active.last_error}</div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="text-white text-xs" onClick={() => setActive(null)}>
                  Close
                </Button>
                <Button
                  className="text-white text-xs"
                  variant="outline"
                  onClick={() => {
                    // optional: jump to the chat detail page if you have it
                    router.push(`/topic-chats/${active.topic_chat_id}`);
                  }}
                >
                  Open Chat
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
