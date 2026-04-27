import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAlbumById } from "@/services/album.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ExternalLink, QrCode, Database, ImageIcon, Users } from "lucide-react";
import { DispatchButton } from "@/components/magic/dispatch-button";
import { UppyUploader } from "@/components/magic/uppy-uploader";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagicPhotosGrid } from "@/components/magic/magic-photos-grid";
import { MagicSelfiesGrid } from "@/components/magic/magic-selfies-grid";
import { QRCodeView } from "@/components/magic/qr-code-view";
import { DeleteEventButton } from "@/components/magic/delete-event-button";

export const metadata = { title: "AI Magic Send Details | StudioSmart" };

export default async function MagicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  const { id: albumId } = await params;
  const album = await getAlbumById(albumId, session.user.studioId);

  if (!album) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-lg bg-card border-dashed">
        Event not found or you don't have access.
      </div>
    );
  }

  const pendingCount = await prisma.magicRegistration.count({
    where: { albumId, status: "PENDING" }
  });

  const sentCount = await prisma.magicRegistration.count({
    where: { albumId, status: "SENT" }
  });

  // The link that the QR code will direct guests to
  const guestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/guest/magic/${album.id}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/studio/magic">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{album.title}</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Database className="w-3 h-3" />
              AI Magic Send Event
            </p>
          </div>
        </div>

        <DeleteEventButton albumId={album.id} />
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="selfies" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Selfies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 pt-0">
            <div className="space-y-6">
              <Card className="border shadow-sm flex flex-col justify-center items-center text-center p-8 bg-blue-50/20 dark:bg-blue-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Scan to Get Your Photos!</CardTitle>
                  <CardDescription>
                    Guests can scan this QR code with their mobile device to instantly receive their matched photos via email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <QRCodeView value={guestUrl} size={200} fileName={`${album.title}-qr-code`} />

                  <Button asChild variant="outline" className="w-full gap-2 mt-4 inline-flex">
                    <Link href={guestUrl} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                      Open Guest Portal directly
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Indexed Photos</span>
                    <span className="font-semibold">{album._count?.photos || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Pending Guest Emails</span>
                    <span className="font-semibold text-blue-500">{pendingCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Sent Magic Emails</span>
                    <span className="font-semibold text-green-500">{sentCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Client Name</span>
                    <span className="font-semibold">{album.client?.name || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How it Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">1</div>
                    <div>
                      <h4 className="font-medium">Guests Check-In</h4>
                      <p className="text-sm text-muted-foreground">Guests scan the QR code and pre-register their selfie and email anytime.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">2</div>
                    <div>
                      <h4 className="font-medium">Upload Photos</h4>
                      <p className="text-sm text-muted-foreground">Upload all high-res event photos directly to our high-speed AWS endpoint below.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">3</div>
                    <div>
                      <h4 className="font-medium">Dispatch AI Magic</h4>
                      <p className="text-sm text-muted-foreground">Click dispatch to let the AI automatically find matches for all guests and email them.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-card rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-lg mb-2">Send Magic Emails</h3>
                <p className="text-sm text-muted-foreground mb-4">Automatically find and send photos to all waiting guests via face match.</p>
                <DispatchButton albumId={album.id} pendingCount={pendingCount} isIndexing={album.isIndexing} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-lg mb-2">Upload Event Heavy Assets</h3>
                <p className="text-sm text-muted-foreground mb-4">You can load massive event photos here without limits.</p>
                <UppyUploader albumId={album.id} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Uploaded Event Photos
              </CardTitle>
              <CardDescription>
                These photos are indexed for AI face matching. Guests will be searched against these images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MagicPhotosGrid photos={album.photos} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selfies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Guest Registrations
              </CardTitle>
              <CardDescription>
                A list of guests who have scanned the QR code and submitted their selfie for matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MagicSelfiesGrid registrations={album.magicRegistrations} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

