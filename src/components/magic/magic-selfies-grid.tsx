"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MagicRegistration } from "@prisma/client";
import { getPresignedUrls } from "@/actions/magic.actions";
import { Loader2, UserCheck, Mail, Calendar, BadgeCheck, Clock, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface MagicSelfiesGridProps {
  registrations: MagicRegistration[];
}

export function MagicSelfiesGrid({ registrations }: MagicSelfiesGridProps) {
  const [itemsWithUrls, setItemsWithUrls] = useState<(MagicRegistration & { url: string | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUrls() {
      if (registrations.length === 0) {
        setIsLoading(false);
        return;
      }

      const keys = registrations.map(r => r.selfieUrl).filter(Boolean);
      const result = await getPresignedUrls(keys);

      if (result.success && result.urls) {
        const urlMap = new Map(result.urls.map(u => [u.key, u.url]));
        const updated = registrations.map(r => ({
          ...r,
          url: urlMap.get(r.selfieUrl) || null
        }));
        setItemsWithUrls(updated);
      }
      setIsLoading(false);
    }

    fetchUrls();
  }, [registrations]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading registrations...</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
        <UserCheck className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No guests registered yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Guest selfies will appear here after they scan the QR code.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {itemsWithUrls.map((reg) => (
        <div 
          key={reg.id} 
          className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="p-4 flex gap-4 items-start">
            <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted border">
              {reg.url ? (
                <Image
                  src={reg.url}
                  alt={reg.email}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <UserCheck className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
              <div className="truncate">
                <p className="text-sm font-semibold truncate flex items-center gap-2">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  {reg.email}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                   <Clock className="w-3 h-3" />
                   {format(new Date(reg.createdAt), "MMM d, h:mm a")}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {reg.status === "SENT" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                    <BadgeCheck className="w-3 h-3" />
                    Emails Sent
                  </span>
                ) : reg.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    Waiting
                  </span>
                ) : reg.status === "NO_MATCH" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" />
                    No Match
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" />
                    {reg.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
