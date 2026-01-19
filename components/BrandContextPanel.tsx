import { useEffect, useState } from "react";
import { getBrandProfile, type BrandProfile } from "@/lib/api";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function BrandContextPanel({ brandId }: { brandId: string }) {
  const [p, setP] = useState<BrandProfile | null>(null);

  useEffect(() => {
    getBrandProfile(brandId).then(setP).catch(() => {});
  }, [brandId]);

  if (!p) return null;

  return (
    <Card className="p-4 bg-white border shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-gray-700">Brand Context</div>
          <div className="text-[11px] text-gray-500">
            {p.website_url || "No website URL set"} • Status: <b>{p.status}</b>
          </div>
        </div>
        {p.status === "READY" && (
          <div className="text-[11px] text-gray-400">
            Updated {p.last_scraped_at ? new Date(p.last_scraped_at).toLocaleString() : ""}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-700 whitespace-pre-wrap">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-2 text-sm text-gray-700 last:mb-0 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-700">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),
            code: ({ children }) =>

                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600">
                  {children}
                </code>,

            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg font-bold text-gray-900 mb-2 mt-1">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold text-gray-900 mb-2 mt-1">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-1">{children}</h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-3 py-1 my-2 text-gray-600 italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {p.profile_summary || "No profile summary yet. Go to Settings → Brand Profile."}
        </ReactMarkdown>
      </div>

      {!!p.tone_tags?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.tone_tags.slice(0, 8).map((t) => (
            <span key={t} className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">
              {t}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
