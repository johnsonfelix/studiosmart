import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="StudioSmart Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="text-lg font-bold tracking-tight">StudioSmart</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={20} height={20} className="opacity-70" />
            <span className="text-sm font-bold tracking-tight text-white/50">StudioSmart</span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-white/30">
            <Link href="/privacy-policy" className="hover:text-brand transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand transition-colors">Terms & Conditions</Link>
            <Link href="/refund-policy" className="hover:text-brand transition-colors">Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-brand transition-colors">Shipping & Delivery</Link>
            <Link href="/contact" className="hover:text-brand transition-colors">Contact Us</Link>
          </div>
          <div className="text-xs text-white/20 font-mono uppercase tracking-widest">
            © 2026 StudioSmart
          </div>
        </div>
      </footer>
    </div>
  );
}
