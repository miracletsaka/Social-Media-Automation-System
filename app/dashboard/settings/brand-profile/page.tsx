"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
  listBrands,
  type Brand,
  getBrandProfile,
  startBrandScrape,
  type BrandProfile,
} from "@/lib/api";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusColor(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "READY") return "bg-green-600 text-white";
  if (s === "SCRAPING") return "bg-indigo-600 text-white";
  if (s === "FAILED") return "bg-red-600 text-white";
  if (s === "IDLE") return "bg-gray-700 text-white";
  return "bg-gray-600 text-white";
}

export default function SettingsBrandProfilePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>("");

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string>("");

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [scraping, setScraping] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Load brand list
  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        setLoadingBrands(true);
        const data = await listBrands(true);
        setBrands(data);

        const preferred = data.find((b) => b.id === "neuroflow-ai")?.id || data[0]?.id || "";
        setBrandId(preferred);
      } catch (e: any) {
        setErr(e.message || "Failed to load brands");
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  // Load profile whenever brand changes
  useEffect(() => {
    if (!brandId) return;

    (async () => {
      setErr(null);
      setOkMsg(null);
      setLoadingProfile(true);
      try {
        const p = await getBrandProfile(brandId);
        setProfile(p);
        setWebsiteUrl(p.website_url || "");
      } catch (e: any) {
        // Your backend GET auto-creates if missing, so this normally won’t happen.
        setErr(e.message || "Failed to load brand profile");
        setProfile(null);
        setWebsiteUrl("");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [brandId]);

  const selectedBrandName = useMemo(() => {
    return brands.find((b) => b.id === brandId)?.display_name || brandId || "—";
  }, [brands, brandId]);

  const scrapeNow = async () => {
    if (!brandId) return;

    setErr(null);
    setOkMsg(null);

    const url = websiteUrl.trim();
    if (!url) {
      setErr("Website URL is required.");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setErr("Website URL must start with http:// or https://");
      return;
    }

    setScraping(true);
    try {
      // ✅ FIX: backend expects a DICT payload, not a string
      const res = await startBrandScrape({
        brand_id: brandId,
        website_url: url,
      });

      // Optimistic UI update
      setProfile((prev) =>
        prev
          ? { ...prev, website_url: url, status: "SCRAPING", last_error: null }
          : ({ brand_id: brandId, website_url: url, status: "SCRAPING" } as BrandProfile)
      );

      setOkMsg(`✅ Scrape started for ${res.brand_id}. Status: ${res.status}`);

      // Light refresh after a moment (no heavy polling)
      setTimeout(async () => {
        try {
          const p = await getBrandProfile(brandId);
          setProfile(p);
        } catch {
          // ignore
        }
      }, 1200);
    } catch (e: any) {
      setErr(e.message || "Failed to start scrape");
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4 md:px-6">
        <h1 className="text-sm font-bold text-gray-700">Brand Profile (Scraper)</h1>
        <p className="text-xs text-gray-500">
          Select a brand → paste website URL → start scrape → the summary will be used to tailor captions & creatives.
        </p>
      </div>

      <div className="px-4 md:px-6">
        <Card className="p-4 md:p-6 space-y-4">
          {/* Brand selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-600">Brand</Label>

            <select
              className="w-full bg-white shadow rounded px-3 py-2 text-xs font-semibold text-gray-600"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              disabled={loadingBrands}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.display_name} ({b.id})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span>Selected:</span>
              <Badge variant="secondary" className="text-[11px]">
                {selectedBrandName}
              </Badge>

              {profile?.status && (
                <Badge className={`text-[11px] ${statusColor(profile.status)}`}>{profile.status}</Badge>
              )}
            </div>
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-600">Website URL</Label>
            <Input
              className="bg-white shadow text-xs text-gray-700"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={loadingProfile || scraping}
            />
            <div className="text-[11px] text-gray-500">
              Note: Website URL is stored in <b>brand_profiles</b> when you click <b>Scrape Now</b>.
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              className="text-white text-xs bg-indigo-600"
              onClick={scrapeNow}
              disabled={scraping || loadingProfile || !brandId}
            >
              {scraping ? "Scraping..." : "Scrape Now"}
            </Button>
          </div>

          {/* Status panel */}
          <div className="rounded-md bg-gray-50 border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-600">Profile Summary</div>
              <div className="text-[11px] text-gray-500">Last scraped: {fmtDate(profile?.last_scraped_at)}</div>
            </div>

            {loadingProfile ? (
              <div className="text-xs text-gray-500">Loading profile...</div>
            ) : (
              <>
                {profile?.profile_summary ? (
                  <div className="text-xs text-gray-700 whitespace-pre-wrap">{profile.profile_summary}</div>
                ) : (
                  <div className="text-xs text-gray-500">
                    No summary yet. Click <b>Scrape Now</b> to generate a tailored brand profile.
                  </div>
                )}

                {profile?.last_error ? (
                  <div className="text-xs text-red-700 whitespace-pre-wrap">
                    <b>Last error:</b> {profile.last_error}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Messages */}
          {err && <div className="text-xs text-red-700">{err}</div>}
          {okMsg && <div className="text-xs text-green-700">{okMsg}</div>}
        </Card>
      </div>
    </div>
  );
}
