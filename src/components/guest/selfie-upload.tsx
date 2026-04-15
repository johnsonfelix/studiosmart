"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { matchGuestSelfie } from "@/actions/guest.actions";
import { Loader2, Upload, Camera } from "lucide-react";
import toast from "react-hot-toast";

interface SelfieUploadProps {
  albumId: string;
}

export function SelfieUpload({ albumId }: SelfieUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPhotos([]);

    try {
      // Compress the image before uploading to keep it under AWS Rekognition's 5MB limit
      const options = {
        maxSizeMB: 2, // well under 5MB limit
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("selfie", compressedFile);
      formData.append("albumId", albumId);

      const result = await matchGuestSelfie(formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        if (result.photos && result.photos.length > 0) {
          setPhotos(result.photos);
          toast.success(`Found ${result.photos.length} photos!`);
        } else {
          toast.success("No matching photos found.");
        }
      }
    } catch (error) {
      console.error("Selfie upload failed:", error);
      toast.error("Failed to analyze selfie.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Find Your Photos</h2>
        <p className="text-gray-400">Take a selfie to find all the photos you appear in.</p>
        
        <div className="relative mt-6">
          <input
            type="file"
            accept="image/*"
            capture="user" // Prompts the front-facing camera on mobile
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleSelfieUpload}
            disabled={isUploading}
          />
          <button
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning your face...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Selfie
              </>
            )}
          </button>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="w-full max-w-4xl pt-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            📸 Your Event Photos <span className="text-sm font-normal text-gray-400">({photos.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.fullResUrl || photo.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] block overflow-hidden rounded-xl bg-gray-900 border border-white/10"
              >
                <img
                  src={photo.previewUrl}
                  alt="Matched Photo"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium border border-white/20 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                    View High-Res
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
