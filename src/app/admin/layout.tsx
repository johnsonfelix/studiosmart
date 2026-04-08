import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell 
      role="ADMIN" 
      user={{ name: session.user.name || "Admin User", email: session.user.email || "" }}
      title="Admin Panel"
    >
      {children}
    </DashboardShell>
  );
}
