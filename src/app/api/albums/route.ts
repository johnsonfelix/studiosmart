import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlbumsByStudio, createAlbum } from "@/services/album.service";
import { prisma } from "@/lib/prisma";
import { deductStudioBalance } from "@/services/wallet.service";

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

    const { title, clientName, clientPhone, isMagic } = await req.json();

    if (!title || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ALBUM_COST = 299;

    try {
      const album = await prisma.$transaction(async (tx) => {
        // 1. Check and deduct balance
        await deductStudioBalance(session.user.studioId!, ALBUM_COST, tx);

        // 2. Find or create client
        let client = await tx.client.findFirst({
          where: {
            phone: clientPhone,
            studioId: session.user.studioId!,
          },
        });

        if (!client) {
          client = await tx.client.create({
            data: {
              name: clientName,
              phone: clientPhone,
              studioId: session.user.studioId!,
            },
          });
        } else if (client.name !== clientName) {
          // BUG FIX: Update name if it has changed in the form for this phone number
          client = await tx.client.update({
            where: { id: client.id },
            data: { name: clientName }
          });
        }

        // 3. Create album
        return await createAlbum(
          {
            title,
            clientId: client.id,
            studioId: session.user.studioId!,
            isMagic: isMagic === true,
          },
          tx
        );
      });

      return NextResponse.json({ album });
    } catch (error: any) {
      if (error.message.includes("Insufficient balance")) {
        return NextResponse.json({ error: error.message }, { status: 402 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}
