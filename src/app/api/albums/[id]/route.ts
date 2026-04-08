import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAlbumById,
  deleteAlbum,
} from "@/services/album.service";
import { deleteAlbumPhotos } from "@/services/storage.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const album = await getAlbumById(id, session.user.studioId);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json({ album });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteAlbum(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
