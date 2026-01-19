"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";

function VerifyContent() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [msg, setMsg] = useState<string>("Verifying...");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await verifyEmail(token);
        setMsg(res.message);
      } catch (e: any) {
        setErr(e.message);
        setMsg("Verification failed.");
      }
    })();
  }, [token]);

  return (
    <div className="max-w-md mx-auto p-6 space-y-2">
      <h1 className="text-xl font-bold">Email verification</h1>
      <p className="text-sm">{msg}</p>
      {err && <p className="text-red-700 text-sm">{err}</p>}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-6 space-y-2">
        <h1 className="text-xl font-bold">Email verification</h1>
        <p className="text-sm">Loading...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}