"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOverviewStats,
  getRecentContent,
  type ContentItem,
  type Status,
  type OverviewStats,
} from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import DashboardHeroCarousel from "@/components/dashboard-hero-carouse";
import PublishingQueuePage from "@/components/PublishingQueuePage";

const KPI_STATUSES: Status[] = [
  "PENDING_APPROVAL",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
];

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recent, setRecent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [s, r] = await Promise.all([
        getOverviewStats(),
        getRecentContent(8),
      ]);
      setStats(s);
      setRecent(r);
    } catch (e: any) {
      setErr(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of stats?.by_status ?? []) map[row.status] = row.count;
    return map;
  }, [stats]);

  const totalContent = useMemo(() => {
    return (stats?.by_status ?? []).reduce((sum, r) => sum + r.count, 0);
  }, [stats]);

  return (
    <div className="space-y-2 bg-gray-100">
      <DashboardHeroCarousel />
      <div className="flex items-start font-bold text-xs justify-between px-4">
        <div>
          <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Overview</h1>
          <p className="text-[11px] font-bold text-gray-400 tracking-wide">
            Real-time snapshot of content generation, approvals, and publishing.
          </p>
        </div>
        <Button className="bg-white shadow rounded-full" onClick={refresh} disabled={loading}>
          {loading ? "Loading..." : <RefreshCcw />}
        </Button>
      </div>

      {err && <div className="px-4 text-sm text-red-600">{err}</div>}

      {/* KPI CARDS */}
      <div className="px-4 grid grid-cols-2 md:grid-cols-6 gap-1">
        <Card className="p-4 shadow-none bg-white shadow rounded">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">TOTAL</div>
          <div className="text-sm font-semibold text-gray-400">{loading ? "…" : totalContent}</div>
        </Card>

        {KPI_STATUSES.map((s) => (
          <Card key={s} className="p-4 bg-white shadow rounded">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{s.replaceAll("_", " ")}</div>
            <div className="text-sm font-semibold text-gray-400">
              {loading ? "…" : (statusCounts[s] ?? 0)}
            </div>
          </Card>
        ))}
      </div>

      {/* PLATFORM + BRAND BREAKDOWN */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-1">
        <Card className="shadow-none space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">By Platform</div>
          {loading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2">
              {(stats?.by_platform ?? []).map((row) => (
                <div key={row.platform} className="flex items-center justify-between bg-white shadow rounded p-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide capitalize">{row.platform}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{row.count}</div>
                </div>
              ))}
              {(stats?.by_platform ?? []).length === 0 && (
                <div className="text-xs text-gray-500">No platform data yet.</div>
              )}
            </div>
          )}
        </Card>

        <Card className="shadow-none space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">By Brand</div>
          {loading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2">
              {(stats?.by_brand ?? []).map((row) => (
                <div key={row.brand_id} className="flex items-center justify-between bg-white shadow rounded p-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{row.brand_id}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{row.count}</div>
                </div>
              ))}
              {(stats?.by_brand ?? []).length === 0 && (
                <div className="text-xs text-gray-500">No brand data yet.</div>
              )}
            </div>
          )}
        </Card>
      </div>

      <PublishingQueuePage />

      {/* RECENT ACTIVITY */}
      <Card className="shadow-none space-y-1 mx-4">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recent Activity</div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="text-sm text-gray-600">No content activity yet.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between shadow bg-white rounded p-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {it.platform}
                    </Badge>
                    <Badge className="capitalize bg-gray-100 shadow text-gray-400">
                      {it.content_type}
                    </Badge>
                    <Badge className="capitalize bg-green-400 text-white">
                      {it.status.toLowerCase().replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className=" truncate max-w-[600px]">
                    {(it.body_text || it.title || "").slice(0, 120) || "—"}
                  </p>
                </div>

                <div className="text-xs text-gray-400 text-right">
                  <p>{fmtDate(it.updated_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
