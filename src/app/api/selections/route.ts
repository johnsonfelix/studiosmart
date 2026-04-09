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
    let clientId: string;

    const session = await auth();
    if (session?.user.role === "CLIENT") {
      clientId = session.user.id;
    } else if (token) {
      // Validate token access
      const album = await getAlbumByToken(token);
      if (!album) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      clientId = album.clientId;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const selection = await toggleSelection(photoId, clientId, isSelected);

    return NextResponse.json({ selection });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save selection" },
      { status: 500 }
    );
  }
}
