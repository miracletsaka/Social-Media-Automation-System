"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getScheduledContent,
  getQueuedContent,
  getPublishedContent,
  getFailedContent,
  downloadBufferCSV,
  markQueued,
  markPublished,
  undoQueued,
  retryFailed,
  type ContentItem,
  publishViaMake,
} from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Tab = "SCHEDULED" | "QUEUED" | "PUBLISHED" | "FAILED";

function fmtDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function PublishingQueuePage() {
  const [tab, setTab] = useState<Tab>("SCHEDULED");

  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    try {
      let data: ContentItem[] = [];
      if (tab === "SCHEDULED") data = await getScheduledContent();
      if (tab === "QUEUED") data = await getQueuedContent();
      if (tab === "PUBLISHED") data = await getPublishedContent(80);
      if (tab === "FAILED") data = await getFailedContent(80);

      setItems(data);
      setSelected({});
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to load items"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const it of items) next[it.id] = checked;
    setSelected(next);
  };

  const downloadCSV = async () => {
    setMsg(null);
    setActionLoading(true);
    try {
      const blob = await downloadBufferCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "buffer_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMsg("✅ Buffer CSV downloaded (Scheduled items).");
    } catch (e: any) {
      setMsg(`❌ ${e.message || "CSV download failed"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const requireSelection = () => {
    if (selectedIds.length === 0) {
      setMsg("⚠️ Select at least one item.");
      return false;
    }
    return true;
  };

  const doMarkQueued = async () => {
    setMsg(null);
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const res = await markQueued(selectedIds);
      setMsg(`✅ Marked ${res.queued} item(s) as QUEUED.`);
      await refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to mark queued"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const doMarkPublished = async () => {
    setMsg(null);
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const res = await publishViaMake(selectedIds);
      setMsg(`🚀 Sent ${res.sent} item(s) to Make for publishing.`);
      await refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to send to Make"}`);
    } finally {
      setActionLoading(false);
    }
  };


  const doUndoQueued = async () => {
    setMsg(null);
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const res = await undoQueued(selectedIds);
      setMsg(`✅ Reverted ${res.reverted} item(s) back to SCHEDULED.`);
      await refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to undo queued"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const doRetryFailed = async () => {
    setMsg(null);
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const res = await retryFailed(selectedIds);
      setMsg(`✅ Retried ${res.retried} failed item(s) → moved back to SCHEDULED.`);
      await refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to retry"}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gray-100 p-4">
      <div>
        <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Scheduling & Publishing Engine</h1>
        <p className="text-xs font-bold text-gray-400">
          Scheduled → Export → Buffer Queue → QUEUED → Confirm Published. Failed items can be retried.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["SCHEDULED", "QUEUED", "PUBLISHED", "FAILED"] as Tab[]).map((t) => (
          <Button
            key={t}
            className={tab === t ? "text-xs bg-gray-900 hover:text-white text-white" : "text-xs hover:text-white bg-white shadow"}
            onClick={() => setTab(t)}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <Card className="shadow-none p-4 space-y-3">
        {/* Selection + Actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-white shadow text-xs" onClick={() => toggleAll(true)} disabled={items.length === 0}>
              Select All
            </Button>
            <Button className="bg-white shadow text-xs" onClick={() => toggleAll(false)} disabled={items.length === 0}>
              Clear
            </Button>
          </div>

          {/* Tab Actions */}
          {tab === "SCHEDULED" && (
            <div className="flex gap-2 flex-wrap">
              <Button className="bg-blue-600 text-white text-xs" onClick={downloadCSV} disabled={actionLoading}>
                {actionLoading ? "Working..." : "Download Buffer CSV"}
              </Button>
              <Button className="bg-green-600 text-white text-xs" onClick={doMarkQueued} disabled={actionLoading}>
                {actionLoading ? "Working..." : `Mark QUEUED (${selectedIds.length})`}
              </Button>
            </div>
          )}

          {tab === "QUEUED" && (
            <div className="flex gap-2 flex-wrap text-xs">
              <Button className="bg-green-600 text-white text-xs" onClick={doMarkPublished} disabled={actionLoading}>
                {actionLoading ? "Working..." : `Confirm Published (${selectedIds.length})`}
              </Button>
              <Button className="bg-yellow-500 text-white text-xs" onClick={doUndoQueued} disabled={actionLoading}>
                {actionLoading ? "Working..." : `Undo → Scheduled (${selectedIds.length})`}
              </Button>
            </div>
          )}

          {tab === "FAILED" && (
            <div className="flex gap-2 flex-wrap">
              <Button className="bg-orange-600 text-white text-xs" onClick={doRetryFailed} disabled={actionLoading}>
                {actionLoading ? "Working..." : `Retry → Scheduled (${selectedIds.length})`}
              </Button>
            </div>
          )}
        </div>

        {msg && <div className="text-xs font-bold text-gray-500">{msg}</div>}

        <div className="text-xs text-gray-500 font-semibold">
          {tab} items: <b>{items.length}</b>
        </div>

        {/* List */}
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between bg-white shadow rounded p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={!!selected[it.id]}
                  onCheckedChange={() => setSelected((p) => ({ ...p, [it.id]: !p[it.id] }))}
                />

                <div className="space-y-1">
                  <div className="flex gap-2 text-xs flex-wrap">
                    <Badge className="text-white">
                      {it.platform}
                    </Badge>
                    <Badge className="text-white">
                      {it.content_type}
                    </Badge>
                    <Badge className="bg-green-500 text-white">{it.status}</Badge>
                  </div>

                  <p className=" max-w-[760px] truncate">
                    {(it.body_text || it.title || "—").slice(0, 180)}
                  </p>

                  <div className="text-[9px] text-gray-500 font-light mt-2">
                    Scheduled: <b>{fmtDate(it.scheduled_at)}</b>
                    {tab === "PUBLISHED" && (
                      <>
                        {" "}• Published: <b>{fmtDate(it.published_at)}</b>
                        {it.published_url ? (
                          <>
                            {" "}• <a className="underline" href={it.published_url} target="_blank">Link</a>
                          </>
                        ) : null}
                      </>
                    )}
                    {tab === "FAILED" && it.last_error ? (
                      <>
                        {" "}• Error: <span className="text-red-600 font-semibold">{it.last_error.slice(0, 90)}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 text-right">
                <div>ID</div>
                <div className="font-mono">{String(it.id).slice(0, 8)}…</div>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="text-xs text-gray-500">No {tab} items right now.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
