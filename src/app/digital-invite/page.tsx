import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui/motion-wrappers";
import { Button } from "@/components/ui/button";

const templates = [
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    description: "A moody, cinematic experience perfect for evening celebrations.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "floral-light",
    name: "Floral Light",
    description: "Bright, airy, and beautiful. Perfect for daytime or outdoor weddings.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    description: "Luxurious golden accents with deep rich tones for a grand affair.",
    image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
  }
];

export default function DigitalInviteGallery() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand/30 pb-32">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">StudioSmart</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/digital-invite/dashboard" className="text-sm font-medium text-brand hover:text-brand/80 transition-colors">
              My Invites
            </Link>
            <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Digital Invites
            </span>
          </FadeIn>
          <SlideUp delay={0.1}>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Craft Your Perfect <br />
              <span className="brand-text-gradient">Digital Invitation</span>
            </h1>
          </SlideUp>
          <SlideUp delay={0.2}>
            <p className="text-white/60 text-lg md:text-xl font-light">
              Choose from our curated collection of premium templates and customize them to match your special day.
            </p>
          </SlideUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, idx) => (
            <SlideUp key={template.id} delay={0.3 + idx * 0.1}>
              <div className="group relative rounded-[2rem] overflow-hidden glass border border-white/10 hover:border-brand/30 transition-colors duration-500 flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-serif mb-2">{template.name}</h3>
                  <p className="text-white/60 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {template.description}
                  </p>
                  
                  <Button asChild className="w-full brand-gradient text-white border-0 shadow-lg shadow-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <Link href={`/digital-invite/create?template=${template.id}`}>
                      Use Template <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SlideUp>
          ))}
        </div>
      </main>
    </div>
  );
}
