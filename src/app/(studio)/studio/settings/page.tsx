import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/studio/settings-form";

export const metadata = {
  title: "Settings | StudioSmart",
};

export default async function StudioSettingsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "STUDIO" || !session.user.studioId) {
    redirect("/login");
  }

  const studio = await prisma.studio.findUnique({
    where: { id: session.user.studioId },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!studio) {
    redirect("/login");
  }

  const initialData = {
    studioName: studio.name,
    ownerName: studio.owner.name,
    email: studio.owner.email,
    phone: studio.owner.phone || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <SettingsForm initialData={initialData} />
    </div>
  );
}
