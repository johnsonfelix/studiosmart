import { useState, useEffect, useCallback } from "react";
import { PhotoCard } from "./photo-card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export function PhotoGrid({ initialPhotos, albumId, role = "STUDIO" }: any) {
  const [photos, setPhotos] = useState(initialPhotos || []);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
  };

  const closeLightbox = () => setLightboxIndex(null);
  
  const navigateNext = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, photos.length]);

  const navigatePrev = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateNext();
      if (e.key === "ArrowLeft") navigatePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, navigateNext, navigatePrev]);

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="space-y-6">
      {photos.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
          No photos found.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {photos.map((photo: any, index: number) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              role={role}
              onToggleSelection={handleToggleSelection}
              onOpen={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-[110]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <span className="text-xs text-white/40 hidden sm:inline-block">
                {currentPhoto.fileName}
              </span>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none z-[105]">
            <button
              onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
              disabled={lightboxIndex === 0}
              className={`p-3 rounded-full bg-white/5 border border-white/10 text-white transition-all pointer-events-auto ${
                lightboxIndex === 0 ? "opacity-0 invisible" : "hover:bg-white/10 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateNext(); }}
              disabled={lightboxIndex === photos.length - 1}
              className={`p-3 rounded-full bg-white/5 border border-white/10 text-white transition-all pointer-events-auto ${
                lightboxIndex === photos.length - 1 ? "opacity-0 invisible" : "hover:bg-white/10 active:scale-95"
              }`}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={closeLightbox}>
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={currentPhoto.previewUrl || currentPhoto.thumbnailUrl}
                alt={currentPhoto.fileName}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
              />
              
              {currentPhoto.isSelected && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  Selected by Client
                </div>
              )}
            </div>
          </div>

          {/* Footer Hints */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] text-white/30 sm:flex hidden">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd> to close</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10">→</kbd> to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}
