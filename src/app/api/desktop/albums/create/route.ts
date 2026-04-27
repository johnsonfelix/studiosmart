import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { createAlbum } from "@/services/album.service";
import { deductStudioBalance } from "@/services/wallet.service";

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { title, clientName, clientPhone, isMagic } = await req.json();

    if (!title || !clientName || !clientPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ALBUM_COST = 299;

    try {
      const album = await prisma.$transaction(async (tx) => {
        await deductStudioBalance(authResult.studioId, ALBUM_COST, tx);

        let client = await tx.client.findFirst({
          where: { phone: clientPhone, studioId: authResult.studioId },
        });

        if (!client) {
          client = await tx.client.create({
            data: { name: clientName, phone: clientPhone, studioId: authResult.studioId },
          });
        } else if (client.name !== clientName) {
          client = await tx.client.update({
            where: { id: client.id },
            data: { name: clientName },
          });
        }

        return await createAlbum(
          { title, clientId: client.id, studioId: authResult.studioId, isMagic: isMagic === true },
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
    console.error("Desktop Create Album Error:", error);
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}
