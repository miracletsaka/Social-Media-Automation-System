// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not set. Add it in .env.local");
}

export type Platform = string;
export type ContentType = "text" | "image" | "video";

export type Status =
  | "TOPIC_INGESTED"
  | "GENERATING"
  | "DRAFT_READY"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SCHEDULED"
  | "QUEUED"
  | "PUBLISHED"
  | "FAILED";

export interface ContentItem {
  id: string;
  topic_id: string;
  brand_id?: string;
  platform: Platform;
  content_type: ContentType;
  status: Status;

  title?: string | null;
  body_text?: string | null;
  hashtags?: string | null;

  scheduled_at?: string | null;
  published_at?: string | null;
  published_url?: string | null;

  last_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // ✅ media
  media_type?: "image" | "video" | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  media_provider?: string | null;
  media_caption?: string | null;
}

export type Brand = {
  id: string;
  display_name: string;
  is_active: boolean;
};

export type PlatformRow = {
  id: string;
  display_name: string;
  is_active: boolean;
};

export type OverviewStats = {
  by_status: { status: string; count: number }[];
  by_platform: { platform: string; count: number }[];
  by_brand: { brand_id: string; count: number }[];
};

export type BrandProfile = {
  brand_id: string
  website_url?: string | null
  status: "IDLE" | "SCRAPING" | "READY" | "FAILED" | string
  last_error?: string | null
  last_scraped_at?: string | null
  pages_scraped?: string[]
  profile_summary?: string | null
  profile_json?: any
  colors?: any[]
  tone_tags?: string[]
  services?: any[]
  audiences?: any[]
  notes_manual_override?: string | null
}

export type UserRow = {
  id: string;
  email: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
};

export type Me = { id: string; email: string; is_email_verified: boolean };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export function apiMe() {
  return api<Me>("/auth/me");
}

export function listUsers() {
  return api<UserRow[]>(`/users`, {
    method: "GET",
    credentials: "include",
  });
}

export function changePassword(payload: { current_password: string; new_password: string }) {
  return api<{ ok: boolean }>(`/auth/change-password`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: { email: string; }) {
  return api<{ ok: boolean; message: string }>(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return api<{ ok: boolean; user: { id: string; email: string; is_email_verified: boolean } }>(`/auth/login`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export function logoutUser() {
  return api<{ ok: boolean }>(`/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export function getMe() {
  return api<{ id: string; email: string; is_email_verified: boolean }>(`/auth/me`);
}

export function verifyEmail(token: string) {
  return api<{ ok: boolean; message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function upsertBrandProfile(
  brand_id: string,
  payload: {
    notes_manual_override?: string | null
    profile_summary?: string | null
    profile_json?: any
  }
) {
  return api<{ ok: boolean; brand_id: string }>(`/brand-profiles/${encodeURIComponent(brand_id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function getBrandProfile(brand_id: string) {
  return api<BrandProfile>(`/brand-profiles/${encodeURIComponent(brand_id)}`)
}

export function startBrandScrape(payload: { brand_id: string; website_url: string }) {
  return api<{ ok: boolean; brand_id: string; status: string }>(`/brand-profiles/scrape`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/* =========================
   ✅ MEDIA GENERATION (Make)
   ========================= */

/**
 * ✅ Correct route (your backend):
 * POST /media/generate
 * body: { content_item_ids: [...] }
 */
export async function generateMediaViaMake(content_item_ids: string[]) {
  return api<{ generated: number; skipped?: number; skipped_items?: any[] }>(`/media/generate`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids }),
  });
}

/**
 * Optional (only if you built /media/attach)
 * If you're using Make -> /media/ingest then you may not need this.
 */
export async function attachMedia(payload: {
  content_item_id: string;
  media_url: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
  media_provider?: string;
}) {
  return api<{ ok: boolean; id: string; media_url: string; media_type: string }>(`/media/attach`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   ✅ PUBLISHING (Make)
   ========================= */

export async function publishViaMake(content_item_ids: string[]) {
  return api<{ sent: number; skipped?: number; skipped_items?: any[] }>(`/make/publish`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids }),
  });
}

export async function markPublished(content_item_ids: string[], published_url?: string) {
  return api<{
    published: number;
    skipped?: number;
    skipped_items?: { id: string; status: string; reason: string }[];
  }>(`/publishing/mark-published`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids, published_url }),
  });
}

export async function undoQueued(content_item_ids: string[]) {
  return api<{
    reverted: number;
    skipped?: number;
    skipped_items?: { id: string; status: string; reason: string }[];
  }>(`/publishing/undo-queued`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids }),
  });
}

export async function retryFailed(content_item_ids: string[]) {
  return api<{ retried: number }>(`/publishing/retry-failed`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids }),
  });
}

/* =========================
   ✅ CONTENT LISTS
   ========================= */

export async function getPublishedContent(limit = 50) {
  return api<ContentItem[]>(`/content/published?limit=${limit}`);
}

export async function getFailedContent(limit = 50) {
  return api<ContentItem[]>(`/content/failed?limit=${limit}`);
}

export async function getQueuedContent() {
  return api<ContentItem[]>(`/content/queued`);
}

export async function getScheduledContent() {
  return api<ContentItem[]>(`/content/scheduled`);
}

