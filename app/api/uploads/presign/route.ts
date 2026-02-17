import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, S3_PUBLIC_URL } from "@/lib/s3-server";

export async function POST(req: Request) {
  const body = await req.json();

  const fileName = String(body.fileName || "upload.bin");
  const contentType = String(body.contentType || "application/octet-stream");

  const key = `neuroflow/${Date.now()}-${fileName}`.replace(/\s+/g, "_");

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  const publicUrl = `${S3_PUBLIC_URL}/${key}`;

  return NextResponse.json({
    uploadUrl,
    publicUrl,
    key,
  });
}
