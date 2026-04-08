"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { BulkUploader } from "@/components/upload/bulk-uploader";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AlbumDetailsClientProps {
  albumId: string;
  title: string;
  clientName?: string;
  photoCount: number;
  galleryUrl: string;
  initialPhotos: any[];
}

export function AlbumDetailsClient({
  albumId,
  title,
  clientName,
  photoCount,
  galleryUrl,
  initialPhotos,
}: AlbumDetailsClientProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(galleryUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleUploadComplete = () => {
    toast.success("Upload complete! Refreshing...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this album? This will permanently remove all photos from S3 and data from the database.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete album");

      toast.success("Album deleted successfully");
      router.push("/studio/albums");
    } catch (error) {
      toast.error("Error deleting album");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <span>Client: {clientName || "N/A"}</span>
            <span>•</span>
            <span>{photoCount} photos</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Album"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/export?albumId=${albumId}&format=txt`} download>
              <Download className="w-4 h-4 mr-2" />
              Export
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={galleryUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View
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
          <PhotoGrid initialPhotos={photos} albumId={albumId} role="STUDIO" />
        </TabsContent>
        
        <TabsContent value="upload" className="max-w-3xl">
          <BulkUploader albumId={albumId} onUploadComplete={handleUploadComplete} />
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
              <Button variant="secondary" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
