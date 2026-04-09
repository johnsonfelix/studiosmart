import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleSelection } from "@/services/selection.service";
import { getAlbumByToken } from "@/services/album.service";

export async function POST(req: Request) {
  try {
    const { photoId, isSelected, token } = await req.json();

    if (!photoId || (isSelected !== null && isSelected === undefined)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine client context
    let clientId: string | undefined;

    // 1. Try Session Auth
    try {
      const session = await auth();
      if (session?.user.role === "CLIENT") {
        clientId = session.user.id;
      }
    } catch (e) {
      console.error("Session auth failed, falling back to token:", e);
    }

    // 2. Try Token Auth (fallback or primary)
    if (!clientId && token) {
      const album = await getAlbumByToken(token);
      if (album) {
        clientId = album.clientId;
      } else {
        return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
      }
    }

    if (!clientId) {
      return NextResponse.json({ error: "Please log in or use a valid gallery link" }, { status: 401 });
    }

    const selection = await toggleSelection(photoId, clientId, isSelected);

    return NextResponse.json({ 
      success: true,
      selectionId: selection.id 
    });
  } catch (error: any) {
    console.error("Selection API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save selection" },
      { status: 500 }
    );
  }
}
