"use client";

import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
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
      .use(AwsS3, {
        shouldUseMultipart: false, // Forces standard S3 upload typing
        getUploadParameters: async (file) => {
          const res = await fetch("/api/uppy/presign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              metadata: {
                albumId: albumId,
              },
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to get presigned URL");
          }

          const data = await res.json();
          return {
            method: data.method,
            url: data.url,
            fields: data.fields,
            headers: data.headers,
          };
        },
      });

    uppyInstance.on("upload-success", async (file, response) => {
      if (!file) return;
      try {
        const uploadUrlObj = new URL(response.uploadURL || "");
        const s3Key = decodeURIComponent(uploadUrlObj.pathname.substring(1));

        await fetch("/api/uppy/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: s3Key,
            albumId: albumId,
            filename: file.name,
            fileSize: file.size,
          }),
        });
      } catch (err) {
        console.error("Failed to confirm upload in DB", err);
      }
    });

    uppyInstance.on("complete", (result) => {
      // Guard against potential undefined in TS types
      if (result.successful && result.successful.length > 0) {
        toast.success(`Successfully uploaded ${result.successful.length} photos! AI Indexing started.`);
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
