"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RefreshCcw } from "lucide-react";
import { registerUser, listUsers, type UserRow } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isActive, setIsActive] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await listUsers();
      setUsers(data);
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

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMsg("❌ Email is required.");
      return;
    }

    try {
      await registerUser({
        email: cleanEmail,
      });

      setEmail("");
      setRole("member");
      setIsActive(true);

      await refresh();
      setMsg("✅ User created. Temporary password + links sent by email.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    }
  };

  return (
    <div className="space-y-1 py-10 bg-gray-100">
      <div className="px-5">
        <h1 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Users</h1>
        <p className="text-xs font-bold text-gray-400">
          Admins can create members. New users receive a temporary password + verification and password setup links.
        </p>
      </div>

      <Card className="p-6 space-y-1">
        {/* Create new user */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. user@company.com" />
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
          Create User
        </Button>

        {/* Table */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">All Users</div>
          <Button className="text-white" onClick={refresh} disabled={loading}>
            {loading ? "Loading..." : <RefreshCcw />}
          </Button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-200">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-gray-600">
                <th className="text-left p-2 border-b">Email</th>
                <th className="text-left p-2 border-b">Verified</th>
                <th className="text-left p-2 border-b">Active</th>
                <th className="text-left p-2 border-b">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-gray-400 shadow last:border-b-0">
                  <td className="p-2 text-[11px] tracking-wide">{u.email}</td>
                  <td className="p-2 text-[11px] tracking-wide">{u.is_email_verified ? "Yes" : "No"}</td>
                  <td className="p-2 text-[11px] tracking-wide">{u.is_active ? "Yes" : "No"}</td>
                  <td className="p-2 text-[11px] tracking-wide">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={5}>
                    No users yet.
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
