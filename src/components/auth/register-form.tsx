"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/app/(auth)/actions";
import { toast } from "react-hot-toast";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await registerUser(formData);
      
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Welcome to StudioSmart.");
      router.push("/studio"); // Redirect to studio board
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass rounded-[2rem] p-8 w-full">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="studioName" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
              Studio Name
            </Label>
            <Input 
              id="studioName" 
              name="studioName" 
              placeholder="e.g. Moonlight Studios"
              required 
              disabled={isLoading}
              className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
              Owner Name
            </Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Your full name"
              required 
              disabled={isLoading}
              className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
                Email Address
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="studio@example.com" 
                required 
                disabled={isLoading}
                className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
                Mobile Number
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="+91 XXXXX XXXXX" 
                required 
                disabled={isLoading}
                className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
              Password
            </Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              disabled={isLoading}
              className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full h-14 brand-gradient border-0 text-white rounded-2xl text-lg font-bold shadow-xl shadow-brand/10 hover:opacity-90 active:scale-95 transition-all" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up your studio...
              </div>
            ) : "Create Studio Account"}
          </Button>
          
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-white/40 hover:text-brand transition-colors flex flex-col sm:flex-row items-center justify-center gap-2 group"
            >
              Already have a studio? 
              <span className="text-white font-medium group-hover:text-brand">Login to Dashboard</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
