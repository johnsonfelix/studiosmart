"use client";

import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XHRUpload from "@uppy/xhr-upload";
import toast from "react-hot-toast";
import "@uppy/core/css/style.css";
import "@uppy/dashboard/css/style.css";

interface UppyUploaderProps {
  albumId: string;
}

export function UppyUploader({ albumId }: UppyUploaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uppyRef = useRef<any>(null); // Use any to allow inferred meta types

  useEffect(() => {
    if (uppyRef.current || !containerRef.current) return;

    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 3000,
        allowedFileTypes: [".jpg", ".jpeg", ".png", ".webp"],
      },
      meta: {
        albumId: albumId,
      },
      autoProceed: false,
    })
      .use(Dashboard, {
        target: containerRef.current,
        disableThumbnailGenerator: true,
        inline: true,
        height: 450,
        proudlyDisplayPoweredByUppy: false,
        theme: "dark",
        note: "Upload files here.",
      })
      .use(XHRUpload, {
        endpoint: "/api/upload",
        fieldName: "file",
        formData: true,
        bundle: false,
      });

    uppyInstance.on("complete", async (result) => {
      // Guard against potential undefined in TS types
      if (result.successful && result.successful.length > 0) {
        try {
          await fetch("/api/uppy/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ albumId }),
          });
          toast.success(`Successfully uploaded ${result.successful.length} photos! AI Indexing complete.`);
        } catch (err) {
          console.error("Failed to mark upload as complete", err);
        }
      }
      if (result.failed && result.failed.length > 0) {
        toast.error(`Failed to upload ${result.failed.length} photos.`);
      }
    });

    uppyRef.current = uppyInstance;

    return () => {
      uppyInstance.destroy();
      uppyRef.current = null;
    };
  }, [albumId]);

  return (
    <div className="mt-6 w-full uppy-dark-theme-override">
      <div ref={containerRef} />
    </div>
  );
}
