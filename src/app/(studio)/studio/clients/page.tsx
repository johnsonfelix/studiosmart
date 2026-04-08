import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const metadata = { title: "Clients | StudioSmart" };

export default async function ClientsPage() {
  const session = await auth();
  if (!session || !session.user.studioId) redirect("/login");

  // Fetch clients for the studio
  const clients = await prisma.client.findMany({
    where: { studioId: session.user.studioId },
    include: {
      _count: {
        select: { albums: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No clients yet</h3>
          <p className="text-muted-foreground mb-6">Clients are created when you create an album for them, or you can add them manually.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <Card key={client.id} className="h-full">
              <CardHeader>
                <CardTitle>{client.name}</CardTitle>
                <div className="text-sm text-muted-foreground">{client.phone || "No phone"}</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {client._count.albums} Albums
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
