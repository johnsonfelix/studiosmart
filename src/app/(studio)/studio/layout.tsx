import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== "STUDIO") {
    redirect("/login");
  }

  return (
    <DashboardShell 
      role="STUDIO" 
      user={{ name: session.user.name || "Studio Owner", email: session.user.email || "" }}
    >
      {children}
    </DashboardShell>
  );
}
