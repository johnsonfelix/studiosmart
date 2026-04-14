import { NextResponse } from "next/server";
import { getAlbumByToken, getPaginatedAlbumPhotos } from "@/services/album.service";
import { generatePresignedGetUrl } from "@/lib/s3";

/**
 * API route to fetch paginated photos for a gallery.
 * This significantly improves performance for larger albums.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 1. Authenticate and get basic album info
    // We pass limit: 0 to avoid fetching any photos during the auth check
    const album = await getAlbumByToken(token, 0);
    if (!album || !album.isActive) {
      return NextResponse.json({ error: "Unauthorized or Invalid Gallery" }, { status: 401 });
    }

    // 2. Fetch the requested batch of photos
    const photos = await getPaginatedAlbumPhotos(
      album.id,
      album.clientId,
      page,
      limit
    );

    // 3. Enrich photos with S3 presigned URLs
    // This happens only for the small batch (e.g. 50), which is efficient
    const enrichedPhotos = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        previewUrl: (await generatePresignedGetUrl(photo.previewUrl)) || "",
        thumbnailUrl: (await generatePresignedGetUrl(photo.thumbnailUrl)) || "",
        originalUrl: await generatePresignedGetUrl(photo.originalUrl),
      }))
    );

    return NextResponse.json({
      photos: enrichedPhotos,
      hasMore: photos.length === limit,
    });
  } catch (error: any) {
    console.error("Gallery Pagination API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery photos" },
      { status: 500 }
    );
  }
}
