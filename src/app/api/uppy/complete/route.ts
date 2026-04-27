import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { albumId } = await req.json();

    if (!albumId) {
      return NextResponse.json({ error: "Album ID is required" }, { status: 400 });
    }

    await prisma.album.update({
      where: { id: albumId, studioId: session.user.studioId },
      data: { isIndexing: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Uppy complete error:", error);
    return NextResponse.json({ error: "Failed to complete indexing status" }, { status: 500 });
  }
}
