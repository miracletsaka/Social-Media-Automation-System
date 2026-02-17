import { Suspense } from "react";
import GeneratePage from "@/components/user-generate";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold animate-pulse">
          Something powerful is loading...
        </p>
        <p className="text-sm text-gray-400">
          Preparing your experience 🚀
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GeneratePage />
    </Suspense>
  );
}
