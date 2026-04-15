"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Photo } from "@prisma/client";
import { getPresignedUrls } from "@/actions/magic.actions";
import { Loader2, ImageIcon } from "lucide-react";

interface MagicPhotosGridProps {
  photos: Photo[];
}

export function MagicPhotosGrid({ photos }: MagicPhotosGridProps) {
  const [photosWithUrls, setPhotosWithUrls] = useState<(Photo & { url: string | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUrls() {
      if (photos.length === 0) {
        setIsLoading(false);
        return;
      }

      const keys = photos.map(p => p.previewUrl || p.originalUrl).filter(Boolean) as string[];
      const result = await getPresignedUrls(keys);

      if (result.success && result.urls) {
        const urlMap = new Map(result.urls.map(u => [u.key, u.url]));
        const updated = photos.map(p => ({
          ...p,
          url: urlMap.get(p.previewUrl || p.originalUrl || "") || null
        }));
        setPhotosWithUrls(updated);
      }
      setIsLoading(false);
    }

    fetchUrls();
  }, [photos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Fetching secure image links...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
        <ImageIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No photos uploaded yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Uploaded event photos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photosWithUrls.map((photo) => (
        <div 
          key={photo.id} 
          className="group relative aspect-square bg-muted rounded-xl overflow-hidden border border-border/50 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          {photo.url ? (
            <Image
              src={photo.url}
              alt={photo.fileName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
               <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
             <p className="text-[10px] text-white/80 truncate w-full">{photo.fileName}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
