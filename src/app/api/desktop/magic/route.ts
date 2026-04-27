import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { getAlbumsByStudio } from "@/services/album.service";
import { getMagicLinksByStudio } from "@/services/magic-link.service";

export async function GET(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const [albums, magicLinks] = await Promise.all([
      getAlbumsByStudio(authResult.studioId, true),
      getMagicLinksByStudio(authResult.studioId),
    ]);

    return NextResponse.json({ albums, magicLinks });
  } catch (error) {
    console.error("Desktop Magic Error:", error);
    return NextResponse.json({ error: "Failed to fetch magic data" }, { status: 500 });
  }
}
