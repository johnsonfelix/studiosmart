import { NextResponse } from "next/server";
import { cleanupExpiredAlbums } from "@/services/cleanup.service";

// Mark as dynamic to avoid static generation during build
export const dynamic = "force-dynamic";

/**
 * API route to trigger the automated cleanup of expired albums.
 * This should be called by a cron job (e.g. Vercel Cron, GitHub Actions, etc.)
 */
export async function GET(req: Request) {
  try {
    // Optional: Basic Authorization check
    // If CRON_SECRET is set in environment, require it in the Authorization header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid CRON_SECRET" },
        { status: 401 }
      );
    }

    const { count, total, results, message } = await cleanupExpiredAlbums() as any;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: message || `Cleanup completed successfully: ${count}/${total} albums processed.`,
      count,
      total,
      results: results || []
    });
  } catch (error: any) {
    console.error(`[Cleanup Cron Error]:`, error);
    return NextResponse.json(
      { error: "Failed to run automated cleanup", details: error.message },
      { status: 500 }
    );
  }
}
