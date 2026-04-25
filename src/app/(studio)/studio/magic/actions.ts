"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createMagicLink, updateMagicLinkAlbum, deleteMagicLink } from "@/services/magic-link.service";

export async function createMagicLinkAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.studioId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") throw new Error("Name is required");

  await createMagicLink({
    name: name.trim(),
    studioId: session.user.studioId,
  });

  revalidatePath("/studio/magic");
}

export async function updateMagicLinkAlbumAction(linkId: string, albumId: string | null) {
  const session = await auth();
  if (!session?.user?.studioId) throw new Error("Unauthorized");

  await updateMagicLinkAlbum(linkId, session.user.studioId, albumId);
  revalidatePath("/studio/magic");
}

export async function deleteMagicLinkAction(linkId: string) {
  const session = await auth();
  if (!session?.user?.studioId) throw new Error("Unauthorized");

  await deleteMagicLink(linkId, session.user.studioId);
  revalidatePath("/studio/magic");
}
