import { ReactNode } from "react";
import Link from "next/link";
import { Camera, Folders, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
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
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export function Sidebar({ role }: { role: "ADMIN" | "STUDIO" }) {
  const items = role === "STUDIO" ? [
    { icon: LayoutDashboard, label: "Dashboard", href: "/studio", active: true },
    { icon: Folders, label: "Albums", href: "/studio/albums" },
    { icon: Users, label: "Clients", href: "/studio/clients" },
  ] : [
    { icon: LayoutDashboard, label: "Overview", href: "/admin", active: true },
    { icon: Camera, label: "Studios", href: "/admin/studios" },
    { icon: Users, label: "Users", href: "/admin/users" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <Camera className="w-6 h-6" />
          <span>StudioSmart</span>
        </Link>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-4rem)] p-4">
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="pt-4 border-t space-y-1">
          <SidebarItem icon={Settings} label="Settings" href={`/${role.toLowerCase()}/settings`} />
          <form action={logoutUser}>
            <Button type="submit" variant="ghost" className="w-full text-destructive justify-start h-11 px-4 gap-3 font-medium">
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
