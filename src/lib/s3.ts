import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SIGNED_URL_EXPIRY } from "./constants";

export const s3Client = new S3Client({
  region: process.env.S3_REGION || "ap-south-1",
  endpoint: process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.trim() !== "" 
    ? process.env.S3_ENDPOINT 
    : undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  // Only use path style if endpoint is provided (e.g., MinIO/Localstack)
  forcePathStyle: !!(process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.trim() !== ""),
});

const DEFAULT_BUCKET = process.env.S3_BUCKET_NAME || "studiosmart";

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  bucket: string = DEFAULT_BUCKET
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRY });
}

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
  bucket: string = DEFAULT_BUCKET
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return s3Client.send(command);
}

export async function generatePresignedGetUrl(
  key: string | null,
  expiresIn: number = SIGNED_URL_EXPIRY,
  bucket: string = DEFAULT_BUCKET
): Promise<string | null> {
  if (!key) return null;
  // If it's already a full URL, return it
  if (key.startsWith("http")) return key;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteS3Object(key: string, bucket: string = DEFAULT_BUCKET) {
  if (key.startsWith("http")) return; // Cannot delete external URLs
  
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return s3Client.send(command);
}

export async function deleteS3Objects(keys: string[], bucket: string = DEFAULT_BUCKET) {
  const validKeys = keys.filter(key => !key.startsWith("http"));
  if (validKeys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: Object.assign([], validKeys.map((key) => ({ Key: key }))),
    },
  });

  return s3Client.send(command);
}
