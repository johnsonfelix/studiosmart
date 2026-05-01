import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) { // Limit logo to 2MB
      return NextResponse.json(
        { error: "File size exceeds 2MB limit." },
        { status: 400 }
      );
    }

    const studioId = authResult.studioId;
    
    // Upload to S3
    const key = `studios/${studioId}/branding/logo-${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(key, buffer, file.type);

    return NextResponse.json({ logoUrl: key });
  } catch (error) {
    console.error("Desktop Logo Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
