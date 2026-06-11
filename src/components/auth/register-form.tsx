"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/app/(auth)/actions";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"CLIENT" | "STUDIO">("CLIENT");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("role", role);
    
    try {
      const result = await registerUser(formData);
      
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Welcome to StudioSmart.");
      router.push(role === "CLIENT" ? "/digital-invite/dashboard" : "/studio"); 
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/digital-invite/dashboard" });
  };

  return (
    <div className="glass rounded-[2rem] p-8 w-full">
      
      {/* Role Toggle Tabs */}
      <div className="flex p-1 bg-black/40 rounded-xl mb-8">
        <button
          type="button"
          onClick={() => setRole("CLIENT")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            role === "CLIENT" 
              ? "bg-brand text-white shadow-lg shadow-brand/20" 
              : "text-white/50 hover:text-white"
          }`}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("STUDIO")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            role === "STUDIO" 
              ? "bg-brand text-white shadow-lg shadow-brand/20" 
              : "text-white/50 hover:text-white"
          }`}
        >
          Studio Owner
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          
          {role === "STUDIO" && (
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
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
              {role === "STUDIO" ? "Owner Name" : "Full Name"}
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

          <div className={`grid ${role === "STUDIO" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] ml-1">
                Email Address
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder={role === "STUDIO" ? "studio@example.com" : "you@example.com"}
                required 
                disabled={isLoading}
                className="h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-brand/30 focus:border-brand/50 transition-all placeholder:text-white/20"
              />
            </div>
            {role === "STUDIO" && (
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
            )}
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
            className="w-full h-14 brand-gradient border-0 text-white rounded-2xl text-lg font-bold shadow-xl shadow-brand/10 hover:opacity-90 active:scale-95 transition-all mb-4" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {role === "STUDIO" ? "Setting up studio..." : "Creating account..."}
              </div>
            ) : (role === "STUDIO" ? "Create Studio Account" : "Create Account")}
          </Button>

          {role === "CLIENT" && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/40 text-xs">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full h-14 mt-4 bg-white text-black border-0 rounded-2xl text-lg font-bold hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
          
          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="text-sm text-white/40 hover:text-brand transition-colors flex flex-col sm:flex-row items-center justify-center gap-2 group"
            >
              Already have an account? 
              <span className="text-white font-medium group-hover:text-brand">Login to Dashboard</span>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
