import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAlbumsByStudio } from "@/services/album.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Folders, Clock, AlertTriangle } from "lucide-react";
import { differenceInDays, addDays } from "date-fns";

export const metadata = { title: "Albums | StudioSmart" };

export default async function AlbumsPage() {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const albums = await getAlbumsByStudio(session.user.studioId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Albums</h2>
        <Button asChild>
          <Link href="/studio/albums/new">
            <Plus className="w-4 h-4 mr-2" />
            New Album
          </Link>
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed">
          <Folders className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No albums found</h3>
          <p className="text-muted-foreground mb-6">Create your first album to start sharing photos with clients.</p>
          <Button asChild>
            <Link href="/studio/albums/new">Create Album</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const expiryDate = album.expiresAt 
              ? new Date(album.expiresAt) 
              : addDays(new Date(album.createdAt), 180);
              
            const daysLeft = differenceInDays(expiryDate, new Date());
            const isNearDeletion = daysLeft <= 30;

            return (
              <Link href={`/studio/albums/${album.id}`} key={album.id}>
                <Card className="hover:border-primary/50 transition-shadow h-full flex flex-col cursor-pointer border-t-4 border-t-transparent hover:border-t-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{album.title}</CardTitle>
                      {isNearDeletion && (
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-1">Client: {album.client?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{album._count?.photos} photos</span>
                        <span>{new Date(album.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {daysLeft !== null && (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                          isNearDeletion 
                            ? "bg-destructive/10 text-destructive border border-destructive/20" 
                            : "bg-muted text-muted-foreground border border-muted"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Deleting in {daysLeft} days</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
