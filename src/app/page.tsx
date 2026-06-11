import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Zap,
  ShieldCheck,
  UserSquare2,
  ChevronRight,
  ArrowRight,
  Cloud,
  Check
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="StudioSmart Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold tracking-tight">StudioSmart</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-brand transition-colors">Features</a>
            <a href="#pricing" className="hover:text-brand transition-colors">Pricing</a>
            <a href="#about" className="hover:text-brand transition-colors">About</a>
            <Link href="/digital-invite" className="hover:text-brand transition-colors">Digital Invites</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Login
            </Link>
            {/* <Button asChild className="brand-gradient hover:opacity-90 border-0 text-white rounded-xl px-5">
              <Link href="/register">Get Started</Link>
            </Button> */}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <div className="animate-reveal opacity-0" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" />
              Revolutionizing Photo Delivery
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1] animate-reveal opacity-0 brand-text-gradient" style={{ animationDelay: "0.2s" }}>
            The Future of Photo <br />Selection & Proofing
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed animate-reveal opacity-0" style={{ animationDelay: "0.3s" }}>
            Scale your photography business with at lightning speed. Upload massive galleries in seconds and let your clients choose their favorite shots beautifully.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-reveal opacity-0" style={{ animationDelay: "0.4s" }}>
            <Button asChild size="lg" className="brand-gradient border-0 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-brand/20 hover:scale-[1.02] transition-transform active:scale-95">
              <Link href="/register" className="flex items-center gap-2">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-white/10 transition-colors text-lg">
              <Link href="/login">View Demo</Link>
            </Button>
          </div>

          {/* Featured Image Mockup */}
          <div className="mt-24 w-full max-w-5xl px-4 animate-reveal opacity-0" style={{ animationDelay: "0.6s" }}>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-2 bg-white/5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[#1a1a1a] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo Overlay"
                    width={120}
                    height={120}
                    className="opacity-20 grayscale"
                  />
                </div>
                {/* Simulated UI UI */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">Client Preview Mode</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-brand" />}
              title="Instant Uploads"
              description="Our optimized pipeline handles large RAW previews in milliseconds, not minutes."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-brand" />}
              title="Anti-Screenshot"
              description="Advanced browser-level deterrents protect your photos from unauthorized downloads."
            />
            <FeatureCard
              icon={<UserSquare2 className="w-6 h-6 text-brand" />}
              title="Clean Client UX"
              description="Mobile-first, native-feeling photo selection interface that your clients will love."
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 text-center">
          <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-white/40 mb-16 max-w-xl mx-auto">No monthly subscriptions. Pay only for what you use.</p>

          <div className="max-w-md mx-auto glass p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl -mr-16 -mt-16 group-hover:bg-brand/20 transition-colors" />

            <div className="text-sm font-bold uppercase tracking-widest text-brand mb-6">Standard Album</div>
            <div className="flex items-end justify-center gap-1 mb-8">
              <span className="text-5xl font-extrabold tracking-tight">₹299</span>
              <span className="text-white/40 mb-2 font-medium">/ album</span>
            </div>

            <ul className="text-left space-y-4 mb-10">
              <li className="flex items-center gap-3 text-white/70">
                <Check className="w-5 h-5 text-brand" />
                <span>Unlimited High-Res Viewers</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Check className="w-5 h-5 text-brand" />
                <span>Anti-Screenshot Protection</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Check className="w-5 h-5 text-brand" />
                <span>6 Months Album Hosting</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Check className="w-5 h-5 text-brand" />
                <span>Direct Client Sync</span>
              </li>
            </ul>

            <Button asChild className="w-full h-14 brand-gradient rounded-2xl text-lg font-bold shadow-lg shadow-brand/10">
              <Link href="/register">Create Your Album</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-20 mt-32">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={24} height={24} className="opacity-70" />
              <span className="text-lg font-bold tracking-tight text-white/70">StudioSmart</span>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center text-sm text-white/40">
              <a href="mailto:studiosmart94@gmail.com" className="hover:text-brand transition-colors flex items-center gap-2">
                studiosmart94@gmail.com
              </a>
              <a href="tel:+917010997983" className="hover:text-brand transition-colors flex items-center gap-2">
                +91 7010997983
              </a>
              <div className="flex gap-8">
                <a href="#" className="hover:text-brand transition-colors">Privacy</a>
                <a href="#" className="hover:text-brand transition-colors">Terms</a>
              </div>
            </div>
            <div className="text-xs text-white/20 font-mono uppercase tracking-widest">
              © 2026 StudioSmart Platform
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all group hover:-translate-y-1 duration-300">
      <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 border border-brand/20 group-hover:brand-gradient transition-colors">
        <div className="group-hover:text-white transition-colors uppercase">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
