"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

interface DashboardShellProps {
  children: ReactNode;
  role: "ADMIN" | "STUDIO";
  title?: string;
  user: { name: string; email: string };
}

export function DashboardShell({ children, role, title, user }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar role={role} />
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden md:block">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground text-xs">{user.email}</div>
            </div>
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
              {user.name.charAt(0).toUpperCase()}
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
