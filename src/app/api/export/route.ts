import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSelectedPhotos } from "@/services/selection.service";
import { getAlbumById } from "@/services/album.service";
import json2csv from "papaparse";
import { generatePresignedGetUrl } from "@/lib/s3";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const albumId = url.searchParams.get("albumId");
    const format = url.searchParams.get("format") || "csv";

    if (!albumId) {
      return NextResponse.json({ error: "Missing albumId" }, { status: 400 });
    }

    // Verify ownership
    const album = await getAlbumById(albumId, session.user.studioId);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const selections = await getSelectedPhotos(albumId);

    if (format === "csv") {
      const data = await Promise.all(
        selections.map(async (s) => ({
          FileName: s.photo.fileName,
          SelectedAt: s.createdAt.toISOString(),
          ClientName: s.client.name,
          ClientEmail: s.client.email,
          PhotoURL: await generatePresignedGetUrl(s.photo.originalUrl || s.photo.previewUrl),
        }))
      );

      const csv = json2csv.unparse(data);
      
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="selections-${album.title}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
