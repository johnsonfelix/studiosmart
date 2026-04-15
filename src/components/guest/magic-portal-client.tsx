"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { registerMagicGuest } from "@/actions/magic.actions";
import { Loader2, Camera, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface MagicPortalClientProps {
  albumId: string;
  eventTitle: string;
}

export function MagicPortalClient({ albumId, eventTitle }: MagicPortalClientProps) {
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
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">You're Registered!</h2>
        <p className="text-slate-300 text-lg mb-6">
          We've safely stored your selfie and will dispatch your matched photos to:
        </p>
        <div className="bg-black/20 rounded-xl p-4 mb-8 text-blue-200 font-medium font-mono truncate">
          {email}
        </div>
        <button
          onClick={() => { setIsRegistered(false); setEmail(""); }}
          className="text-white bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full font-medium"
        >
          Register Another Person
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Get Your Event Photos</h2>
        <p className="text-slate-400 text-sm">
          Snap a selfie and enter your email. We'll automatically identify you in the photos for <span className="font-semibold text-white">{eventTitle}</span> and email them to you.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Where should we send them?
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              capture="user" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              onChange={handleMagicUpload}
              disabled={isProcessing || !email.includes("@")}
            />
            <button
              disabled={isProcessing || !email.includes("@")}
              className={`w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed transition-all duration-300 relative overflow-hidden
                ${email.includes("@") && !isProcessing 
                  ? "border-blue-400/50 hover:bg-blue-500/10 hover:border-blue-400 bg-blue-500/5 text-blue-300" 
                  : "border-white/10 bg-white/5 text-slate-500"
                }
              `}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-400" />
                  <span className="font-semibold tracking-wide animate-pulse">Running AI Recognition...</span>
                </div>
              )}
              <Camera className={`w-10 h-10 ${email.includes("@") && !isProcessing ? "text-blue-400" : "text-slate-600"}`} />
              <span className="font-medium">
                {email.includes("@") ? "Tap to Take Selfie" : "Enter Email First"}
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4 px-4 bg-yellow-500/10 p-3 rounded-lg text-yellow-200/80">
            Note: Your selfie is only used momentarily for face matching and is never stored on our servers permanently.
          </p>
        </div>
      </div>
    </div>
  );
}
