"use client";

import { useState } from "react";
import { PhotoCard } from "./photo-card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export function PhotoGrid({ initialPhotos, albumId, role = "STUDIO" }: any) {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const params = useParams();
  const token = params.token as string | undefined;

  const handleToggleSelection = async (photoId: string, isSelected: boolean) => {
    try {
      const res = await fetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          photoId, 
          isSelected,
          // Send token if we are on the client public gallery route
          ...(token && { token })
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle selection");
      
      setPhotos((prev: any) =>
        prev.map((p: any) => (p.id === photoId ? { ...p, isSelected } : p))
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
    
    // Force a data refetch or optimistic ui is already done above.
  };

  return (
    <div className="space-y-6">
      {photos.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
          No photos found.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {photos.map((photo: any) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              role={role}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