export async function getApprovedContent(params?: { brand_id?: string; platform?: string; content_type?: string }) {
  const qs = new URLSearchParams();
  if (params?.brand_id) qs.set("brand_id", params.brand_id);
  if (params?.platform) qs.set("platform", params.platform);
  if (params?.content_type) qs.set("content_type", params.content_type);
  const q = qs.toString();
  return api<ContentItem[]>(`/content/approved${q ? `?${q}` : ""}`);
}

export function getPendingApproval() {
  return api<ContentItem[]>("/content/pending-approval");
}

export function getAllContent() {
  return api<ContentItem[]>("/content/all");
}

export function getRecentContent(limit = 8) {
  return api<ContentItem[]>(`/content/recent?limit=${limit}`);
}

/* =========================
   ✅ SCHEDULING
   ========================= */

export async function bulkSchedule(payload: { content_item_ids: string[]; scheduled_at: string }) {
  return api<{ scheduled: number; scheduled_at: string }>("/schedule/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================
   ✅ EXPORT / QUEUE
   ========================= */

export async function downloadBufferCSV(params?: {
  brand_id?: string;
  platform?: string;
  from_dt?: string;
  to_dt?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.brand_id) qs.set("brand_id", params.brand_id);
  if (params?.platform) qs.set("platform", params.platform);
  if (params?.from_dt) qs.set("from_dt", params.from_dt);
  if (params?.to_dt) qs.set("to_dt", params.to_dt);

  const res = await fetch(`${API_BASE}/export/buffer.csv?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  return blob;
}

export async function markQueued(content_item_ids: string[]) {
  return api<{
    queued: number;
    skipped?: number;
    skipped_items?: { id: string; status: string; reason: string }[];
  }>(`/export/mark-queued`, {
    method: "POST",
    body: JSON.stringify({ content_item_ids }),
  });
}

/* =========================
   ✅ PLATFORMS / BRANDS
   ========================= */

export async function listPlatforms(active_only = true) {
  return api<PlatformRow[]>(`/platforms?active_only=${active_only ? "true" : "false"}`);
}

export async function createPlatform(payload: { id: string; display_name: string; is_active?: boolean }) {
  return api<PlatformRow>("/platforms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePlatform(platformId: string, payload: { display_name?: string; is_active?: boolean }) {
  return api<PlatformRow>(`/platforms/${platformId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listBrands(active_only = true) {
  return api<Brand[]>(`/brands?active_only=${active_only ? "true" : "false"}`);
}

export function createBrand(payload: { id: string; display_name: string; is_active?: boolean }) {
  return api<Brand>("/brands", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBrand(brandId: string, payload: { display_name?: string; is_active?: boolean }) {
  return api<Brand>(`/brands/${brandId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

/* =========================
   ✅ TOPICS + APPROVAL ACTIONS
   ========================= */

export function createTopics(payload: {
  topics: string[];
  brand_id: string;
  platforms: Platform[];
  content_types: ContentType[];
}) {
  return api<{ content_items_created: number }>("/topics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function moveToPending(id: string) {
  return api<{ id: string; status: string }>(`/content/${id}/move-to-pending`, {
    method: "POST",
  });
}

export function bulkApprove(ids: string[]) {
  return api<{ approved: number }>("/approvals/approve", {
    method: "POST",
    body: JSON.stringify({ content_item_ids: ids }),
  });
}

export function bulkReject(ids: string[], reason?: string) {
  return api<{ rejected: number }>("/approvals/reject", {
    method: "POST",
    body: JSON.stringify({ content_item_ids: ids, reason }),
  });
}

/* =========================
   ✅ TEXT GENERATION
   ========================= */

export function generateTextDrafts(payload?: {
  brand_id?: string;
  content_item_ids?: string[];
  mode?: "new" | "rejected";
  platform?: "facebook" | "instagram" | "linkedin";
  content_type?: "text" | "image" | "video";

  // ✅ brand context (scraped)
  brand_profile_summary?: string;
  brand_profile_json?: any;
}) {
  return api<{ generated: number; note?: string }>("/generation/text", {
    method: "POST",
    body: JSON.stringify({
      brand_id: payload?.brand_id ?? "neuroflow-ai",
      content_item_ids: payload?.content_item_ids,
      mode: payload?.mode,
      platform: payload?.platform,
      content_type: payload?.content_type,

      // ✅ pass through
      brand_profile_summary: payload?.brand_profile_summary,
      brand_profile_json: payload?.brand_profile_json,
    }),
  });
}

export function generateNewText(
  brand_id = "neuroflow-ai",
  platform?: "facebook" | "instagram" | "linkedin",
  content_type: "text" | "image" | "video" = "text"
) {
  return generateTextDrafts({ brand_id, mode: "new", platform, content_type });
}

export function regenerateRejectedText(
  brand_id = "neuroflow-ai",
  platform?: "facebook" | "instagram" | "linkedin",
  content_type: "text" | "image" | "video" = "text"
) {
  return generateTextDrafts({ brand_id, mode: "rejected", platform, content_type });
}

export function generateTextForSelected(
  ids: string[],
  brand_id = "neuroflow-ai",
  platform?: "facebook" | "instagram" | "linkedin",
  content_type: "text" | "image" | "video" = "text"
) {
  return generateTextDrafts({ brand_id, content_item_ids: ids, platform, content_type });
}

export function getOverviewStats() {
  return api<OverviewStats>("/stats/overview");
}
