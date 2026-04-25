import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAlbumsByStudio } from "@/services/album.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Wand2, ArrowRight, LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMagicLinksByStudio } from "@/services/magic-link.service";
import { MagicLinksManager } from "@/components/magic/magic-links-manager";

export const metadata = { title: "AI Magic Send | StudioSmart" };

export default async function MagicSendPage() {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const albums = await getAlbumsByStudio(session.user.studioId, true);
  const magicLinks = await getMagicLinksByStudio(session.user.studioId);

  const activeEvents = albums.filter(a => a.isActive).map(a => ({ id: a.id, title: a.title }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Wand2 className="w-8 h-8 text-blue-500" />
            AI Magic Send
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage your Magic Links (QR Codes) and AI Magic events.
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/studio/magic/new">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="events" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Events ({albums.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Magic Links (QR Codes)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed">
              <Wand2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground mb-6">Create your first album event to use AI Magic Send.</p>
              <Button asChild>
                <Link href="/studio/magic/new">Create Event</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <Link href={`/studio/magic/${album.id}`} key={album.id}>
                  <Card className="hover:border-blue-500/50 transition-shadow h-full flex flex-col cursor-pointer border border-transparent hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{album.title}</CardTitle>
                      <CardDescription className="line-clamp-1">Client: {album.client?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{album._count?.photos} photos</span>
                      <div className="text-blue-500 font-medium flex items-center gap-1 group">
                        Manage <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Reusable Magic Links</h3>
            <p className="text-muted-foreground text-sm">
              Create permanent QR codes for physical locations (like "Lobby Screen" or "Photobooth"). 
              You can dynamically change which event these QR codes point to without needing to reprint them.
            </p>
          </div>
          <MagicLinksManager 
            initialLinks={magicLinks} 
            activeEvents={activeEvents} 
            appUrl={process.env.NEXT_PUBLIC_APP_URL || ""} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
