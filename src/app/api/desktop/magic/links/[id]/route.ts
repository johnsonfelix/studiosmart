import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { updateMagicLinkAlbum, deleteMagicLink } from "@/services/magic-link.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: linkId } = await params;
    const { albumId } = await req.json();

    await updateMagicLinkAlbum(linkId, authResult.studioId, albumId || null);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Desktop Update Magic Link Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update magic link" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: linkId } = await params;
    await deleteMagicLink(linkId, authResult.studioId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Desktop Delete Magic Link Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete magic link" }, { status: 500 });
  }
}
