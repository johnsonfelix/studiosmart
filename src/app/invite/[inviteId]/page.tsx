import { HeroSection } from "@/components/invite/hero-section";
import { EventCard } from "@/components/invite/event-card";
import { RsvpForm } from "@/components/invite/rsvp-form";
import { FadeIn, SlideUp } from "@/components/ui/motion-wrappers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function InvitePage({ params }: { params: Promise<{ inviteId: string }> }) {
  const { inviteId } = await params;
  const invite = await prisma.digitalInvite.findUnique({
    where: { id: inviteId },
    include: { events: true }
  });

  if (!invite) {
    notFound();
  }

  return (
    <div className={`min-h-screen text-white selection:bg-brand/30 ${
      invite.templateId === "elegant-dark" ? "bg-[#0a0a0a]" :
      invite.templateId === "floral-light" ? "bg-[#faf9f5] text-slate-800" :
      "bg-amber-900 text-amber-100"
    }`}>
      <HeroSection 
        groomName={invite.groomName}
        brideName={invite.brideName}
        weddingDate={invite.weddingDate}
        heroImageUrl={invite.heroImageUrl}
        heroVideoUrl={invite.heroVideoUrl}
        bgMusicUrl={invite.bgMusicUrl}
      />

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Story Section */}
        {invite.storyText && (
          <section className="text-center max-w-3xl mx-auto px-4">
            <FadeIn>
              <h2 className="text-3xl font-serif text-brand mb-8">Our Story</h2>
              <p className="text-lg leading-relaxed font-light opacity-70">
                {invite.storyText}
              </p>
            </FadeIn>
          </section>
        )}

        {/* Cinematic Gallery Placeholder */}
        <section className="w-full">
          <FadeIn>
            <h2 className="text-3xl font-serif text-center text-brand mb-12">Gallery</h2>
          </FadeIn>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {/* Replace these with actual mapped S3 images */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SlideUp key={i} delay={i * 0.1} className="break-inside-avoid">
                <div className="relative rounded-2xl overflow-hidden group">
                  <Image 
                    src={`https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800&h=${800 + i * 100}`}
                    alt="Gallery Image"
                    width={800}
                    height={800 + i * 100}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </SlideUp>
            ))}
          </div>
        </section>

        {/* Itinerary Section */}
        {invite.events && invite.events.length > 0 && (
          <section className="w-full max-w-5xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-serif text-center text-brand mb-12">The Itinerary</h2>
            </FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {invite.events.map((event, idx) => (
                <EventCard 
                  key={event.id}
                  name={event.name}
                  date={event.date}
                  locationName={event.locationName}
                  locationUrl={event.locationUrl}
                  delay={idx * 0.2}
                />
              ))}
            </div>
          </section>
        )}

        {/* RSVP Section */}
        <section className="py-12">
          {/* Note: In a real scenario you would have a guest enter their name, or if it's an open invite, it's an open RSVP form */}
          <RsvpForm 
            guestId="open-guest"
            inviteId={invite.id}
            guestName="Guest"
          />
        </section>
      </main>

      <footer className="text-center py-10 border-t border-white/5 opacity-30 text-sm font-light">
        <p>Made with ❤️ by StudioSmart</p>
      </footer>
    </div>
  );
}
