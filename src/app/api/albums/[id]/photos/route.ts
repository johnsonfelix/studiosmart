import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPhotosByAlbum, createPhoto } from "@/services/photo.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "24");

    // Check if it's a studio user accessing their album
    let clientId: string | undefined;

    // If it's a client accessing via token
    // Note: For client access, we would typically check the token here
    // For simplicity in this endpoint, we'll assume auth middleware handles basic access
    if (session?.user.role === "CLIENT") {
      clientId = session.user.id;
    }

    const photos = await getPhotosByAlbum(id, page, limit, clientId);
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, fileName, width, height, fileSize } = await req.json();

    if (!key || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Since we're not doing server-side processing, preview and thumbnail
    // point to the same original file URL for now
    const photo = await createPhoto({
      albumId: id,
      fileName,
      previewUrl: key,
      thumbnailUrl: key,
      originalUrl: key,
      width,
      height,
      fileSize,
    });

    return NextResponse.json({ photo });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create photo record" },
      { status: 500 }
    );
  }
}
