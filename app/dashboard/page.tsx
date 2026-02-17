"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import DashboardHeroCarousel from "@/components/dashboard-hero-carouse";

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

async function fetchJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      msg = j?.detail || j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return r.json();
}

type TopicChatRow = {
  id: string;
  topic?: string | null;
  brand_id?: string | null;
  target_month?: string | null;
  posts_per_week?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DraftRow = {
  id: string;
  topic_chat_id: string;
  platform?: string | null;
  status?: string | null;
  body_text?: string | null;
  scheduled_at?: string | null;
  last_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // ✅ media fields you added to /topic-chats/{id}/drafts
  media_type?: string | null;
  media_url?: string | null;
  media_urls?: any;
  thumbnail_url?: string | null;
};

function countByStatus(drafts: DraftRow[]) {
  const map: Record<string, number> = {};
  for (const d of drafts) {
    const s = String(d.status || "UNKNOWN").toUpperCase();
    map[s] = (map[s] || 0) + 1;
  }
  return map;
}

export default function DashboardOverviewVision2() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [rows, setRows] = useState<
    Array<{ chat: TopicChatRow; drafts: DraftRow[]; counts: Record<string, number> }>
  >([]);

  const CHAT_LIMIT = 8;

  const refresh = async () => {
    setLoading(true);
    setErr(null);

    try {
      const chats: TopicChatRow[] = await fetchJson(`${process.env.NEXT_PUBLIC_API_BASE}/topic-chats?limit=${CHAT_LIMIT}`);

      const bundles = await Promise.all(
        (chats || []).map(async (c) => {
          const drafts: DraftRow[] = await fetchJson(`${process.env.NEXT_PUBLIC_API_BASE}/topic-chats/${c.id}/drafts`);
          return { chat: c, drafts: drafts || [], counts: countByStatus(drafts || []) };
        })
      );

      setRows(bundles);
    } catch (e: any) {
      setErr(e?.message || "Failed to load Vision 2 dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const globalCounts = useMemo(() => {
    const total: Record<string, number> = {};
    for (const r of rows) {
      for (const [k, v] of Object.entries(r.counts || {})) {
        total[k] = (total[k] || 0) + (v || 0);
      }
    }
    return total;
  }, [rows]);

  const totalDrafts = useMemo(() => rows.reduce((sum, r) => sum + (r.drafts?.length || 0), 0), [rows]);

  const needsAttention = useMemo(() => {
    const list: Array<{ chat: TopicChatRow; draft: DraftRow }> = [];
    for (const r of rows) {
      for (const d of r.drafts || []) {
        const s = String(d.status || "").toUpperCase();
        if (s === "PENDING_APPROVAL" || s === "FAILED") list.push({ chat: r.chat, draft: d });
      }
    }
    list.sort((a, b) => {
      const ta = new Date(a.draft.updated_at || a.draft.created_at || 0).getTime();
      const tb = new Date(b.draft.updated_at || b.draft.created_at || 0).getTime();
      return tb - ta;
    });
    return list.slice(0, 10);
  }, [rows]);

  const kpi = (s: string) => globalCounts[s.toUpperCase()] || 0;

  return (
    <div className="space-y-4 p-4 bg-gray-100 min-h-screen">
      <DashboardHeroCarousel />
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="p-4 bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Topic Chats</div>
          <div className="text-base font-semibold text-gray-700">{loading ? "…" : rows.length}</div>
        </Card>
        <Card className="p-4 bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Drafts</div>
          <div className="text-base font-semibold text-gray-700">{loading ? "…" : totalDrafts}</div>
        </Card>
        <Card className="p-4 bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pending</div>
          <div className="text-base font-semibold text-gray-700">{loading ? "…" : kpi("PENDING_APPROVAL")}</div>
        </Card>
        <Card className="p-4 bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Published</div>
          <div className="text-base font-semibold text-gray-700">{loading ? "…" : kpi("PUBLISHED")}</div>
        </Card>
        <Card className="p-4 bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Failed</div>
          <div className="text-base font-semibold text-gray-700">{loading ? "…" : kpi("FAILED")}</div>
        </Card>
      </div>

      {/* Needs attention */}
      <Card className="p-4 bg-white shadow rounded space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Needs Attention</div>
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : needsAttention.length === 0 ? (
          <div className="text-sm text-gray-600">Nothing urgent.</div>
        ) : (
          <div className="space-y-2">
            {needsAttention.map(({ chat, draft }) => {
              const s = String(draft.status || "").toUpperCase();
              return (
                <div key={draft.id} className="p-3 rounded bg-gray-50 border flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex gap-2 flex-wrap items-center">
                      <Badge variant="secondary" className="capitalize">{draft.platform || "platform"}</Badge>
                      <Badge className={s === "FAILED" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}>
                        {s.toLowerCase().replaceAll("_", " ")}
                      </Badge>
                      {chat.brand_id ? <Badge className="bg-gray-100 text-gray-600 shadow">{chat.brand_id}</Badge> : null}
                    </div>
                    <div className="text-sm text-gray-800 font-semibold truncate max-w-2xl">
                      {(chat.topic || "—").slice(0, 120)}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-2xl">
                      {(draft.body_text || draft.last_error || "—").slice(0, 160)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400 text-right">
                      {fmtDate(draft.updated_at || draft.created_at)}
                    </div>
                    <Link href={`/dashboard/topic-chats/${chat.id}`}>
                      <Button className="text-white text-xs">Open Chat</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent chats */}
      <Card className="p-4 bg-white shadow rounded space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recent Topic Chats</div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-600">No topic chats yet.</div>
        ) : (
          <div className="space-y-2">
            {rows.map(({ chat, counts }) => (
              <div key={chat.id} className="p-3 rounded bg-gray-50 border flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant="secondary">Topic Chat</Badge>
                    {chat.brand_id ? <Badge className="bg-gray-100 text-gray-600 shadow">{chat.brand_id}</Badge> : null}
                    {chat.target_month ? <Badge className="bg-gray-100 text-gray-600 shadow">{chat.target_month}</Badge> : null}
                    {typeof chat.posts_per_week === "number" ? (
                      <Badge className="bg-gray-100 text-gray-600 shadow">{chat.posts_per_week}/week</Badge>
                    ) : null}
                  </div>

                  <div className="text-sm font-semibold text-gray-800 truncate max-w-3xl">
                    {(chat.topic || "—").slice(0, 160)}
                  </div>

                  <div className="flex gap-2 flex-wrap text-xs">
                    <Badge className="bg-amber-500 text-white">Pending {(counts["PENDING_APPROVAL"] || 0)}</Badge>
                    <Badge className="bg-gray-700 text-white">Approved {(counts["APPROVED"] || 0)}</Badge>
                    <Badge className="bg-green-500 text-white">Published {(counts["PUBLISHED"] || 0)}</Badge>
                    <Badge className="bg-red-500 text-white">Failed {(counts["FAILED"] || 0)}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 text-right">{fmtDate(chat.updated_at || chat.created_at)}</div>
                  <Link href={`/dashboard/topic-chats/${chat.id}`}>
                    <Button className="text-white text-xs">Open</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
