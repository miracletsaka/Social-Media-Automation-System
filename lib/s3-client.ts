import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

const S3_ENDPOINT = process.env.S3_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
const S3_REGION = process.env.S3_REGION || "us-east-1"; // DO Spaces uses "us-east-1" commonly
const S3_BUCKET = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET || "";
const S3_PUBLIC_URL =
  process.env.S3_PUBLIC_URL || (S3_BUCKET ? `https://${S3_BUCKET}.nyc3.digitaloceanspaces.com` : "");

export const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucket = required("S3_BUCKET_NAME (or S3_BUCKET)", S3_BUCKET);
  const baseUrl = required("S3_PUBLIC_URL (or bucket public URL)", S3_PUBLIC_URL);

  const key = `whatsapp-images/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
     ACL: "public-read",
    // If your Space/bucket is public via bucket policy, you can REMOVE ACL entirely.
  });

  await s3Client.send(command);
  return `${baseUrl}/${key}`;
}

/**
 * Twilio MediaUrl downloads often require Basic Auth.
 * Pass `requireTwilioAuth=true` when downloading from Twilio MediaUrl0..N
 */
export async function downloadImageFromUrl(
  imageUrl: string,
  requireTwilioAuth = false
): Promise<{ buffer: Buffer; contentType: string }> {
  const headers: Record<string, string> = {};

  if (requireTwilioAuth) {
    const sid = required("TWILIO_ACCOUNT_SID", process.env.TWILIO_ACCOUNT_SID);
    const token = required("TWILIO_AUTH_TOKEN", process.env.TWILIO_AUTH_TOKEN);
    headers["Authorization"] = "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
  }

  const response = await fetch(imageUrl, { headers });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to download image (${response.status} ${response.statusText}). ${text.slice(0, 200)}`
    );
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();

  return { buffer: Buffer.from(arrayBuffer), contentType };
}

// Optional helper if you want correct file extensions:
export function extFromContentType(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("gif")) return "gif";
  return "bin";
}
