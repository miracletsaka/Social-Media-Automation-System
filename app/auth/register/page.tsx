"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null); setMsg(null);
    setLoading(true);
    try {
      const res = await registerUser({ email, password });
      setMsg(res.message);
      // push to login after a moment, or keep user here
      setTimeout(() => r.push("/auth/login"), 900);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-xl font-bold">Create account</h1>

      <input className="w-full border p-2 rounded" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />

      <input className="w-full border p-2 rounded" placeholder="Password (8+ chars, letters+numbers)"
        type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button className="w-full bg-black text-white p-2 rounded" disabled={loading} onClick={submit}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      {msg && <p className="text-green-700 text-sm">{msg}</p>}
      {err && <p className="text-red-700 text-sm">{err}</p>}
    </div>
  );
}
