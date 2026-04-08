import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Note: Might need to create this if it doesn't exist

export const metadata = { title: "Manage Studios | StudioSmart" };

export default async function AdminStudiosPage() {
  const studios = await prisma.studio.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          albums: true,
          clients: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Studios</h2>
      </div>

      <div className="grid gap-6">
        {studios.map((studio) => (
          <Card key={studio.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">{studio.name}</CardTitle>
                <div className="text-sm text-muted-foreground">Owner: {studio.owner.name} ({studio.owner.email})</div>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${studio.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {studio.isActive ? "Active" : "Inactive"}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="font-semibold">{studio._count.albums}</span> Albums
                </div>
                <div>
                  <span className="font-semibold">{studio._count.clients}</span> Clients
                </div>
                <div className="text-muted-foreground">
                  Joined {new Date(studio.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
