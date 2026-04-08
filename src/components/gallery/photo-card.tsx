"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, CheckCircle2, Download, Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PhotoCard({ photo, role = "STUDIO", onToggleSelection }: any) {
  const [isSelected, setIsSelected] = useState(photo.isSelected || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isSelected;
    setIsSelected(newStatus);
    
    try {
      await onToggleSelection(photo.id, newStatus);
    } catch {
      setIsSelected(!newStatus); // revert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative aspect-square overflow-hidden rounded-md cursor-pointer bg-muted">
      <img
        src={photo.thumbnailUrl}
        alt={photo.fileName}
        className={`w-full h-full object-cover transition-all ${
          isSelected ? "scale-105 opacity-90" : "group-hover:scale-105"
        }`}
      />
      
      {/* Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity flex items-start justify-end p-3 ${
          isSelected ? "opacity-100 bg-black/20" : "opacity-0 group-hover:opacity-100 bg-gradient-to-b from-black/40 via-transparent to-transparent"
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          disabled={isLoading}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            isSelected 
              ? "bg-white/90 text-red-500 hover:bg-white" 
              : "bg-black/20 text-white hover:bg-black/40 border border-white/20"
          }`}
        >
          <Heart className={`w-5 h-5 ${isSelected ? "fill-current" : ""}`} />
        </button>
      </div>

      {isSelected && (
        <div className="absolute bottom-3 right-3 text-white drop-shadow-md">
          <CheckCircle2 className="w-6 h-6 fill-green-500 text-white" />
        </div>
      )}
    </div>
  );
}
