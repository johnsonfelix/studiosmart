import { getAlbumByToken } from "@/services/album.service";
import { generatePresignedGetUrl } from "@/lib/s3";
import { ClientGallery } from "@/components/gallery/client-gallery";
import { GalleryPaymentGateway } from "@/components/gallery/gallery-payment-gateway";

export const metadata = { title: "Client Gallery | StudioSmart" };

export default async function ClientGalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const albumData = await getAlbumByToken(token);

  if (!albumData || !albumData.isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
        <div className="p-10 text-center max-w-sm w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Gallery Not Found</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            This gallery link may be invalid or expired. Please contact your photographer for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (albumData.requirePayment && !albumData.isPaid) {
    return (
      <GalleryPaymentGateway 
        albumToken={token} 
        albumTitle={albumData.title} 
        studioName={albumData.studio.name} 
        price={albumData.price || 0} 
      />
    );
  }

  // Enrich initial batch of photos with presigned URLs
  const enrichedPhotos = await Promise.all(
    (albumData.photos || []).map(async (photo: any) => ({
      ...photo,
      previewUrl: (await generatePresignedGetUrl(photo.previewUrl)) || "",
      thumbnailUrl: (await generatePresignedGetUrl(photo.thumbnailUrl)) || "",
      originalUrl: await generatePresignedGetUrl(photo.originalUrl),
    }))
  );

  return (
    <ClientGallery
      albumTitle={albumData.title}
      studioName={albumData.studio.name}
      photos={enrichedPhotos}
      albumId={albumData.id}
      token={token}
      selectionLocked={!!albumData.selectionLocked}
      selectionMap={albumData.selectionMap}
      totalPhotosCount={albumData.totalPhotos}
    />
  );
}
