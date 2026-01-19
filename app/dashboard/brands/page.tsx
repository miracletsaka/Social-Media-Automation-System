"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createBrand, listBrands, updateBrand, type Brand } from "@/lib/api";
import { RefreshCcw } from "lucide-react";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [id, setId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await listBrands(false);
      setBrands(data);
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
    if (!id.trim() || !displayName.trim()) {
      setMsg("❌ Brand ID and Display Name are required.");
      return;
    }
    try {
      await createBrand({ id: id.trim(), display_name: displayName.trim(), is_active: isActive });
      setId("");
      setDisplayName("");
      setIsActive(true);
      await refresh();
      setMsg("✅ Brand created.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  const toggleActive = async (b: Brand) => {
    setMsg(null);
    try {
      await updateBrand(b.id, { is_active: !b.is_active });
      await refresh();
      setMsg("✅ Updated.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  return (
    <div className="space-y-1 bg-gray-100 py-10">
      <div className="px-5">
        <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brands</h1>
        <p className="text-xs font-bold text-gray-400">
          Manage brand/pages used across Topics, Approvals, Scheduling.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brand ID (slug)</Label>
            <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. neuroflow-ai" />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. NeuroFlow AI" />
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
          Create Brand
        </Button>

        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-500">All Brands</div>
          <Button className="text-white" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : <RefreshCcw />}
          </Button>
        </div>

        <div className="rounded overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-200">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <th className="text-left p-2 border-b">ID</th>
                <th className="text-left p-2 border-b">Display Name</th>
                <th className="text-left p-2 border-b">Active</th>
                <th className="text-left p-2 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="text-gray-400 text-xs shadow last:border-b-0">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.display_name}</td>
                  <td className="p-2">{b.is_active ? "Yes" : "No"}</td>
                  <td className="p-2">
                    <Button className="text-white text-xs" onClick={() => toggleActive(b)}>
                      {b.is_active ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={4}>
                    No brands yet.
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
