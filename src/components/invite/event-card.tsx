"use client";

import { MapPin, CalendarPlus, Clock } from "lucide-react";
import { SlideUp } from "@/components/ui/motion-wrappers";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  name: string;
  date: Date;
  locationName: string;
  locationUrl?: string | null;
  delay?: number;
}

export function EventCard({ name, date, locationName, locationUrl, delay = 0 }: EventCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(date));

  const handleAddToCalendar = () => {
    // Generate a simple Google Calendar URL
    const startDate = new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(date).getTime() + 4 * 60 * 60 * 1000) // Assumes 4 hour duration
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      name
    )}&dates=${startDate}/${endDate}&location=${encodeURIComponent(
      locationName
    )}&details=${encodeURIComponent("Join us for this special occasion!")}`;

    window.open(url, "_blank");
  };

  return (
    <SlideUp delay={delay} className="w-full max-w-md mx-auto">
      <div className="glass p-8 rounded-3xl border border-white/10 hover:bg-white/[0.05] transition-all group duration-300 flex flex-col items-center text-center">
        <h3 className="text-3xl font-serif text-brand mb-6">{name}</h3>
        
        <div className="space-y-4 w-full mb-8">
          <div className="flex items-center justify-center gap-3 text-white/80">
            <CalendarPlus className="w-5 h-5 text-brand/70" />
            <span className="font-light tracking-wide">{formattedDate}</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-white/80">
            <Clock className="w-5 h-5 text-brand/70" />
            <span className="font-light tracking-wide">{formattedTime} onwards</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-3 text-white/80">
              <MapPin className="w-5 h-5 text-brand/70 flex-shrink-0" />
              <span className="font-light">{locationName}</span>
            </div>
            {locationUrl && (
              <a 
                href={locationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand text-sm font-medium hover:underline mt-1"
              >
                View on Map
              </a>
            )}
          </div>
        </div>

        <Button 
          onClick={handleAddToCalendar}
          variant="outline" 
          className="w-full rounded-xl border-brand/30 hover:bg-brand/10 hover:text-brand transition-colors text-white/90"
        >
          Add to Calendar
        </Button>
      </div>
    </SlideUp>
  );
}
