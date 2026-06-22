import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { generatePresignedGetUrl } from "@/lib/s3";

export async function GET(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized
    }

    const session = authResult;

    const albums = await prisma.album.findMany({
      where: {
        studioId: session.studioId,
        isActive: true,
        isMagic: false,
      },
      include: {
        client: {
          select: { name: true }
        },
        photos: {
          take: 1,
          select: { thumbnailUrl: true },
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: { photos: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const albumsWithCover = await Promise.all(
      albums.map(async (album) => {
        let coverUrl = null;
        if (album.coverUrl) {
          coverUrl = await generatePresignedGetUrl(album.coverUrl);
        } else if (album.photos && album.photos.length > 0) {
          coverUrl = await generatePresignedGetUrl(album.photos[0].thumbnailUrl);
        }
        return {
          id: album.id,
          title: album.title,
          studioId: album.studioId,
          clientId: album.clientId,
          isActive: album.isActive,
          isMagic: album.isMagic,
          accessToken: album.accessToken,
          expiresAt: album.expiresAt,
          eventDate: album.eventDate,
          selectionLocked: album.selectionLocked,
          createdAt: album.createdAt,
          updatedAt: album.updatedAt,
          client: album.client,
          _count: album._count,
          coverUrl
        };
      })
    );

    return NextResponse.json({ albums: albumsWithCover });
  } catch (error) {
    console.error("Desktop Albums Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }
}

