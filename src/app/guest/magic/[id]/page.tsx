import { getAlbumById } from "@/services/album.service";
import { notFound } from "next/navigation";
import { MagicPortalClient } from "@/components/guest/magic-portal-client";
import { Wand2, User, Building2, Calendar } from "lucide-react";

export const metadata = { title: "AI Magic Send | Get Your Photos" };

export default async function GuestMagicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const album = await getAlbumById(id);

  if (!album) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-200">
      <header className="px-6 py-6 border-b border-white/10 glass max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">AI Magic Send</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-blue-300/80">Powered by StudioSmart</span>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
        <MagicPortalClient 
          albumId={id} 
          eventTitle={album.title} 
          clientName={album.client.name}
          studioName={album.studio.name}
        />
      </main>
    </div>
  );
}
