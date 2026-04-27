import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface DesktopSession {
  id: string;
  role: string;
  studioId: string;
}

export async function verifyDesktopAuth(req: Request): Promise<DesktopSession | NextResponse> {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.AUTH_SECRET || "fallback-secret-key-12345";

  try {
    const decoded = jwt.verify(token, secret) as DesktopSession;
    return decoded;
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }
}
