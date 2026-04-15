import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAlbumById } from "@/services/album.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { BulkUploader } from "@/components/upload/bulk-uploader";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { generatePresignedGetUrl } from "@/lib/s3";

import { AlbumDetailsClient } from "@/components/studio/album-details-client";

export const metadata = { title: "Album | StudioSmart" };

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const { id: albumId } = await params;
  const album = await getAlbumById(albumId, session.user.studioId);

  if (!album) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-lg bg-card border-dashed">
        Album not found or you don't have access.
      </div>
    );
  }

  const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${album.accessToken}`;

  return (
    <AlbumDetailsClient 
      albumId={albumId}
      title={album.title}
      clientName={album.client?.name}
      photoCount={album._count?.photos || 0}
      galleryUrl={galleryUrl}
      initialPhotos={[]} // Photos will be loaded on the client side
      initialLocked={!!album.selectionLocked}
    />
  );
}
