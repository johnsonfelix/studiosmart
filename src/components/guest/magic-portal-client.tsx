"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { registerMagicGuest } from "@/actions/magic.actions";
import { Loader2, Camera, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface MagicPortalClientProps {
  albumId: string;
  eventTitle: string;
  clientName: string;
  studioName: string;
}

export function MagicPortalClient({ albumId, eventTitle, clientName, studioName }: MagicPortalClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleMagicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      e.target.value = ""; // reset file input
      return;
    }

    setIsProcessing(true);

    try {
      // Compress the image before uploading to keep it under AWS Rekognition's 5MB limit
      const options = {
        maxSizeMB: 2, 
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("selfie", compressedFile);
      formData.append("albumId", albumId);
      formData.append("email", email);

      const result = await registerMagicGuest(formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        setIsRegistered(true);
        toast.success(result.message || "Registered successfully!");
      }
    } catch (error) {
      console.error("Magic upload failed:", error);
      toast.error("Failed to process your request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] text-center shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(52,211,153,0.4)] animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400 mb-4 tracking-tight">You're All Set!</h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            We've safely stored your selfie. Your matched photos will be dispatched shortly to:
          </p>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-10 text-emerald-300 font-medium font-mono truncate shadow-inner">
            {email}
          </div>
          <button
            onClick={() => { setIsRegistered(false); setEmail(""); }}
            className="w-full text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95"
          >
            Register Another Person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 text-center mb-10">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-3 tracking-tight">Get Your Photos</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Snap a selfie and enter your email. We'll automatically identify you in the photos for <span className="font-semibold text-white/90">{eventTitle}</span> (by <span className="font-semibold text-white/90">{studioName}</span> for <span className="font-semibold text-white/90">{clientName}</span>) and email them to you.
        </p>
      </div>
      
      <div className="space-y-8 relative z-10">
        <div className="group">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase text-xs">
            1. Where should we send them?
          </label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner text-lg"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase text-xs">
            2. Take a quick selfie
          </label>
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 transition duration-500 ${email.includes("@") && !isProcessing ? 'group-hover:opacity-60 animate-pulse' : 'hidden'}`}></div>
            <input
              type="file"
              accept="image/*"
              capture="user" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
              onChange={handleMagicUpload}
              disabled={isProcessing || !email.includes("@")}
            />
            <button
              disabled={isProcessing || !email.includes("@")}
              className={`w-full flex flex-col items-center justify-center gap-4 py-10 rounded-2xl border transition-all duration-500 relative overflow-hidden z-10
                ${email.includes("@") && !isProcessing 
                  ? "border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-200 hover:scale-[1.02] shadow-lg" 
                  : "border-white/5 bg-black/20 text-slate-600"
                }
              `}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <Camera className="absolute inset-0 m-auto w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                  <span className="font-bold tracking-widest uppercase text-sm animate-pulse text-blue-300">Processing Magic...</span>
                </div>
              )}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${email.includes("@") && !isProcessing ? "bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "bg-white/5"}`}>
                <Camera className={`w-8 h-8 ${email.includes("@") && !isProcessing ? "text-blue-400" : "text-slate-500"}`} />
              </div>
              <span className={`font-bold text-lg tracking-wide ${email.includes("@") ? "text-white" : ""}`}>
                {email.includes("@") ? "Tap to Snap Selfie" : "Enter Email First"}
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-5 px-5 py-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            Selfies are deleted immediately after matching.
          </p>
        </div>
      </div>
    </div>
  );
}

