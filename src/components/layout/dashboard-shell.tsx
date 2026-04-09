import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Menu, Wallet } from "lucide-react";
import { Button } from "../ui/button";

interface DashboardShellProps {
  children: ReactNode;
  role: "ADMIN" | "STUDIO";
  title?: string;
  user: { name: string; email: string };
  balance?: number;
}

export function DashboardShell({ children, role, title, user, balance }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/40 font-inter">
      <Sidebar role={role} />
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            {role === "STUDIO" && typeof balance === "number" && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold tracking-tight">₹{balance.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center gap-4 border-l pl-4 md:pl-6">
              <div className="text-sm text-right hidden md:block">
                <div className="font-medium text-[13px] leading-tight">{user.name}</div>
                <div className="text-muted-foreground text-[11px]">{user.email}</div>
              </div>
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary ring-2 ring-background shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-6 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
