import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { getMagicLinksByStudio, createMagicLink } from "@/services/magic-link.service";

export async function GET(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const links = await getMagicLinksByStudio(authResult.studioId);
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Desktop Magic Links Error:", error);
    return NextResponse.json({ error: "Failed to fetch magic links" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const link = await createMagicLink({
      name: name.trim(),
      studioId: authResult.studioId,
    });

    return NextResponse.json({ link });
  } catch (error) {
    console.error("Desktop Create Magic Link Error:", error);
    return NextResponse.json({ error: "Failed to create magic link" }, { status: 500 });
  }
}
