import { getAlbumById } from "@/services/album.service";
import { notFound } from "next/navigation";
import { MagicPortalClient } from "@/components/guest/magic-portal-client";
import { Wand2, User, Building2, Calendar, Phone } from "lucide-react";
import { generatePresignedGetUrl } from "@/lib/s3";

export const metadata = { title: "AI Magic Send | Get Your Photos" };

export default async function GuestMagicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const album = await getAlbumById(id);

  if (!album) {
    return notFound();
  }

  const logoUrl = await generatePresignedGetUrl(album.studio.logoUrl);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden flex flex-col">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-blue-900/20 rounded-full blur-[150px]"></div>
      </div>

      <header className="px-6 py-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Wand2 className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI Magic Send</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Powered by</span>
            <span className="text-xs text-blue-300 font-bold tracking-wide">StudioSmart</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center gap-12 relative z-10">
        {/* Studio Branding Section */}
        <div className="flex flex-col items-center text-center gap-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur transition duration-500 group-hover:opacity-100 opacity-50"></div>
            <div className="relative h-28 w-48 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 flex items-center justify-center shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-105">
              {logoUrl ? (
                <img src={logoUrl} alt={album.studio.name} className="h-full w-full object-contain filter drop-shadow-lg" />
              ) : (
                <Building2 className="w-14 h-14 text-blue-400/30" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {album.studio.name}
            </h1>
            <p className="text-blue-200/80 font-medium tracking-wide uppercase text-xs">Presents your memories</p>
          </div>
        </div>

        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 fill-mode-both">
          <MagicPortalClient 
            albumId={id} 
            eventTitle={album.title} 
            clientName={album.client.name}
            studioName={album.studio.name}
          />
        </div>
      </main>
    </div>
  );
}
