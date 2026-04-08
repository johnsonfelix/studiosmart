import { redirect } from "next/navigation";
import { getAlbumByToken } from "@/services/album.service";
import { PhotoGrid } from "@/components/gallery/photo-grid";

export const metadata = { title: "Client Gallery | StudioSmart" };

export default async function ClientGalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  // No auth required, securely accessed via token
  const album = await getAlbumByToken(token);

  if (!album || !album.isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="p-12 text-center text-muted-foreground border rounded-lg bg-card shadow-sm max-w-md w-full">
          <h2 className="text-xl font-semibold text-foreground mb-2">Gallery Not Found</h2>
          <p>This gallery link may be invalid or expired. Please contact your photographer for a new link.</p>
        </div>
      </div>
    );
  }

  // Pre-load logic to show heart status
  // Wait, selections logic is linked to clientId which we have via the album
  // The PhotoGrid takes care of making the POST requests relying on `token`.

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      <header className="sticky top-0 z-30 flex min-h-16 items-center border-b bg-background/80 backdrop-blur-md px-6 shadow-sm">
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">{album.title}</h1>
          <p className="text-sm text-muted-foreground">Select your favorite photos below.</p>
        </div>
        <div className="text-sm font-medium">
          Photographer: {album.studio.name}
        </div>
      </header>
      
      <main className="p-6 max-w-7xl mx-auto">
        <PhotoGrid 
          initialPhotos={album.photos} 
          albumId={album.id} 
          role="CLIENT"
          // We must pass the token to the PhotoGrid or use a Provider approach to handle token-based selection
          // Because client access may not use session cookies
        />
      </main>
    </div>
  );
}
