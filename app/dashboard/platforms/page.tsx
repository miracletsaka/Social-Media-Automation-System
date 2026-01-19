"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// If you don't have shadcn Input, replace with <input className="..." />
import { Input } from "@/components/ui/input";

import {
  createPlatform,
  listPlatforms,
  updatePlatform,
  type PlatformRow,
} from "@/lib/api";
import { RefreshCcw } from "lucide-react";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [id, setId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await listPlatforms(false); // include inactive
      setPlatforms(data);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    setMsg(null);

    const cleanId = id.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanId || !cleanName) {
      setMsg("❌ Platform ID and Display Name are required.");
      return;
    }

    // Simple slug validation (letters, numbers, underscore, dash)
    if (!/^[a-z0-9_-]+$/.test(cleanId)) {
      setMsg("❌ Platform ID must be lowercase and only use letters, numbers, '-' or '_'.");
      return;
    }

    try {
      await createPlatform({
        id: cleanId,
        display_name: cleanName,
        is_active: isActive,
      });

      setId("");
      setDisplayName("");
      setIsActive(true);

      await refresh();
      setMsg("✅ Platform created.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  const toggleActive = async (p: PlatformRow) => {
    setMsg(null);
    try {
      await updatePlatform(p.id, { is_active: !p.is_active });
      await refresh();
      setMsg("✅ Updated.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  return (
    <div className="space-y-1 py-10 bg-gray-100">
      <div className="px-5">
        <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Social Platforms</h1>
        <p className="text-xs font-bold text-gray-400">
          Manage platforms (Facebook, Instagram, LinkedIn). This removes hardcoding and enables reporting per platform.
        </p>
      </div>

      <Card className="p-6 space-y-1">
        {/* Create new platform */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Platform ID (slug)</Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. facebook"
            />
            <div className="text-[11px] text-gray-400">
              Tip: use lowercase slugs like <b>facebook</b>, <b>instagram</b>, <b>linkedin</b>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Facebook"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Active</Label>
            <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
              <Checkbox checked={isActive} onCheckedChange={() => setIsActive((v) => !v)} />
              Enabled
            </label>
          </div>
        </div>

        <Button className="text-white text-xs font-bold" onClick={onCreate}>
          Create Platform
        </Button>

        {/* Table */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">All Platforms</div>
          <Button className="text-white" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : <RefreshCcw />}
          </Button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-200">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-gray-600">
                <th className="text-left p-2 border-b">ID</th>
                <th className="text-left p-2 border-b">Display Name</th>
                <th className="text-left p-2 border-b">Active</th>
                <th className="text-left p-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id} className="text-gray-400 shadow last:border-b-0">
                  <td className="p-2 text-[11px] tracking-wide">{p.id}</td>
                  <td className="p-2 text-[11px] tracking-wide">{p.display_name}</td>
                  <td className="p-2 text-[11px] tracking-wide">{p.is_active ? "Yes" : "No"}</td>
                  <td className="p-2 text-[11px] tracking-wide">
                    <Button className="text-white text-[11px] tracking-wide" onClick={() => toggleActive(p)}>
                      {p.is_active ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}

              {platforms.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={4}>
                    No platforms yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {msg && <div className="text-xs font-bold text-gray-500">{msg}</div>}
      </Card>
    </div>
  );
}
