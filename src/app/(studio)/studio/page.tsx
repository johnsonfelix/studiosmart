import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folders, Image as ImageIcon, Users, CheckCircle } from "lucide-react";
import { getAlbumsByStudio } from "@/services/album.service";

export const metadata = {
  title: "Dashboard | StudioSmart",
};

export default async function StudioDashboardPage() {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const albums = await getAlbumsByStudio(session.user.studioId);

  // Calculate simple stats
  const totalAlbums = albums.length;
  const totalPhotos = albums.reduce((acc, album) => acc + (album._count?.photos || 0), 0);
  
  // Quick clients calculation based on distinct clients in albums
  const clientsSet = new Set(albums.map(a => a.clientId));
  const totalClients = clientsSet.size;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Albums</CardTitle>
            <Folders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlbums}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPhotos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected Photos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground mt-1">Export available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Albums</CardTitle>
          </CardHeader>
          <CardContent>
            {albums.length === 0 ? (
               <div className="text-center p-6 text-muted-foreground border rounded-md border-dashed">
                 No albums yet. Create one to get started!
               </div>
            ) : (
              <div className="space-y-4">
                {albums.slice(0, 5).map(album => (
                  <div key={album.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{album.title}</p>
                      <p className="text-sm text-muted-foreground">Client: {album.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{album._count?.photos} photos</p>
                      <p className="text-sm text-muted-foreground">{new Date(album.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
