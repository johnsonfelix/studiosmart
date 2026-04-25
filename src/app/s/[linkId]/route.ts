import { getMagicLinkById } from "@/services/magic-link.service";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;

  const magicLink = await getMagicLinkById(linkId);

  if (!magicLink) {
    return new Response("Magic Link not found", { status: 404 });
  }

  if (!magicLink.albumId) {
    return new Response("No active event assigned to this QR code. Please check back later.", { status: 404 });
  }

  // Redirect to the assigned magic event
  redirect(`/guest/magic/${magicLink.albumId}`);
}
