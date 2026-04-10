import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Register | StudioSmart",
  description: "Create your photography studio account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group z-20"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="w-full max-w-[450px] relative z-10 animate-reveal opacity-0">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 mb-4 relative drop-shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            <Image 
              src="/logo.png" 
              alt="StudioSmart Logo" 
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight brand-text-gradient">Get Started</h1>
          <p className="text-white/40 text-sm mt-2 text-center">Join the fastest photo proofing platform today</p>
        </div>

        <RegisterForm />
        
        <p className="mt-8 text-center text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
          Empowering Studios Worldwide
        </p>
      </div>
    </div>
  );
}
