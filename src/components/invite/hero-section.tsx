"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui/motion-wrappers";
import Image from "next/image";

interface HeroSectionProps {
  groomName: string;
  brideName: string;
  weddingDate: Date | null;
  bgMusicUrl?: string | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
}

export function HeroSection({
  groomName,
  brideName,
  weddingDate,
  bgMusicUrl,
  heroImageUrl,
  heroVideoUrl,
}: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formattedDate = weddingDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(weddingDate))
    : "";

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        {heroVideoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="Couple"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <FadeIn delay={0.2}>
          <p className="text-white/80 uppercase tracking-[0.3em] text-sm md:text-base mb-6">
            We are getting married
          </p>
        </FadeIn>

        <SlideUp delay={0.4}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
            {brideName} <br className="md:hidden" />
            <span className="text-brand text-4xl md:text-6xl mx-4 font-light">&amp;</span>
            <br className="md:hidden" /> {groomName}
          </h1>
        </SlideUp>

        {formattedDate && (
          <FadeIn delay={0.6}>
            <p className="text-white/90 text-lg md:text-xl font-light tracking-wide border-t border-white/20 pt-6 mt-2">
              {formattedDate}
            </p>
          </FadeIn>
        )}
      </div>

      {/* Audio Element & Toggle */}
      {bgMusicUrl && (
        <>
          <audio ref={audioRef} loop src={bgMusicUrl} />
          <button
            onClick={toggleMusic}
            className="absolute bottom-8 right-8 z-30 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
            aria-label="Toggle background music"
          >
            {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </>
      )}

      {/* Scroll Indicator */}
      <FadeIn delay={1.2} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
      </FadeIn>
    </section>
  );
}
