"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { loginUser } from "@/app/(auth)/actions";
import { toast } from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await loginUser(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Logged in successfully");
        // Handled by NextAuth redirect, but just in case
        router.refresh();
      }
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass rounded-[2rem] p-8 w-full">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/60 text-xs font-bold uppercase tracking-wider ml-1">
              Studio Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="studio@example.com"
              required
              disabled={isLoading}
              className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Password
              </Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            className="w-full h-14 brand-gradient border-0 text-white rounded-2xl text-lg font-bold shadow-xl shadow-brand/10 hover:opacity-90 active:scale-95 transition-all"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : "Login to Studio"}
          </Button>

          <div className="mt-6 flex flex-col items-center gap-4">
            <Link
              href="/register"
              className="text-sm text-white/40 hover:text-brand transition-colors flex items-center gap-2 group"
            >
              Don't have an account?
              <span className="text-white font-medium group-hover:text-brand">Get Started</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
