"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bulkSchedule,
  getApprovedContent,
  getScheduledContent,
  getQueuedContent,
  downloadBufferCSV,
  markQueued,
  markPublished,
  undoQueued,
  listBrands,
  listPlatforms,
  type ContentItem,
  type Brand,
  type PlatformRow,
  publishViaMake,
} from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clipboard, RefreshCcw } from "lucide-react";

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Tab = "scheduled" | "queued";

type ActionDetails = {
  title: string;
  successLine: string;
  skipped?: number;
  skipped_items?: { id: string; status: string; reason: string }[];
};

export default function SchedulingPage() {
  // Filters (Brand/Platform)
  const [brands, setBrands] = useState<Brand[]>([]);
  const [platforms, setPlatforms] = useState<PlatformRow[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Step 1: Approved -> Schedule
  const [approvedItems, setApprovedItems] = useState<ContentItem[]>([]);
  const [approvedSelected, setApprovedSelected] = useState<Record<string, boolean>>({});
  const [when, setWhen] = useState<string>(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000))
  );
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [actionLoadingApproved, setActionLoadingApproved] = useState(false);

  // Step 2/3: Bridge (Scheduled + Queued)
  const [tab, setTab] = useState<Tab>("scheduled");

  const [scheduledItems, setScheduledItems] = useState<ContentItem[]>([]);
  const [scheduledSelected, setScheduledSelected] = useState<Record<string, boolean>>({});
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  const [queuedItems, setQueuedItems] = useState<ContentItem[]>([]);
  const [queuedSelected, setQueuedSelected] = useState<Record<string, boolean>>({});
  const [loadingQueued, setLoadingQueued] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [bridgeLoading, setBridgeLoading] = useState(false);

  // UX additions
  const [details, setDetails] = useState<ActionDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>("");

  const approvedSelectedIds = useMemo(
    () => Object.entries(approvedSelected).filter(([, v]) => v).map(([k]) => k),
    [approvedSelected]
  );

  const scheduledSelectedIds = useMemo(
    () => Object.entries(scheduledSelected).filter(([, v]) => v).map(([k]) => k),
    [scheduledSelected]
  );

  const queuedSelectedIds = useMemo(
    () => Object.entries(queuedSelected).filter(([, v]) => v).map(([k]) => k),
    [queuedSelected]
  );

  const filteredScheduled = useMemo(() => {
    return scheduledItems.filter((it) => {
      if (brandFilter !== "all" && it.brand_id !== brandFilter) return false;
      if (platformFilter !== "all" && it.platform !== platformFilter) return false;
      return true;
    });
  }, [scheduledItems, brandFilter, platformFilter]);

  const filteredQueued = useMemo(() => {
    return queuedItems.filter((it) => {
      if (brandFilter !== "all" && it.brand_id !== brandFilter) return false;
      if (platformFilter !== "all" && it.platform !== platformFilter) return false;
      return true;
    });
  }, [queuedItems, brandFilter, platformFilter]);

  useEffect(() => {
    (async () => {
      try {
        const [b, p] = await Promise.all([listBrands(false), listPlatforms(false)]);
        setBrands(b);
        setPlatforms(p);
      } catch {
        // optional
      }
    })();
  }, []);

  useEffect(() => {
    refreshApproved();
    refreshScheduled();
    refreshQueued();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFeedback = () => {
    setMsg(null);
    setDetails(null);
    setShowDetails(false);
  };

  const refreshApproved = async () => {
    setLoadingApproved(true);
    resetFeedback();
    try {
      const data = await getApprovedContent();
      setApprovedItems(data);
      setApprovedSelected({});
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to load approved items"}`);
    } finally {
      setLoadingApproved(false);
    }
  };

  const refreshScheduled = async () => {
    setLoadingScheduled(true);
    resetFeedback();
    try {
      const data = await getScheduledContent();
      setScheduledItems(data);
      setScheduledSelected({});
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to load scheduled items"}`);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const refreshQueued = async () => {
    setLoadingQueued(true);
    resetFeedback();
    try {
      const data = await getQueuedContent();
      setQueuedItems(data);
      setQueuedSelected({});
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Failed to load queued items"}`);
    } finally {
      setLoadingQueued(false);
    }
  };

  // Step 1: schedule
  const toggleAllApproved = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const it of approvedItems) next[it.id] = checked;
    setApprovedSelected(next);
  };

  const scheduleSelectedApproved = async () => {
    resetFeedback();

    if (approvedSelectedIds.length === 0) {
      setMsg("⚠️ Select at least one APPROVED item to schedule.");
      return;
    }
    if (!when) {
      setMsg("⚠️ Choose a schedule time.");
      return;
    }

    const dt = new Date(when);
    if (Number.isNaN(dt.getTime())) {
      setMsg("❌ Invalid datetime.");
      return;
    }

    setActionLoadingApproved(true);
    try {
      const res = await bulkSchedule({
        content_item_ids: approvedSelectedIds,
        scheduled_at: dt.toISOString(),
      });
      setMsg(
        `✅ Scheduled ${res.scheduled} item(s) for ${new Date(res.scheduled_at).toLocaleString()}`
      );
      await Promise.all([refreshApproved(), refreshScheduled()]);
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Scheduling failed"}`);
    } finally {
      setActionLoadingApproved(false);
    }
  };

  // Step 2: export csv + mark queued
  const toggleAllScheduled = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const it of filteredScheduled) next[it.id] = checked;
    setScheduledSelected(next);
  };

  const exportCsv = async () => {
    resetFeedback();
    setBridgeLoading(true);
    try {
      const blob = await downloadBufferCSV({
        brand_id: brandFilter === "all" ? undefined : brandFilter,
        platform: platformFilter === "all" ? undefined : platformFilter,
      });
      downloadBlob(blob, `buffer_export_${new Date().toISOString().slice(0, 19)}.csv`);
      setMsg("✅ CSV downloaded. Import into Buffer to Queue posts.");
    } catch (e: any) {
      setMsg(`❌ ${e.message || "CSV export failed"}`);
    } finally {
      setBridgeLoading(false);
    }
  };

  const markSelectedQueued = async () => {
    resetFeedback();

    if (scheduledSelectedIds.length === 0) {
      setMsg("⚠️ Select at least one SCHEDULED item to mark as QUEUED.");
      return;
    }

    setBridgeLoading(true);
    try {
      const res = await markQueued(scheduledSelectedIds);
      setMsg(`✅ Queued ${res.queued}.`);
      setDetails({
        title: "Mark Queued",
        successLine: `Queued: ${res.queued}`,
        skipped: res.skipped,
        skipped_items: res.skipped_items,
      });
      setShowDetails(!!(res.skipped_items && res.skipped_items.length));
      await Promise.all([refreshScheduled(), refreshQueued()]);
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Mark queued failed"}`);
    } finally {
      setBridgeLoading(false);
    }
  };

  // Step 3: confirm published + undo
  const toggleAllQueued = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const it of filteredQueued) next[it.id] = checked;
    setQueuedSelected(next);
  };

  const confirmPublished = async () => {
    resetFeedback();

    if (queuedSelectedIds.length === 0) {
      setMsg("⚠️ Select at least one QUEUED item to confirm as PUBLISHED.");
      return;
    }

    setBridgeLoading(true);
    try {
      const url = publishedUrl.trim() || undefined;
      const res = await publishViaMake(queuedSelectedIds);

      setMsg(
        url
          ? `✅ Published ${res}. (URL applied)`
          : `✅ Published ${res}.`
      );

      setDetails({
        title: "Confirm Published",
        successLine: `Published: ${res}`,
        skipped: res.skipped,
        skipped_items: res.skipped_items,
      });
      setShowDetails(!!(res.skipped_items && res.skipped_items.length));

      setPublishedUrl("");
      await refreshQueued();
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Mark published failed"}`);
    } finally {
      setBridgeLoading(false);
    }
  };

  const undoSelectedQueued = async () => {
    resetFeedback();

    if (queuedSelectedIds.length === 0) {
      setMsg("⚠️ Select at least one QUEUED item to undo back to SCHEDULED.");
      return;
    }

    setBridgeLoading(true);
    try {
      const res = await undoQueued(queuedSelectedIds);
      setMsg(`✅ Reverted ${res.reverted} back to SCHEDULED.`);
      setDetails({
        title: "Undo Queued",
        successLine: `Reverted: ${res.reverted}`,
        skipped: res.skipped,
        skipped_items: res.skipped_items,
      });
      setShowDetails(!!(res.skipped_items && res.skipped_items.length));
      await Promise.all([refreshQueued(), refreshScheduled()]);
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Undo queued failed"}`);
    } finally {
      setBridgeLoading(false);
    }
  };

  const copyText = async (it: ContentItem) => {
    const text = (it.body_text || it.title || "").trim();
    if (!text) {
      setMsg("⚠️ Nothing to copy for this item.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setMsg("✅ Copied to clipboard.");
    } catch {
      setMsg("❌ Clipboard blocked by browser. Try HTTPS or allow clipboard permissions.");
    }
  };

  const ItemRow = ({
    it,
    checked,
    onToggle,
    showCopy,
  }: {
    it: ContentItem;
    checked: boolean;
    onToggle: () => void;
    showCopy?: boolean;
  }) => (
    <div className="flex items-center justify-between bg-white shadow rounded p-3 gap-3">
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} onCheckedChange={onToggle} />
        <div className="space-y-1">
          <div className="flex gap-2 flex-wrap items-center">
            <Badge className="bg-blue-500 text-xs font-bold text-gray-50">
              {it.platform}
            </Badge>
            <Badge className="bg-orange-500 text-xs font-bold text-gray-50">
              {it.content_type}
            </Badge>
            <Badge className="bg-green-500 text-xs font-bold text-gray-50">{it.status}</Badge>
            {it.brand_id && (
              <Badge  className="bg-purple-500 text-xs font-bold text-gray-50">
                {it.brand_id}
              </Badge>
            )}

            {showCopy && (
              <Button
                className="bg-white shadow text-xs text-gray-400 hover:text-white"
                onClick={() => copyText(it)}
                type="button"
              >
                <Clipboard />
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-400 max-w-[760px] truncate">
            {(it.body_text || it.title || "—").slice(0, 180)}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 text-right min-w-[160px]">
        {it.scheduled_at && (
          <>
            <div>Scheduled</div>
            <div>{new Date(it.scheduled_at).toLocaleString()}</div>
          </>
        )}
        <div className="mt-2">Updated</div>
        <div>{it.updated_at ? new Date(it.updated_at).toLocaleString() : "-"}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-1 bg-gray-100 p-4">
      <div>
        <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Scheduling & Publishing</h1>
      </div>
      {msg && <div className="text-xs font-bold text-gray-500">{msg}</div>}
      {/* Details Panel */}
      {details && (
        <Card className="shadow-none p-4 bg-white shadow space-y-2 shadow-none">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-600">
              Action Result: {details.title}
            </div>
            <Button
              className="bg-white shadow text-xs"
              onClick={() => setShowDetails((s) => !s)}
            >
              {showDetails ? "Hide details" : "Show details"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            {details.successLine}
            {typeof details.skipped === "number" ? ` • Skipped: ${details.skipped}` : ""}
          </div>

          {showDetails && (
            <div className="mt-2 space-y-2">
              {details.skipped_items?.length ? (
                <div className="space-y-2">
                  {details.skipped_items.map((s) => (
                    <div key={s.id} className="text-xs bg-gray-50 border rounded p-2">
                      <div className="text-gray-600">
                        <b>ID:</b> {s.id}
                      </div>
                      <div className="text-gray-600">
                        <b>Status:</b> {s.status}
                      </div>
                      <div className="text-gray-600">
                        <b>Reason:</b> {s.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No skipped items.</div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Step 1: Approved -> Schedule */}
      <Card className="shadow-none p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Button className="text-xs font-bold text-gray-400 bg-white shadow" onClick={refreshApproved} disabled={loadingApproved}>
              {loadingApproved ? "Loading..." : "Refresh Approved"}
            </Button>

            <Button
              className="text-xs font-bold text-gray-50"
              onClick={() => toggleAllApproved(true)}
              disabled={loadingApproved || approvedItems.length === 0}
            >
              Select All
            </Button>

            <Button
              className="text-xs font-bold text-gray-400 bg-white shadow"
              onClick={() => toggleAllApproved(false)}
              disabled={loadingApproved || approvedItems.length === 0}
            >
              Clear
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-1 md:items-center">
            <input
              className="font-bold text-gray-400 bg-white shadow rounded px-3 py-2 text-xs"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <Button
              className="text-xs font-bold text-gray-50 bg-green-600 text-white"
              onClick={scheduleSelectedApproved}
              disabled={actionLoadingApproved}
            >
              {actionLoadingApproved
                ? "Scheduling..."
                : `Schedule Selected (${approvedSelectedIds.length})`}
            </Button>
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 font-bold">
          Approved items: <b>{approvedItems.length}</b>
        </div>

        <div className="space-y-2">
          {approvedItems.map((it) => (
            <ItemRow
              key={it.id}
              it={it}
              checked={!!approvedSelected[it.id]}
              onToggle={() => setApprovedSelected((p) => ({ ...p, [it.id]: !p[it.id] }))}
              showCopy
            />
          ))}

          {!loadingApproved && approvedItems.length === 0 && (
            <div className="text-xs text-gray-500">No APPROVED items ready to schedule.</div>
          )}
        </div>
      </Card>

      {/* Publishing Bridge */}
      <Card className="shadow-none p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <Button
              className={tab === "scheduled" ? "bg-gray-900 text-white" : "text-xs text-gray-400 font-bold hover:text-white bg-white shadow"}
              onClick={() => setTab("scheduled")}
            >
              Scheduled
            </Button>
            <Button
              className={tab === "queued" ? "bg-gray-900 text-white" : "text-xs text-gray-400 font-bold hover:text-white bg-white shadow"}
              onClick={() => setTab("queued")}
            >
              Queued
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <select
              className="bg-white shadow rounded px-3 py-2 text-xs text-gray-400"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.display_name || b.id}
                </option>
              ))}
            </select>

            <select
              className="bg-white shadow rounded px-3 py-2 text-xs text-gray-400"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All Platforms</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name || p.id}
                </option>
              ))}
            </select>

            <Button
              className="text-xs text-gray-400 font-bold hover:text-white bg-white shadow"
              onClick={async () => {
                await Promise.all([refreshScheduled(), refreshQueued()]);
              }}
              disabled={loadingScheduled || loadingQueued}
            >
              <RefreshCcw />
            </Button>
          </div>
        </div>

        {tab === "scheduled" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-gray-400">
                Scheduled items: <b>{filteredScheduled.length}</b>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="text-xs text-gray-50 font-bold hover:text-white" onClick={exportCsv} disabled={bridgeLoading}>
                  {bridgeLoading ? "Exporting..." : "Download Buffer CSV"}
                </Button>

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-gray-900 text-white"
                  onClick={() => toggleAllScheduled(true)}
                  disabled={filteredScheduled.length === 0 || loadingScheduled}
                >
                  Select All
                </Button>

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-white shadow"
                  onClick={() => toggleAllScheduled(false)}
                  disabled={filteredScheduled.length === 0 || loadingScheduled}
                >
                  Clear
                </Button>

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-blue-600 text-white"
                  onClick={markSelectedQueued}
                  disabled={bridgeLoading}
                >
                  {bridgeLoading ? "Working..." : `Mark Queued (${scheduledSelectedIds.length})`}
                </Button>
              </div>
            </div>

            <div className="space-y-2"  id="scheduled">
              {loadingScheduled ? (
                <div className="text-xs text-gray-500">Loading scheduled items...</div>
              ) : filteredScheduled.length === 0 ? (
                <div className="text-xs text-gray-500">No SCHEDULED items for this filter.</div>
              ) : (
                filteredScheduled.map((it) => (
                  <ItemRow
                    key={it.id}
                    it={it}
                    checked={!!scheduledSelected[it.id]}
                    onToggle={() =>
                      setScheduledSelected((p) => ({ ...p, [it.id]: !p[it.id] }))
                    }
                    showCopy
                  />
                ))
              )}
            </div>
          </div>
        )}

        {tab === "queued" && (
          <div className="space-y-3" id="queued">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-gray-400">
                Queued items: <b>{filteredQueued.length}</b>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <input
                  className="bg-white shadow rounded px-3 py-2 text-xs text-gray-400 min-w-[280px]"
                  placeholder="Optional: Published URL (applies to all selected)"
                  value={publishedUrl}
                  onChange={(e) => setPublishedUrl(e.target.value)}
                />

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-gray-900 text-white"
                  onClick={() => toggleAllQueued(true)}
                  disabled={filteredQueued.length === 0 || loadingQueued}
                >
                  Select All
                </Button>

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-white shadow"
                  onClick={() => toggleAllQueued(false)}
                  disabled={filteredQueued.length === 0 || loadingQueued}
                >
                  Clear
                </Button>

                <Button
                  className="text-xs text-gray-50 font-bold hover:text-white bg-green-600"
                  onClick={confirmPublished}
                  disabled={bridgeLoading}
                >
                  {bridgeLoading ? "Working..." : `Confirm Published (${queuedSelectedIds.length})`}
                </Button>

                <Button
                  className="text-xs text-gray-400 font-bold hover:text-white bg-white shadow"
                  onClick={undoSelectedQueued}
                  disabled={bridgeLoading}
                >
                  {bridgeLoading ? "Working..." : `Undo (${queuedSelectedIds.length})`}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {loadingQueued ? (
                <div className="text-xs text-gray-500">Loading queued items...</div>
              ) : filteredQueued.length === 0 ? (
                <div className="text-xs text-gray-500">No QUEUED items for this filter.</div>
              ) : (
                filteredQueued.map((it) => (
                  <ItemRow
                    key={it.id}
                    it={it}
                    checked={!!queuedSelected[it.id]}
                    onToggle={() => setQueuedSelected((p) => ({ ...p, [it.id]: !p[it.id] }))}
                    showCopy
                  />
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
