"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function NewAlbumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    // For MVP, we'll auto-create or mock a client ID
    // In full implementation, there should be a client select dropdown

    try {
      // Temporary hack to create client if API doesn't exist yet, 
      // but we will assume we pass a dummy clientId to the album API for now
      // since Client CRUD requires its own pages.
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          clientId: "dummy-client-id-replace-later" // TODO: fix this
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success("Album created successfully");
      router.push(`/studio/albums/${data.album.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create album");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create New Album</h2>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Album Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Album Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Smith Wedding" disabled={isLoading} />
            </div>
            
            {/* Note: Client Selection Omitted for MVP Speed */}
            <div className="bg-amber-500/10 p-4 rounded-md text-amber-500 text-sm">
              Note: The database requires a valid Client to create an album. 
              Ensure Client creation exists in API or DB seed.
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Album"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
