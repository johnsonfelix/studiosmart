"use server";

import { s3Client } from "@/lib/s3";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function scanOrphanedFiles() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const bucket = process.env.S3_BUCKET_NAME || "studiosmart";
    
    // 1. Fetch all known keys from database
    const photos = await prisma.photo.findMany({
      select: { originalUrl: true, previewUrl: true, thumbnailUrl: true }
    });
    
    const registrations = await prisma.magicRegistration.findMany({
      select: { selfieUrl: true }
    });

    const dbKeys = new Set<string>();
    photos.forEach(p => {
      if (p.originalUrl) dbKeys.add(p.originalUrl);
      if (p.previewUrl) dbKeys.add(p.previewUrl);
      if (p.thumbnailUrl) dbKeys.add(p.thumbnailUrl);
    });
    registrations.forEach(r => {
      if (r.selfieUrl) dbKeys.add(r.selfieUrl);
    });

    // 2. List objects in S3
    let orphanedKeys: string[] = [];
    let totalS3Objects = 0;
    let continuationToken: string | undefined = undefined;

    do {
      const command: ListObjectsV2Command = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      const contents = response.Contents || [];
      totalS3Objects += contents.length;

      contents.forEach(obj => {
        if (obj.Key && !dbKeys.has(obj.Key)) {
          // It's an orphan
          orphanedKeys.push(obj.Key);
        }
      });

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return {
      success: true,
      totalS3Objects,
      orphanedCount: orphanedKeys.length,
      orphanedKeys: orphanedKeys.slice(0, 100), // Return a sample
      fullOrphanedList: orphanedKeys, // We'll keep this for the delete action
    };
  } catch (error: any) {
    console.error("Scan Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrphanedFiles(keys: string[]) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    if (!keys || keys.length === 0) return { success: true, deletedCount: 0 };

    const bucket = process.env.S3_BUCKET_NAME || "studiosmart";
    let deletedCount = 0;

    // S3 DeleteObjects supports max 1000 keys per request
    const batchSize = 1000;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: true,
        },
      });

      await s3Client.send(command);
      deletedCount += batch.length;
    }

    return { success: true, deletedCount };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}
