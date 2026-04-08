import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlbumsByStudio, createAlbum } from "@/services/album.service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albums = await getAlbumsByStudio(session.user.studioId!);
    return NextResponse.json({ albums });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, clientName, clientPhone } = await req.json();

    if (!title || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        phone: clientPhone,
        studioId: session.user.studioId!,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          phone: clientPhone,
          studioId: session.user.studioId!,
        },
      });
    }

    const album = await createAlbum({
      title,
      clientId: client.id,
      studioId: session.user.studioId!,
    });

    return NextResponse.json({ album });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}
