import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { getAlbumById } from "@/services/album.service";
import { generatePresignedGetUrl, deleteS3Objects } from "@/lib/s3";
import { DeleteCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: albumId } = await params;
    const album = await getAlbumById(albumId, authResult.studioId);

    if (!album) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const pendingCount = await prisma.magicRegistration.count({
      where: { albumId, status: "PENDING" },
    });

    const sentCount = await prisma.magicRegistration.count({
      where: { albumId, status: "SENT" },
    });

    // Generate thumbnail URLs for photos
    const photosWithUrls = await Promise.all(
      (album.photos || []).slice(0, 200).map(async (photo) => {
        const key = photo.thumbnailUrl || photo.previewUrl || photo.originalUrl;
        let url = null;
        if (key) {
          try {
            url = await generatePresignedGetUrl(key);
          } catch (_) {}
        }
        return {
          id: photo.id,
          fileName: photo.fileName,
          thumbnailUrl: url,
        };
      })
    );

    // Generate selfie URLs for registrations
    const registrationsWithUrls = await Promise.all(
      (album.magicRegistrations || []).map(async (reg) => {
        let selfieUrl = null;
        if (reg.selfieUrl) {
          try {
            selfieUrl = await generatePresignedGetUrl(reg.selfieUrl);
          } catch (_) {}
        }
        return {
          id: reg.id,
          email: reg.email,
          status: reg.status,
          createdAt: reg.createdAt,
          selfieUrl,
        };
      })
    );

    const guestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/guest/magic/${album.id}`;

    return NextResponse.json({
      album: {
        id: album.id,
        title: album.title,
        client: album.client,
        photoCount: album._count?.photos || 0,
        registrationCount: album._count?.magicRegistrations || 0,
      },
      pendingCount,
      sentCount,
      guestUrl,
      photos: photosWithUrls,
      registrations: registrationsWithUrls,
    });
  } catch (error) {
    console.error("Desktop Magic Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch event details" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: albumId } = await params;

    // Verify ownership and get assets
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: authResult.studioId },
      include: {
        photos: { select: { originalUrl: true, previewUrl: true, thumbnailUrl: true } },
        magicRegistrations: { select: { selfieUrl: true } },
      },
    });

    if (!album) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Collect all S3 keys
    const s3Keys: string[] = [];
    album.photos.forEach((p) => {
      if (p.originalUrl) s3Keys.push(p.originalUrl);
      if (p.previewUrl) s3Keys.push(p.previewUrl);
      if (p.thumbnailUrl) s3Keys.push(p.thumbnailUrl);
    });
    album.magicRegistrations.forEach((r) => {
      if (r.selfieUrl) s3Keys.push(r.selfieUrl);
    });

    // Delete from S3
    if (s3Keys.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < s3Keys.length; i += batchSize) {
        await deleteS3Objects(s3Keys.slice(i, i + batchSize));
      }
    }

    // Delete Rekognition Collection
    try {
      await rekognitionClient.send(new DeleteCollectionCommand({ CollectionId: albumId }));
    } catch (_) {}

    // Delete from Database
    await prisma.album.delete({ where: { id: albumId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Desktop Delete Magic Event Error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
