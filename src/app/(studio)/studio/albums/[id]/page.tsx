import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAlbumById } from "@/services/album.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { BulkUploader } from "@/components/upload/bulk-uploader";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{album.title}</h2>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <span>Client: {album.client?.name}</span>
            <span>•</span>
            <span>{album._count?.photos} photos</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/export?albumId=${albumId}&format=csv`} download>
              <Download className="w-4 h-4 mr-2" />
              Export Selections
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={galleryUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Gallery
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="share">Share Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="photos" className="min-h-[400px]">
          <PhotoGrid initialPhotos={album.photos} albumId={albumId} role="STUDIO" />
        </TabsContent>
        
        <TabsContent value="upload" className="max-w-3xl">
          <BulkUploader albumId={albumId} onUploadComplete={() => {
            // Note: client-side router.refresh() should be called here in a real component wrapper,
            // but we'll accept simple reload for MVP
            if (typeof window !== "undefined") window.location.reload();
          }} />
        </TabsContent>

        <TabsContent value="share">
          <div className="max-w-md p-6 border rounded-lg bg-card space-y-4">
            <h3 className="font-semibold text-lg">Client Gallery Link</h3>
            <p className="text-sm text-muted-foreground">Share this link directly with your client. No login required if token is used.</p>
            
            <div className="flex gap-2">
              <input 
                readOnly 
                value={galleryUrl} 
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-muted text-foreground cursor-text"
              />
              <Button variant="secondary" onClick={() => {}}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
