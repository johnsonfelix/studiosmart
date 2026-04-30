"use client";

import { useState } from "react";
import { scanOrphanedFiles, deleteOrphanedFiles } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CleanupPage() {
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{
    totalS3Objects: number;
    orphanedCount: number;
    fullOrphanedList: string[];
  } | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const res = await scanOrphanedFiles();
      if (res.success && res.totalS3Objects !== undefined) {
        setResult({
          totalS3Objects: res.totalS3Objects,
          orphanedCount: res.orphanedCount || 0,
          fullOrphanedList: res.fullOrphanedList || [],
        });
        toast.success("Scan complete!");
      } else {
        toast.error(res.error || "Failed to scan S3");
      }
    } catch (err) {
      toast.error("An error occurred during scanning");
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async () => {
    if (!result || result.fullOrphanedList.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${result.orphanedCount} orphaned files? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteOrphanedFiles(result.fullOrphanedList);
      if (res.success) {
        toast.success(`Successfully deleted ${res.deletedCount} files!`);
        setResult(null);
      } else {
        toast.error(res.error || "Failed to delete files");
      }
    } catch (err) {
      toast.error("An error occurred during deletion");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Cleanup</h1>
        <p className="text-muted-foreground mt-2">
          Identify and remove orphaned files in AWS S3 that have no records in the database.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Safety Check
            </CardTitle>
            <CardDescription>
              Orphaned files usually occur when an upload starts but the "confirm" step fails.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. <strong>Scan</strong> lists all files in your S3 bucket.</p>
            <p>2. It compares them with all Photo and Registration records.</p>
            <p>3. Files not found in the database are marked as "orphaned".</p>
            <p className="font-semibold text-red-500">Warning: Deletion is permanent and cannot be recovered.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Start the process by scanning your storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              onClick={handleScan} 
              disabled={scanning || deleting} 
              className="w-full h-12 text-lg"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Scanning S3...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Start Full Scan
                </>
              )}
            </Button>

            {result && (
              <Button 
                onClick={handleDelete} 
                disabled={deleting || result.orphanedCount === 0}
                variant="destructive"
                className="w-full h-12 text-lg"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Deleting {result.orphanedCount} Files...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Delete {result.orphanedCount} Orphaned Files
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scan Results</p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-4xl font-bold">{result.totalS3Objects}</p>
                    <p className="text-xs text-muted-foreground">Total S3 Objects</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-amber-600">{result.orphanedCount}</p>
                    <p className="text-xs text-muted-foreground">Orphaned Files Found</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-full">
                {result.orphanedCount === 0 ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                ) : (
                  <ShieldAlert className="w-12 h-12 text-amber-500" />
                )}
              </div>
            </div>
            
            {result.orphanedCount > 0 && (
              <div className="mt-6 p-4 bg-white/50 rounded-lg border border-amber-200">
                <p className="text-sm font-semibold mb-2">Sample of orphaned keys:</p>
                <ul className="text-xs font-mono text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                  {result.fullOrphanedList.slice(0, 10).map((key, i) => (
                    <li key={i} className="truncate">{key}</li>
                  ))}
                  {result.orphanedCount > 10 && <li>... and {result.orphanedCount - 10} more</li>}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
