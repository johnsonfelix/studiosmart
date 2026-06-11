"use client";

import { useState } from "react";
import { SlideUp } from "@/components/ui/motion-wrappers";
import { Button } from "@/components/ui/button";

interface RsvpFormProps {
  guestId: string;
  inviteId: string;
  guestName: string;
}

export function RsvpForm({ guestId, inviteId, guestName }: RsvpFormProps) {
  const [step, setStep] = useState(1);
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [mealPreference, setMealPreference] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAttending === null) return;
    
    setIsSubmitting(true);
    
    try {
      // Placeholder for actual API submission to backend
      // await fetch("/api/rsvp", {
      //   method: "POST",
      //   body: JSON.stringify({ guestId, inviteId, isAttending, mealPreference, message })
      // });
      
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit RSVP", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SlideUp className="w-full max-w-lg mx-auto text-center">
        <div className="glass p-10 rounded-3xl border border-brand/20">
          <div className="w-16 h-16 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-serif text-white mb-4">Thank You!</h3>
          <p className="text-white/70 font-light">
            {isAttending 
              ? "We can't wait to celebrate with you!" 
              : "We will miss you, thank you for letting us know."}
          </p>
        </div>
      </SlideUp>
    );
  }

  return (
    <SlideUp className="w-full max-w-lg mx-auto">
      <div className="glass p-8 md:p-10 rounded-3xl border border-white/10">
        <h3 className="text-3xl font-serif text-center mb-8">RSVP</h3>
        <p className="text-center text-white/70 mb-8">
          Kindly respond by the 15th of next month.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-xl text-center mb-6">Hi {guestName}, will you be attending?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttending(true);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAttending === true 
                      ? "border-brand bg-brand/10 text-brand" 
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Joyfully Accept
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAttending(false);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAttending === false 
                      ? "border-brand bg-brand/10 text-brand" 
                      : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Regretfully Decline
                </button>
              </div>
            </div>
          )}

          {step === 2 && isAttending === true && (
            <SlideUp className="space-y-6">
              <div>
                <label className="block text-white/80 mb-3 text-sm">Meal Preference</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all appearance-none"
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an option</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-3 text-sm">Leave a message for the couple (Optional)</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all resize-none h-32"
                  placeholder="Share your wishes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </SlideUp>
          )}

          {step === 2 && isAttending === false && (
            <SlideUp className="space-y-6">
              <div>
                <label className="block text-white/80 mb-3 text-sm">Leave a message for the couple (Optional)</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand/50 focus:ring-1 focus:ring-brand/50 outline-none transition-all resize-none h-32"
                  placeholder="Share your regrets and wishes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </SlideUp>
          )}

          {step === 2 && (
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                className="w-1/3 bg-transparent border-white/20 hover:bg-white/10 text-white"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-2/3 brand-gradient border-0 text-white shadow-lg shadow-brand/20"
              >
                {isSubmitting ? "Submitting..." : "Send RSVP"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </SlideUp>
  );
}
