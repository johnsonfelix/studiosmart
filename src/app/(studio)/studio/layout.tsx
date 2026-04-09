import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStudioBalance } from "@/services/wallet.service";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== "STUDIO" || !session.user.studioId) {
    redirect("/login");
  }

  const balance = await getStudioBalance(session.user.studioId);

  return (
    <DashboardShell 
      role="STUDIO" 
      user={{ name: session.user.name || "Studio Owner", email: session.user.email || "" }}
      balance={balance}
    >
      {children}
    </DashboardShell>
  );
}
