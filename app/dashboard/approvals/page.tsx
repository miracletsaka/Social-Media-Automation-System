"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bulkApprove,
  regenerateRejectedText,
  bulkReject,
  getPendingApproval,
  generateMediaViaMake, // ✅ NEW (must exist in lib/api.ts)
  type ContentItem,
  type Platform,
  type ContentType,
} from "@/lib/api";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const PLATFORMS: (Platform | "all")[] = ["all", "facebook", "instagram", "linkedin"];
const TYPES: (ContentType | "all")[] = ["all", "text", "image", "video"];

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function safeJsonParseArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      if (v.includes(",")) return v.split(",").map((x) => x.trim()).filter(Boolean);
    }
  }
  return [];
}

function getMediaPrimary(it: any): { kind: "image" | "video" | null; url: string | null; thumb: string | null } {
  const mediaType = (it?.media_type || "").toLowerCase();
  const mediaUrl = it?.media_url || null;
  const thumb = it?.thumbnail_url || null;

  const mediaUrls = safeJsonParseArray(it?.media_urls);
  const primary = mediaUrl || mediaUrls[0] || null;

  if (!primary) return { kind: null, url: null, thumb: null };

  if (mediaType === "video") return { kind: "video", url: primary, thumb: thumb || null };
  if (mediaType === "image") return { kind: "image", url: primary, thumb: null };

  const ctype = (it?.content_type || "").toLowerCase();
  if (ctype === "video") return { kind: "video", url: primary, thumb: thumb || null };
  if (ctype === "image") return { kind: "image", url: primary, thumb: null };

  const lower = String(primary).toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.includes("video")) {
    return { kind: "video", url: primary, thumb: thumb || null };
  }
  return { kind: "image", url: primary, thumb: null };
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // generation UI state
  const [genLoading, setGenLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [genBrand, setGenBrand] = useState("neuroflow-ai");
  const [genType, setGenType] = useState<"all" | "text" | "image" | "video">("text");
  const [genPlatform, setGenPlatform] = useState<"all" | "facebook" | "instagram" | "linkedin">("all");

  // filters
  const [platform, setPlatform] = useState<(Platform | "all")>("all");
  const [ctype, setCtype] = useState<(ContentType | "all")>("all");
  const [q, setQ] = useState("");

  // selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  // preview drawer
  const [active, setActive] = useState<any | null>(null);

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it: any) => {
      if (platform !== "all" && it.platform !== platform) return false;
      if (ctype !== "all" && it.content_type !== ctype) return false;

      const needle = q.trim().toLowerCase();
      if (!needle) return true;

      const hay =
        `${it.id} ${it.topic_id} ${it.platform} ${it.content_type} ${it.status} ${it.body_text ?? ""} ${it.hashtags ?? ""} ${it.media_url ?? ""} ${it.media_caption ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [items, platform, ctype, q]);

  const allChecked = filtered.length > 0 && filtered.every((it: any) => selected[it.id]);
  const someChecked = filtered.some((it: any) => selected[it.id]);

  const toggleAll = (checked: boolean) => {
    const next = { ...selected };
    for (const it of filtered as any[]) next[it.id] = checked;
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getPendingApproval();
      setItems(data as any);
      setSelected({});
      setActive(null);
    } catch (e: any) {
      setErr(e.message || "Failed to load pending approval items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const doBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setErr(null);
    try {
      await bulkApprove(selectedIds);
      await refresh();
    } catch (e: any) {
      setErr(e.message || "Bulk approve failed");
    }
  };

  const openReject = () => {
    setRejectReason("");
    setRejectOpen(true);
  };

  const doReject = async () => {
    if (selectedIds.length === 0) return;
    setErr(null);
    try {
      await bulkReject(selectedIds, rejectReason);
      setRejectOpen(false);
      await refresh();
    } catch (e: any) {
      setErr(e.message || "Bulk reject failed");
    }
  };

  /**
   * ✅ UI triggers generation by calling:
   * POST /media/generate { content_item_ids: [...] }
   * This tells Make to generate, then Make calls /media/ingest to attach URLs back.
   */
  const generateMedia = async (ids: string[]) => {
    if (!ids.length) return;
    setErr(null);
    setMediaLoading(true);
    try {
      const res = await generateMediaViaMake(ids);
      await refresh();
      alert(`✅ Sent ${res.generated} item(s) for media generation.`);
    } catch (e: any) {
      setErr(e.message || "Media generation failed");
    } finally {
      setMediaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
        <div className="w-full md:w-auto">
          <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Approvals</h1>
          <p className="text-gray-400 text-xs">
            Review and bulk approve content items in <b>PENDING_APPROVAL</b> state.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
          <Button className="text-white text-xs" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>

          {/* <select
            className="bg-white shadow text-xs text-gray-400 rounded px-3 py-2 min-w-[120px]"
            value={genPlatform}
            onChange={(e) => setGenPlatform(e.target.value as any)}
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <select
            className="bg-white shadow text-xs text-gray-400 rounded px-3 py-2 min-w-[140px]"
            value={genBrand}
            onChange={(e) => setGenBrand(e.target.value)}
          >
            <option value="neuroflow-ai">neuroflow-ai</option>
            <option value="leadership-quotes">leadership-quotes</option>
            <option value="innovative-leadership">innovative-leadership</option>
            <option value="ai-for-business">ai-for-business</option>
          </select>

          <select
            className="bg-white shadow text-xs text-gray-400 rounded px-3 py-2 min-w-[100px]"
            value={genType}
            onChange={(e) => setGenType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <Button
            className="text-white text-xs"
            onClick={async () => {
              setErr(null);
              setGenLoading(true);
              try {
                const res = await generateTextDrafts({ brand_id: "neuroflow-ai" });
                await refresh();
                alert(`✅ Generated ${res.generated} text drafts and moved them to Pending Approval.`);
              } catch (e: any) {
                setErr(e.message || "AI generation failed");
              } finally {
                setGenLoading(false);
              }
            }}
            disabled={loading || genLoading}
          >
            {genLoading ? "Generating..." : "Generate Drafts (AI)"}
          </Button> */}

          {/* <Button
            className="text-white text-xs"
            onClick={async () => {
              if (selectedIds.length === 0) return;
              setErr(null);
              setGenLoading(true);
              try {
                const platformFilter = genPlatform === "all" ? undefined : (genPlatform as any);
                const typeFilter = genType === "all" ? undefined : (genType as any);

                const res = await generateTextForSelected(
                  selectedIds,
                  "neuroflow-ai",
                  platformFilter,
                  (typeFilter ?? "text") as any
                );

                await refresh();
                alert(`✅ Generated ${res.generated} selected draft(s).`);
              } catch (e: any) {
                setErr(e.message || "Generate selected failed");
              } finally {
                setGenLoading(false);
              }
            }}
            disabled={loading || genLoading || selectedIds.length === 0}
          >
            Generate Selected (AI)
          </Button> */}

          <Button
            className="text-white text-xs"
            onClick={async () => {
              setErr(null);
              setGenLoading(true);
              try {
                const platformFilter = genPlatform === "all" ? undefined : (genPlatform as any);
                const typeFilter = genType === "all" ? undefined : (genType as any);

                const res = await regenerateRejectedText(genBrand, platformFilter, (typeFilter ?? "text") as any);
                await refresh();
                alert(`✅ Regenerated ${res.generated} rejected draft(s).`);
              } catch (e: any) {
                setErr(e.message || "Regenerate rejected failed");
              } finally {
                setGenLoading(false);
              }
            }}
            disabled={loading || genLoading}
          >
            Regenerate Rejected (AI)
          </Button>

          {/* ✅ Media generation */}
          <Button
            className="text-white text-xs bg-indigo-600"
            onClick={() => generateMedia(selectedIds)}
            disabled={loading || mediaLoading || selectedIds.length === 0}
          >
            {mediaLoading ? "Generating Media..." : `Generate Media (Selected ${selectedIds.length})`}
          </Button>

          <Button className="text-white text-xs" onClick={doBulkApprove} disabled={selectedIds.length === 0 || loading}>
            Bulk Approve ({selectedIds.length})
          </Button>

          <Button className="text-white text-xs" variant="destructive" onClick={openReject} disabled={selectedIds.length === 0 || loading}>
            Bulk Reject
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Platform</div>
            <select
              className="w-full bg-white shadow rounded text-gray-400 text-xs font-bold px-3 py-2"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "All" : p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Content Type</div>
            <select
              className="w-full bg-white shadow rounded text-gray-400 text-xs font-bold px-3 py-2"
              value={ctype}
              onChange={(e) => setCtype(e.target.value as any)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All" : t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Search</div>
            <Input
            style={{backgroundColor:"white"}}
              className="w-full bg-white shadow rounded text-gray-400 text-xs font-bold px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search text / id / hashtags / media url..."
            />
          </div>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="rounded overflow-hidden space-y-1 bg-gray-100">
          <div className="grid grid-cols-[40px_120px_120px_140px_120px_1fr_180px_90px] gap-2 p-3 bg-gray-200 text-gray-600 text-sm font-medium">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allChecked}
                // @ts-ignore
                indeterminate={!allChecked && someChecked}
                onCheckedChange={(v) => toggleAll(Boolean(v))}
              />
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Platform</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Type</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Media</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Preview</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Created</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">View</div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading pending items...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No items found.</div>
          ) : (
            (filtered as any[]).map((it) => {
              const m = getMediaPrimary(it);

              return (
                <div
                  key={it.id}
                  className="grid grid-cols-[40px_120px_120px_140px_120px_1fr_180px_90px] gap-2 p-3 text-xs shadow bg-white items-center"
                >
                  <div className="flex items-center justify-center">
                    <Checkbox checked={!!selected[it.id]} onCheckedChange={(v) => toggleOne(it.id, Boolean(v))} />
                  </div>

                  <div>
                    <Badge variant="secondary" className="capitalize">
                      {it.platform}
                    </Badge>
                  </div>

                  <div>
                    <Badge className="text-white capitalize">{it.content_type}</Badge>
                  </div>

                  <div>
                    <Badge className="text-white capitalize">{String(it.status).toLowerCase().replaceAll("_", " ")}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {!m.kind ? (
                      <span className="text-gray-400">—</span>
                    ) : m.kind === "image" ? (
                      <img
                        src={m.url!}
                        alt="media"
                        className="w-14 h-10 object-cover rounded shadow border"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {m.thumb ? (
                          <img
                            src={m.thumb}
                            alt="thumb"
                            className="w-14 h-10 object-cover rounded shadow border"
                            onError={(e) => ((e.currentTarget.style.display = "none"))}
                          />
                        ) : (
                          <div className="w-14 h-10 rounded border bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                            VIDEO
                          </div>
                        )}
                        <Badge variant="outline" className="text-[10px]">Video</Badge>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-400 truncate">
                    {(it.body_text || it.title || it.last_error || it.media_caption || "").slice(0, 120) || "—"}
                  </div>

                  <div className="text-gray-400">{fmtDate(it.created_at)}</div>

                  <div>
                    <Button className="text-white text-xs" size="sm" onClick={() => setActive(it)}>
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Preview Drawer */}
      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-4 bg-gray-100">
          <SheetHeader>
            <SheetTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Content Preview</SheetTitle>
          </SheetHeader>

          {active && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="capitalize">{active.platform}</Badge>
                <Badge className="text-white capitalize bg-green-400">{active.content_type}</Badge>
                <Badge className="capitalize text-white">{String(active.status).toLowerCase().replaceAll("_", " ")}</Badge>
              </div>

              {/* ✅ Media preview */}
              {(() => {
                const m = getMediaPrimary(active);
                const mediaUrls = safeJsonParseArray(active?.media_urls);
                const caption = active?.media_caption || "";

                if (!m.kind) return null;

                return (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Generated Media</div>

                    {m.kind === "image" ? (
                      <div className="bg-white shadow rounded p-2">
                        <img src={m.url!} alt="generated" className="w-full rounded object-contain" />
                      </div>
                    ) : (
                      <div className="bg-white shadow rounded p-2 space-y-2">
                        {m.thumb && <img src={m.thumb} className="w-full rounded object-cover" alt="thumb" />}
                        <video src={m.url!} controls className="w-full rounded" />
                      </div>
                    )}

                    <div className="text-xs text-gray-500 break-all">
                      <div><b>media_url:</b> {active.media_url || "—"}</div>
                      {mediaUrls.length > 0 && (
                        <div className="mt-1">
                          <b>media_urls:</b>
                          <ul className="list-disc ml-5">
                            {mediaUrls.map((u, idx) => (
                              <li key={idx} className="break-all">{u}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {caption && <div className="mt-1"><b>media_caption:</b> {caption}</div>}
                    </div>
                  </div>
                );
              })()}

              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <div className="font-medium">Content ID</div>
                <div className="text-gray-600 text-xs lowercase break-all">{active.id}</div>
              </div>

              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <div className="font-medium">Topic ID</div>
                <div className="text-gray-600 text-xs lowercase break-all">{active.topic_id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Body</div>
                <div className="shadow bg-white text-gray-400 font-bold rounded-md p-3 whitespace-pre-wrap text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 text-sm text-gray-700 last:mb-0 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm text-gray-700">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-700">{children}</em>
                      ),
                      code: ({ children }) =>
          
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">
                            {children}
                          </code>,
          
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-gray-900 mb-2 mt-1">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-gray-900 mb-2 mt-1">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-1">{children}</h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-3 py-1 my-2 text-gray-600 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                     {active.body_text || "—"}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hashtags</div>
                <div className="shadow bg-white text-gray-400 font-bold rounded-md p-3 whitespace-pre-wrap text-sm">
                  {active.hashtags || "—"}
                </div>
              </div>

              {active.last_error && (
                <div className="space-y-1">
                  <div className="font-medium text-sm text-red-700">Last Error</div>
                  <div className="border border-red-200 rounded-md p-3 whitespace-pre-wrap text-sm">
                    {active.last_error}
                  </div>
                </div>
              )}

              <div className="text-sm grid grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">Created</div>
                  <div className="text-gray-600">{fmtDate(active.created_at)}</div>
                </div>
                <div>
                  <div className="font-medium">Updated</div>
                  <div className="text-gray-600">{fmtDate(active.updated_at)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  className="text-white text-xs"
                  onClick={async () => {
                    try {
                      await bulkApprove([active.id]);
                      await refresh();
                    } catch (e: any) {
                      setErr(e.message || "Approve failed");
                    }
                  }}
                >
                  Approve
                </Button>

                <Button
                  className="text-white text-xs bg-indigo-600"
                  onClick={() => generateMedia([active.id])}
                  disabled={mediaLoading}
                >
                  {mediaLoading ? "Generating..." : "Generate Media (This Item)"}
                </Button>

                <Button className="text-white text-xs" variant="destructive" onClick={openReject}>
                  Reject
                </Button>

                <Button className="text-white text-xs" onClick={() => setActive(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-gray-100">
          <DialogHeader>
            <DialogTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Reject Content</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Selected: <b>{selectedIds.length}</b> item(s)
            </div>
            <div className="text-sm font-medium">Reason</div>
            <textarea
              className="w-full border rounded-md p-2"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Example: Caption too generic. Add stronger hook + clear CTA."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button className="text-white text-xs" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button className="text-white text-xs" variant="destructive" onClick={doReject}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
