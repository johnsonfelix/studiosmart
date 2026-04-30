"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Camera, Folders, Users, Settings, LogOut, LayoutDashboard, Wallet, Wand2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/app/actions";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

function SidebarItem({ icon: Icon, label, href, active }: SidebarItemProps) {
  return (
    <Link href={href} className="w-full">
      <Button
        variant={active ? "secondary" : "ghost"}
        className="w-full justify-start h-11 px-4 gap-3 font-medium"
      >
        <Icon className={active ? "w-5 h-5 text-primary" : "w-5 h-5 text-muted-foreground"} />
        <span className={active ? "text-primary font-semibold" : ""}>{label}</span>
      </Button>
    </Link>
  );
}

export function Sidebar({ role }: { role: "ADMIN" | "STUDIO" }) {
  const pathname = usePathname();
  
  const items = role === "STUDIO" ? [
    { icon: LayoutDashboard, label: "Dashboard", href: "/studio" },
    { icon: Folders, label: "Albums", href: "/studio/albums" },
    { icon: Wand2, label: "AI Magic Send", href: "/studio/magic" },
    { icon: Users, label: "Clients", href: "/studio/clients" },
    { icon: Wallet, label: "Wallet", href: "/studio/wallet" },
  ] : [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Camera, label: "Studios", href: "/admin/studios" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Wallet, label: "Wallet Requests", href: "/admin/wallet" },
    { icon: Trash2, label: "Storage Cleanup", href: "/admin/cleanup" },
  ];

  const settingsHref = `/${role.toLowerCase()}/settings`;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <Camera className="w-6 h-6 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">StudioSmart</span>
        </Link>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-4rem)] p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.href === "/studio" || item.href === "/admin" 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            
            return (
              <SidebarItem 
                key={item.href} 
                {...item} 
                active={isActive} 
              />
            );
          })}
        </nav>

        <div className="pt-4 border-t space-y-1">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href={settingsHref} 
            active={pathname === settingsHref}
          />
          <form action={logoutUser}>
            <Button type="submit" variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start h-11 px-4 gap-3 font-medium transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
