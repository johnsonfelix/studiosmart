import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { studio: true },
    });

    if (!user || !user.studio) {
      return NextResponse.json({ error: "Invalid credentials or not a studio owner" }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || "fallback-secret-key-12345";
    
    // Create a desktop-specific token that expires in 30 days
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        studioId: user.studio.id 
      },
      secret,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        studioId: user.studio.id,
        studioName: user.studio.name
      }
    });
  } catch (error) {
    console.error("Desktop Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
