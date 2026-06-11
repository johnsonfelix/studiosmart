"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Copy, Sparkles, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInviteAction } from "../actions";
import Link from "next/link";
import Image from "next/image";

function CreateInvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("template") || "elegant-dark";

  const [formData, setFormData] = useState({
    groomName: "Groom",
    brideName: "Bride",
    weddingDate: "",
    storyText: "We first met in college and our journey has been magical...",
    heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInviteId, setCreatedInviteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (isPaid: boolean) => {
    setIsSubmitting(true);
    
    // Simulate Mock Payment delay if paying
    if (isPaid) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const result = await createInviteAction({
      ...formData,
      templateId,
      weddingDate: formData.weddingDate ? new Date(formData.weddingDate) : undefined,
      isPaid,
    });
    
    if (result.success && result.inviteId) {
      if (isPaid) {
        setCreatedInviteId(result.inviteId);
      } else {
        router.push("/digital-invite/dashboard");
      }
    } else {
      alert(result.error || "Error saving invite.");
    }
    setIsSubmitting(false);
  };

  const shareUrl = typeof window !== "undefined" && createdInviteId ? `${window.location.origin}/invite/${createdInviteId}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Modern Template Previews (Just a simplified visual representation for the right panel)
  const renderPreview = () => (
    <div className={`relative w-full h-[800px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center p-8 transition-all ${
      templateId === "elegant-dark" ? "bg-[#0a0a0a] text-white" : 
      templateId === "floral-light" ? "bg-[#faf9f5] text-slate-800" : 
      "bg-amber-900 text-amber-100"
    }`}>
      {/* Background Image Preview */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={formData.heroImageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070"}
          alt="Preview"
          fill
          className={`object-cover ${templateId === "elegant-dark" ? "opacity-50 grayscale" : "opacity-30"}`}
        />
      </div>

      <div className="relative z-10 w-full">
        <p className="uppercase tracking-[0.3em] text-xs mb-4 opacity-70">We are getting married</p>
        <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
          {formData.brideName} <br />
          <span className="text-3xl opacity-50">&amp;</span> <br />
          {formData.groomName}
        </h1>
        {formData.weddingDate && (
          <p className="text-lg font-light tracking-wide border-t border-current pt-4 mx-auto max-w-[200px]">
            {new Date(formData.weddingDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {formData.storyText && (
        <div className="relative z-10 mt-16 max-w-sm mx-auto p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-current/10">
          <h3 className="font-serif text-xl mb-4">Our Story</h3>
          <p className="text-sm font-light leading-relaxed opacity-80">{formData.storyText}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/digital-invite" className="text-lg font-bold tracking-tight">StudioSmart <span className="text-white/40 font-normal">| Creator</span></Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/digital-invite">Cancel</Link></Button>
            <Button 
              onClick={() => handleSave(false)} 
              disabled={isSubmitting || !!createdInviteId} 
              variant="secondary"
              className="border-white/10"
            >
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSave(true)} 
              disabled={isSubmitting || !!createdInviteId} 
              className="brand-gradient border-0 text-white"
            >
              {isSubmitting ? "Processing..." : <><CreditCard className="w-4 h-4 mr-2" /> Pay ₹99 & Publish</>}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Form Panel */}
        <div className="space-y-8 max-w-xl">
          <div>
            <h2 className="text-3xl font-bold mb-2">Design Your Invite</h2>
            <p className="text-white/50">Customizing the <span className="text-brand font-medium">{templateId.replace("-", " ")}</span> template.</p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Bride's Name</label>
                <input 
                  type="text" 
                  name="brideName"
                  value={formData.brideName}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-brand/50 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Groom's Name</label>
                <input 
                  type="text" 
                  name="groomName"
                  value={formData.groomName}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-brand/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Wedding Date</label>
              <input 
                type="date" 
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-brand/50 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Hero Image URL</label>
              <input 
                type="text" 
                name="heroImageUrl"
                value={formData.heroImageUrl}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-brand/50 outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Our Story</label>
              <textarea 
                name="storyText"
                value={formData.storyText}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-brand/50 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="relative flex items-center justify-center bg-white/5 rounded-[2.5rem] p-8 border border-white/10 min-h-[800px] sticky top-24">
          <div className="absolute top-4 right-6 px-3 py-1 bg-black/50 backdrop-blur border border-white/10 rounded-full text-xs tracking-widest text-white/50 uppercase z-20">Live Preview</div>
          
          <div className="w-full max-w-sm mx-auto shadow-2xl scale-95 md:scale-100 origin-top transform-gpu">
            {renderPreview()}
          </div>
        </div>
      </main>

      {/* Success Modal Overlay */}
      {createdInviteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-8 rounded-[2rem] border border-white/20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Invite Created!</h3>
            <p className="text-white/60 mb-8">Your digital invite is live and ready to be shared with your guests.</p>
            
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 p-2 rounded-xl mb-6">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="w-full bg-transparent outline-none px-2 text-sm text-white/80" 
              />
              <Button onClick={copyToClipboard} size="sm" variant="secondary" className="flex-shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <Button asChild className="w-full brand-gradient border-0 text-white font-medium shadow-lg shadow-brand/20">
              <Link href={`/invite/${createdInviteId}`} target="_blank">View Live Invite</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2 text-white/50 hover:text-white">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    }>
      <CreateInvitePageContent />
    </Suspense>
  );
}
