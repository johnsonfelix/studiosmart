import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDesktopAuth } from "@/lib/desktop-auth";

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
        _count: {
          select: { photos: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error("Desktop Albums Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }
}
