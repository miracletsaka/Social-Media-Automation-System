import { S3Client } from "@aws-sdk/client-s3";

function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const S3_REGION = required("S3_ENDPOINT", process.env.S3_REGION);
export const S3_ENDPOINT = required("S3_ENDPOINT", process.env.S3_ENDPOINT);
export const S3_BUCKET = required("S3_BUCKET_NAME", process.env.S3_BUCKET_NAME);
export const S3_PUBLIC_URL =
  process.env.S3_PUBLIC_URL || `https://${S3_BUCKET}.${S3_REGION}.digitaloceanspaces.com`;

export const s3 = new S3Client({
  region: S3_REGION,                 // lon1, nyc3, sfo3 etc
  endpoint: S3_ENDPOINT,             // https://lon1.digitaloceanspaces.com
  credentials: {
    accessKeyId: required("S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY", process.env.S3_SECRET_ACCESS_KEY),
  },
  // DO Spaces usually works fine without forcing path-style.
  // If you ever get "PermanentRedirect", set forcePathStyle: true
  forcePathStyle: false,
});
