"use client";

import { cn } from "@/lib/utils";

export function MediaPreview({
  mediaUrl,
  thumbUrl,
  mime,
  contentType,
  className,
}: {
  mediaUrl?: string | null;
  thumbUrl?: string | null;
  mime?: string | null;
  contentType?: "text" | "image" | "video";
  className?: string;
}) {
  const url = (thumbUrl || mediaUrl || "").trim();
  if (!url) return null;

  const isVideo =
    contentType === "video" ||
    (mime ? mime.startsWith("video/") : false) ||
    /\.(mp4|mov|webm)$/i.test(url);

  // For images, show <img>. For video, show <video> (controls).
  if (isVideo) {
    return (
      <div className={cn("rounded overflow-hidden bg-black", className)}>
        <video className="w-full h-auto" controls preload="metadata">
          <source src={url} />
        </video>
      </div>
    );
  }

  return (
    <div className={cn("rounded overflow-hidden bg-gray-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Media" className="w-full h-auto object-cover" />
    </div>
  );
}
