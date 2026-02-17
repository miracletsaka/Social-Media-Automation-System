"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RefreshCcw } from "lucide-react";

import { listTopicChats, listTopicChatDrafts } from "@/lib/api";
import Link from "next/link";

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

  const lower = String(primary).toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.includes("video")) {
    return { kind: "video", url: primary, thumb: thumb || null };
  }
  return { kind: "image", url: primary, thumb: null };
}

export default function TopicChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");

  // drawer
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await listTopicChats(50);
      setChats(data || []);
      setActiveChat(null);
      setDrafts([]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load topic chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const c of chats) if (c.brand_id) set.add(String(c.brand_id));
    return Array.from(set).sort();
  }, [chats]);

  const months = useMemo(() => {
    const set = new Set<string>();
    for (const c of chats) if (c.target_month) set.add(String(c.target_month));
    // newest first
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [chats]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return chats.filter((c: any) => {
      if (brand !== "all" && String(c.brand_id) !== brand) return false;
      if (month !== "all" && String(c.target_month) !== month) return false;

      if (!needle) return true;
      const hay = `${c.id} ${c.brand_id} ${c.topic} ${c.target_month} ${c.posts_per_week}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [chats, q, brand, month]);

  const openChat = async (chat: any) => {
    setActiveChat(chat);
    setDrawerLoading(true);
    setErr(null);
    try {
      const ds = await listTopicChatDrafts(chat.id);
      setDrafts(ds || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load chat drafts");
      setDrafts([]);
    } finally {
      setDrawerLoading(false);
    }
  };

  const draftCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of drafts) map[d.status] = (map[d.status] || 0) + 1;
    return map;
  }, [drafts]);

  return (
    <div className="space-y-3 p-4 bg-gray-100 min-h-screen">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topic Chats</div>
            <div className="text-xs text-slate-500 mt-1">
              Vision 2: chats → drafts. Click a chat to see all drafts (and their media).
            </div>
          </div>

          <Button className="bg-white shadow rounded-full" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : <RefreshCcw />}
          </Button>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brand</div>
            <select
              className="w-full bg-white shadow rounded text-gray-500 text-xs font-bold px-3 py-2"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="all">All</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Month</div>
            <select
              className="w-full bg-white shadow rounded text-gray-500 text-xs font-bold px-3 py-2"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="all">All</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Search</div>
            <Input
              style={{ backgroundColor: "white" }}
              className="text-xs font-bold text-gray-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by topic / brand / month / id..."
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 flex justify-end">
          {loading ? "Loading..." : `${filtered.length} chat(s)`}
        </div>

        {/* List */}
        <div className="rounded overflow-hidden space-y-1 bg-gray-100">
          <div className="grid grid-cols-[140px_120px_1fr_140px_180px_90px] gap-2 p-3 bg-gray-200 text-gray-600 text-sm font-medium">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brand</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Month</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topic</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Posts/Week</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Created</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Action</div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading chats...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No chats found.</div>
          ) : (
            filtered.map((c: any) => (
              <div
                key={c.id}
                className="grid grid-cols-[140px_120px_1fr_140px_180px_90px] gap-2 p-3 text-xs shadow bg-white items-center"
              >
                <div className="text-gray-600 font-bold truncate">{c.brand_id || "—"}</div>

                <div>
                  <Badge variant="secondary" className="capitalize">{c.target_month || "—"}</Badge>
                </div>

                <div className="text-gray-500 truncate">{(c.topic || "").slice(0, 120) || "—"}</div>

                <div className="text-gray-500">{c.posts_per_week ?? "—"}</div>

                <div className="text-gray-500">{fmtDate(c.created_at)}</div>

                <div className="flex flex-col gap-1 items-center">
                    <Link href={`/dashboard/topic-chats/${c.id}`}>
                    <Button className="text-white text-xs" size="sm">
                      Open
                    </Button>
                    </Link>
                  <Button className="text-white text-xs" size="sm" onClick={() => openChat(c)}>
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Drawer: chat details + drafts */}
      <Sheet open={!!activeChat} onOpenChange={(open) => !open && setActiveChat(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-4 bg-gray-100">
          <SheetHeader>
            <SheetTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Chat Details
            </SheetTitle>
          </SheetHeader>

          {activeChat && (
            <div className="space-y-4 mt-4">
              <Card className="p-3 bg-white shadow">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topic</div>
                <div className="text-sm font-bold text-slate-800">{activeChat.topic || "—"}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Brand: <b>{activeChat.brand_id}</b> • Month: <b>{activeChat.target_month}</b> • Posts/week: <b>{activeChat.posts_per_week}</b>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 break-all">
                  Chat ID: {activeChat.id}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                {["PENDING_APPROVAL", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"].map((s) => (
                  <Card key={s} className="p-3 bg-white shadow">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{s.replaceAll("_", " ")}</div>
                    <div className="text-sm font-semibold text-gray-500">{draftCounts[s] ?? 0}</div>
                  </Card>
                ))}
              </div>

              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Drafts</div>

              {drawerLoading ? (
                <div className="p-4 text-sm text-gray-600">Loading drafts...</div>
              ) : drafts.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">No drafts in this chat.</div>
              ) : (
                <div className="space-y-2">
                  {drafts.map((d: any) => {
                    const m = getMediaPrimary(d);
                    return (
                      <Card key={d.id} className="p-3 bg-white shadow space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">{d.platform}</Badge>
                            <Badge className="capitalize text-white">
                              {String(d.status).toLowerCase().replaceAll("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">{fmtDate(d.scheduled_at)}</div>
                        </div>

                        {m.kind && (
                          <div className="flex items-center gap-2">
                            {m.kind === "image" ? (
                              <img
                                src={m.url!}
                                alt="media"
                                className="w-20 h-14 object-cover rounded border"
                                onError={(e) => ((e.currentTarget.style.display = "none"))}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {m.thumb ? (
                                  <img
                                    src={m.thumb}
                                    alt="thumb"
                                    className="w-20 h-14 object-cover rounded border"
                                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                                  />
                                ) : (
                                  <div className="w-20 h-14 rounded border bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                                    VIDEO
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-[11px] text-gray-500 break-all line-clamp-2">
                              {m.url}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 line-clamp-3">
                          {(d.body_text || d.last_error || "").slice(0, 220) || "—"}
                        </div>

                        <div className="text-[11px] text-gray-400 break-all">
                          Draft ID: {d.id}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="text-white text-xs" onClick={() => setActiveChat(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
