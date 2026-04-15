import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAlbumByToken } from "@/services/album.service";
import { sendSelectionSubmittedEmail } from "@/services/mail.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: albumId } = await params;
    const { token } = await req.json();

    // 1. Find the album (by token if provided, otherwise by ID)
    let album;
    if (token) {
      album = await getAlbumByToken(token, 0);
    } else {
      // If no token, maybe it's the owner (but owner doesn't usually submit)
      // For now, let's prioritize token-based submission (client-side)
      album = await prisma.album.findUnique({
        where: { id: albumId },
        include: {
          studio: { include: { owner: true } },
          client: true,
          _count: { select: { photos: true } }
        }
      });
    }

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Double check it's the right album if token was used
    if (token && album.id !== albumId) {
       return NextResponse.json({ error: "Invalid token for this album" }, { status: 401 });
    }

    // 2. Fetch the actual studio owner email if we used getAlbumByToken (which doesn't include owner by default)
    const fullAlbum = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        studio: { include: { owner: true } },
        client: true,
        _count: {
            select: {
              photos: {
                where: {
                  selections: {
                    some: {
                      clientId: album.clientId,
                      isSelected: true
                    }
                  }
                }
              }
            }
        }
      }
    });

    if (!fullAlbum) return NextResponse.json({ error: "Server error" }, { status: 500 });

    // 3. Get exact count of selected photos
    const selectedCount = await prisma.selection.count({
      where: {
        clientId: fullAlbum.clientId,
        isSelected: true,
        photo: { albumId: fullAlbum.id }
      }
    });

    // 4. Update the album status
    await prisma.album.update({
      where: { id: fullAlbum.id },
      data: {
        selectionLocked: true,
        selectionSubmittedAt: new Date()
      }
    });

    // 5. Send notification email to the studio owner
    if (fullAlbum.studio.owner.email) {
      const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${fullAlbum.accessToken}`;
      
      try {
        await sendSelectionSubmittedEmail(
          fullAlbum.studio.owner.email,
          fullAlbum.title,
          fullAlbum.client?.name || "A client",
          selectedCount,
          galleryUrl
        );
      } catch (emailError) {
        // Log the error but don't fail the submission
        console.error("Failed to send selection completion email:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Submit Selection API Error:", error);
    return NextResponse.json(
      { error: "Failed to submit selection" },
      { status: 500 }
    );
  }
}
