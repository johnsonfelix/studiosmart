"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeView } from "@/components/magic/qr-code-view";
import { createMagicLinkAction, updateMagicLinkAlbumAction, deleteMagicLinkAction } from "@/app/(studio)/studio/magic/actions";
import { toast } from "react-hot-toast";
import { LinkIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MagicLinkData {
  id: string;
  name: string;
  albumId: string | null;
  album?: { id: string; title: string } | null;
}

interface EventData {
  id: string;
  title: string;
}

export function MagicLinksManager({ 
  initialLinks, 
  activeEvents,
  appUrl
}: { 
  initialLinks: MagicLinkData[];
  activeEvents: EventData[];
  appUrl: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState(initialLinks);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsCreating(true);
      const formData = new FormData();
      formData.append("name", newName);
      
      startTransition(async () => {
        await createMagicLinkAction(formData);
        toast.success("Magic Link created!");
        setNewName("");
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create link");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignEvent = async (linkId: string, albumId: string) => {
    try {
      const targetAlbumId = albumId === "none" ? null : albumId;
      
      // Optimistically update UI
      setLinks(prev => prev.map(l => l.id === linkId ? { ...l, albumId: targetAlbumId } : l));
      
      startTransition(async () => {
        await updateMagicLinkAlbumAction(linkId, targetAlbumId);
        toast.success("Event assigned successfully!");
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to assign event");
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this Magic Link?")) return;
    
    try {
      startTransition(async () => {
        await deleteMagicLinkAction(linkId);
        toast.success("Magic Link deleted");
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete link");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <form onSubmit={handleCreate} className="flex-1 flex gap-2 w-full max-w-sm">
          <Input 
            placeholder="New QR Name (e.g., Lobby Screen)" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isPending || isCreating}
          />
          <Button type="submit" disabled={isPending || isCreating || !newName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => {
          const qrUrl = `${appUrl}/s/${link.id}`;
          
          return (
            <Card key={link.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{link.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} disabled={isPending} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center flex-1">
                <div className="bg-white p-2 rounded-xl mb-6">
                  <QRCodeView value={qrUrl} size={150} fileName={`magic-link-${link.name}`} />
                </div>
                
                <div className="w-full mt-auto space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigned Event</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={link.albumId || "none"}
                      onChange={(e) => handleAssignEvent(link.id, e.target.value)}
                      disabled={isPending}
                    >
                      <option value="none">No active event (Disabled)</option>
                      {activeEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="w-full text-xs" onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      toast.success("Link copied!");
                    }}>
                      <LinkIcon className="w-3 h-3 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" className="w-full text-xs" asChild>
                      <Link href={qrUrl} target="_blank">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Test
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {links.length === 0 && (
          <div className="col-span-full p-8 text-center border rounded-lg border-dashed text-muted-foreground">
            No Magic Links created yet. Create one to get a reusable QR code!
          </div>
        )}
      </div>
    </div>
  );
}
