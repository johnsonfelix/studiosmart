import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { generatePresignedGetUrl } from "@/lib/s3";

export async function GET(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const studio = await prisma.studio.findUnique({
      where: { id: authResult.studioId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!studio) {
      return NextResponse.json({ error: "Studio not found" }, { status: 404 });
    }

    return NextResponse.json({
      studioName: studio.name,
      ownerName: studio.owner.name,
      email: studio.owner.email,
      phone: studio.owner.phone || "",
      logoUrl: await generatePresignedGetUrl(studio.logoUrl),
      logoKey: studio.logoUrl,
    });
  } catch (error) {
    console.error("Desktop Get Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { studioName, ownerName, phone, logoUrl } = await req.json();

    if (!studioName || !ownerName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = (authResult as any).id;
    const studioId = authResult.studioId;

    if (!studioId || !userId) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.studio.update({
        where: { id: studioId },
        data: { 
          name: studioName,
          logoUrl: logoUrl === undefined ? undefined : logoUrl
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { name: ownerName, phone },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('phone')) {
        return NextResponse.json({ error: "This mobile number is already registered with another account." }, { status: 400 });
      }
    }
    console.error("Desktop Update Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
