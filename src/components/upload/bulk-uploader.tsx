"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UploadProgressProps {
  albumId: string;
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function BulkUploader({ albumId, onUploadComplete }: UploadProgressProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    setIsUploading(true);
    let allSuccess = true;

    for (const [index, uploadFile] of files.entries()) {
      if (uploadFile.status === "success") continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading", progress: 10 } : f))
      );

      try {
        // 1. Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId,
            fileName: uploadFile.file.name,
            contentType: uploadFile.file.type,
            fileSize: uploadFile.file.size,
          }),
        });

        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, key } = await presignRes.json();

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 50 } : f))
        );

        // 2. Upload to S3
        const s3Res = await fetch(uploadUrl, {
          method: "PUT",
          body: uploadFile.file,
          headers: {
            "Content-Type": uploadFile.file.type,
          },
        });

        if (!s3Res.ok) throw new Error("Failed to upload to S3");

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 90 } : f))
        );

        // 3. Create Photo Record
        const recordRes = await fetch(`/api/albums/${albumId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            fileName: uploadFile.file.name,
            fileSize: uploadFile.file.size,
            // Assuming we aren't extracting dimensions on client side for now to speed up MVP
            width: 0,
            height: 0,
          }),
        });

        if (!recordRes.ok) throw new Error("Failed to create record");

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f))
        );
      } catch (err: any) {
        allSuccess = false;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "error", error: err.message } : f
          )
        );
      }
    }

    setIsUploading(false);
    if (allSuccess) {
      setTimeout(() => {
        setFiles([]);
        onUploadComplete();
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-medium">Drag & drop images here, or click to select files</p>
        <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP up to 50MB</p>
      </div>

      {files.length > 0 && (
        <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
          {files.map((file) => (
            <div key={file.id} className="p-3 flex items-center gap-3">
              <FileIcon className="w-8 h-8 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={file.progress} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-10">{file.progress}%</span>
                </div>
                {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
              </div>
              <div className="flex items-center gap-2">
                {file.status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {file.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                {file.status !== "uploading" && (
                  <button onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading}>
            Clear All
          </Button>
          <Button onClick={uploadFiles} disabled={isUploading || files.every((f) => f.status === "success")}>
            {isUploading ? "Uploading..." : `Upload ${files.length} files`}
          </Button>
        </div>
      )}
    </div>
  );
}
