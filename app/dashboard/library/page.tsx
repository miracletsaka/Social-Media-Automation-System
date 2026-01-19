"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllContent,
  type ContentItem,
  type Platform,
  type ContentType,
  type Status,
} from "@/lib/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { generateNewText, regenerateRejectedText } from "@/lib/api";
import { RefreshCcw } from "lucide-react";

const PLATFORMS: (Platform | "all")[] = ["all", "facebook", "instagram", "linkedin"];
const TYPES: (ContentType | "all")[] = ["all", "text", "image", "video"];
const STATUSES: (Status | "all")[] = [
  "all",
  "TOPIC_INGESTED",
  "GENERATING",
  "DRAFT_READY",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
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

function statusBadgeVariant(status: string) {
  // keep it simple; shadcn variants differ per setup
  return "default";
}

export default function LibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  // filters
  const [platform, setPlatform] = useState<(Platform | "all")>("all");
  const [ctype, setCtype] = useState<(ContentType | "all")>("all");
  const [status, setStatus] = useState<(Status | "all")>("all");
  const [q, setQ] = useState("");

  const [genBrand, setGenBrand] = useState("neuroflow-ai");
  const [genType, setGenType] = useState<"all" | "text" | "image" | "video">("text");

  const [genPlatform, setGenPlatform] = useState<"all" | "facebook" | "instagram" | "linkedin">("all");

  // preview
  const [active, setActive] = useState<ContentItem | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getAllContent();
      setItems(data);
      setActive(null);
    } catch (e: any) {
      setErr(e.message || "Failed to load content library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (platform !== "all" && it.platform !== platform) return false;
      if (ctype !== "all" && it.content_type !== ctype) return false;
      if (status !== "all" && it.status !== status) return false;

      const needle = q.trim().toLowerCase();
      if (!needle) return true;

      const hay =
        `${it.id} ${it.topic_id} ${it.platform} ${it.content_type} ${it.status} ${it.title ?? ""} ${it.body_text ?? ""} ${it.hashtags ?? ""}`.toLowerCase();

      return hay.includes(needle);
    });
  }, [items, platform, ctype, status, q]);

  // quick counts
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of items) map[it.status] = (map[it.status] || 0) + 1;
    return map;
  }, [items]);

  return (
    <div className="bg-gray-100 space-y-1">
      <div className="p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-sm text-gray-600 font-bold">Content Library</h1>
        </div>
        <div className="flex gap-1">
          <Button className="text-white text-xs font--bold"  onClick={refresh} disabled={loading || genLoading}>
            {loading ? "Loading..." : <RefreshCcw />}
          </Button>
          <Button className="text-white text-xs font--bold"
            
            onClick={async () => {
              setErr(null);
              setGenLoading(true);
              try {
                const platformFilter = genPlatform === "all" ? undefined : (genPlatform as any);
                const typeFilter = genType === "all" ? undefined : (genType as any);
                const res = await regenerateRejectedText(genBrand, platformFilter, (typeFilter ?? "text") as any);
                await refresh();
                alert(`✅ Regenerated ${res.generated} rejected drafts.`);
              } catch (e: any) {
                setErr(e.message || "Regenerate rejected failed");
              } finally {
                setGenLoading(false);
              }
            }}
            disabled={loading || genLoading}
          >
            {genLoading ? "Working..." : "Regenerate rejected"}
          </Button>
        </div>

      </div>

      {/* status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
        {["PENDING_APPROVAL", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"].map((s) => (
          <Card key={s} className="rounded-none p-4 bg-white shadow">
            <div className="text-xs text-xs text-gray-400 font-bold">{s.replaceAll("_", " ")}</div>
            <div className="text-xs text-gray-400 font-semibold">{counts[s] ?? 0}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Platform</div>
            <select
              className="w-full text-gray-400 rounded text-xs font-bold shadow bg-white px-3 py-2"
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
            <div className="text-sm font-medium">Content Type</div>
            <select
              className="w-full text-gray-400 rounded text-xs font-bold shadow bg-white px-3 py-2"
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
            <div className="text-sm font-medium">Status</div>
            <select
              className="w-full text-gray-400 rounded text-xs font-bold shadow bg-white px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Search</div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search id / topic / text / hashtags..."
            />
          </div>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="rounded space-y-1 overflow-hidden">
          <div className="grid grid-cols-[140px_120px_140px_1fr_180px_90px] gap-2 p-3 bg-gray-200 text-xs font-bold text-gray-600">
            <div>Platform</div>
            <div>Type</div>
            <div>Status</div>
            <div>Preview</div>
            <div>Created</div>
            <div>View</div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-xs text-gray-400 font-bold">Loading content items...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-xs text-gray-400 font-bold">No items match the filters.</div>
          ) : (
            filtered.map((it) => (
              <div
                key={it.id}
                className="grid grid-cols-[140px_120px_140px_1fr_180px_90px] gap-2 p-3 shadow bg-white text-xs font-bold text-gray-400 items-center"
              >
                <div>
                  <Badge variant="secondary" className="capitalize">
                    {it.platform}
                  </Badge>
                </div>

                <div>
                  <Badge  className="capitalize text-white">
                    {it.content_type}
                  </Badge>
                </div>

                <div>
                  <Badge variant={statusBadgeVariant(it.status)} className="capitalize text-white">
                    {it.status.toLowerCase().replaceAll("_", " ")}
                  </Badge>
                </div>

                <div className="text-xs text-gray-400 font-bold truncate">
                  {(it.body_text || it.title || it.last_error || "").slice(0, 140) || "—"}
                </div>

                <div className="text-xs text-gray-400 font-bold">{fmtDate(it.created_at)}</div>

                <div>
                  <Button className="text-white text-xs font--bold" size="sm"  onClick={() => setActive(it)}>
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Preview Drawer */}
      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent side="right" className="p-5 w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Content Preview</SheetTitle>
          </SheetHeader>

          {active && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="capitalize">
                  {active.platform}
                </Badge>
                <Badge  className="capitalize">
                  {active.content_type}
                </Badge>
                <Badge className="capitalize">
                  {active.status.toLowerCase().replaceAll("_", " ")}
                </Badge>
              </div>

              <div className="text-sm">
                <div className="font-medium">Content ID</div>
                <div className="text-xs text-gray-400 font-bold break-all">{active.id}</div>
              </div>

              <div className="text-sm">
                <div className="font-medium">Topic ID</div>
                <div className="text-xs text-gray-400 font-bold break-all">{active.topic_id}</div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-sm">Title</div>
                <div className="border rounded-md p-3 whitespace-pre-wrap text-sm">
                  {active.title || "—"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-sm">Body</div>
                <div className="border rounded-md p-3 whitespace-pre-wrap text-sm">
                  {active.body_text || "—"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-sm">Hashtags</div>
                <div className="border rounded-md p-3 whitespace-pre-wrap text-sm">
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
                  <div className="text-xs text-gray-400 font-bold">{fmtDate(active.created_at)}</div>
                </div>
                <div>
                  <div className="font-medium">Updated</div>
                  <div className="text-xs text-gray-400 font-bold">{fmtDate(active.updated_at)}</div>
                </div>
              </div>

              <div className="text-sm grid grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">Scheduled</div>
                  <div className="text-xs text-gray-400 font-bold">{fmtDate(active.scheduled_at)}</div>
                </div>
                <div>
                  <div className="font-medium">Published</div>
                  <div className="text-xs text-gray-400 font-bold">{fmtDate(active.published_at)}</div>
                </div>
              </div>

              {active.published_url && (
                <div className="text-sm">
                  <div className="font-medium">Published URL</div>
                  <a
                    href={active.published_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {active.published_url}
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="text-white text-xs font--bold"  onClick={() => setActive(null)}>
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
