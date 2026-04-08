"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, RotateCcw, Pause, Play } from "lucide-react";
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
  retries: number;
}

const MAX_CONCURRENT = 5;
const MAX_RETRIES = 3;

export function BulkUploader({ albumId, onUploadComplete }: UploadProgressProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "pending" as const,
      retries: 0,
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
    maxSize: 1 * 1024 * 1024, // 1MB
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Upload a single file with retry logic
  const uploadSingleFile = async (uploadFile: UploadingFile): Promise<boolean> => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading", progress: 20 } : f))
    );

    try {
      const formData = new FormData();
      formData.append("file", uploadFile.file);
      formData.append("albumId", albumId);

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 60 } : f))
      );

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${uploadRes.status}`);
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f))
      );
      return true;
    } catch (err: any) {
      // Retry logic
      if (uploadFile.retries < MAX_RETRIES) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, retries: f.retries + 1, status: "pending", progress: 0 }
              : f
          )
        );
        // Wait before retry with exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * (uploadFile.retries + 1)));
        const updatedFile = { ...uploadFile, retries: uploadFile.retries + 1 };
        return uploadSingleFile(updatedFile);
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: `${err.message} (after ${MAX_RETRIES} retries)` }
            : f
        )
      );
      return false;
    }
  };

  // Concurrent upload engine
  const uploadFiles = async () => {
    setIsUploading(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;

    const pending = files.filter((f) => f.status !== "success");
    let index = 0;
    let allSuccess = true;
    const activeUploads: Promise<void>[] = [];

    const startNext = async (): Promise<void> => {
      while (index < pending.length) {
        // Check for pause
        while (pauseRef.current) {
          await new Promise((r) => setTimeout(r, 200));
        }
        if (abortRef.current) return;

        const currentFile = pending[index++];
        const success = await uploadSingleFile(currentFile);
        if (!success) allSuccess = false;
      }
    };

    // Start MAX_CONCURRENT workers
    for (let i = 0; i < Math.min(MAX_CONCURRENT, pending.length); i++) {
      activeUploads.push(startNext());
    }

    await Promise.all(activeUploads);

    setIsUploading(false);
    setIsPaused(false);

    if (allSuccess && !abortRef.current) {
      setTimeout(() => {
        setFiles([]);
        onUploadComplete();
      }, 1500);
    }
  };

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  };

  const retryFailed = () => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "error" ? { ...f, status: "pending", progress: 0, error: undefined, retries: 0 } : f
      )
    );
  };

  // Stats
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const overallProgress = files.length > 0 ? Math.round((successCount / files.length) * 100) : 0;

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
        <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP up to 1MB • 1000+ files supported</p>
      </div>

      {/* Overall Progress & Stats */}
      {files.length > 0 && (
        <div className="p-4 border rounded-lg bg-card space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{files.length} files total</span>
            <span className="text-muted-foreground">
              {successCount} done
              {uploadingCount > 0 && <> • <span className="text-blue-500">{uploadingCount} uploading</span></>}
              {errorCount > 0 && <> • <span className="text-red-500">{errorCount} failed</span></>}
              {pendingCount > 0 && <> • {pendingCount} queued</>}
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{overallProgress}% complete ({MAX_CONCURRENT} concurrent uploads)</p>
        </div>
      )}

      {/* File List - virtualized display for large lists */}
      {files.length > 0 && (
        <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
          {files.length > 200 ? (
            // Compact view for very large lists
            <>
              {files.filter((f) => f.status === "uploading" || f.status === "error").map((file) => (
                <FileRow key={file.id} file={file} onRemove={removeFile} />
              ))}
              {files.filter((f) => f.status === "uploading" || f.status === "error").length === 0 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  {successCount > 0
                    ? `${successCount} uploaded successfully • ${pendingCount} queued`
                    : `${files.length} files queued for upload`}
                </div>
              )}
              {/* Show last few successes */}
              {files.filter((f) => f.status === "success").slice(-3).map((file) => (
                <FileRow key={file.id} file={file} onRemove={removeFile} />
              ))}
            </>
          ) : (
            // Normal view for smaller lists
            files.map((file) => (
              <FileRow key={file.id} file={file} onRemove={removeFile} />
            ))
          )}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {errorCount > 0 && !isUploading && (
              <Button variant="outline" size="sm" onClick={retryFailed}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry {errorCount} Failed
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { abortRef.current = true; setFiles([]); }} disabled={false}>
              {isUploading ? "Cancel" : "Clear All"}
            </Button>
            {isUploading ? (
              <Button variant="secondary" onClick={togglePause}>
                {isPaused ? <><Play className="w-4 h-4 mr-1" /> Resume</> : <><Pause className="w-4 h-4 mr-1" /> Pause</>}
              </Button>
            ) : (
              <Button onClick={uploadFiles} disabled={files.every((f) => f.status === "success")}>
                Upload {files.filter((f) => f.status !== "success").length} files
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted row component for performance
function FileRow({ file, onRemove }: { file: UploadingFile; onRemove: (id: string) => void }) {
  return (
    <div className="p-3 flex items-center gap-3">
      <FileIcon className="w-6 h-6 text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.file.name}</p>
        {(file.status === "uploading" || file.status === "error") && (
          <div className="flex items-center gap-2 mt-1">
            <Progress value={file.progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground w-8">{file.progress}%</span>
          </div>
        )}
        {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
      </div>
      <div className="flex items-center gap-1">
        {file.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
        {file.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
        {file.status !== "uploading" && (
          <button onClick={() => onRemove(file.id)} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
