"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Wand2 } from "lucide-react";

export default function NewMagicEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const clientName = formData.get("clientName") as string;
    const clientPhone = formData.get("clientPhone") as string;

    if (!/^\d{10}$/.test(clientPhone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          clientName,
          clientPhone,
          isMagic: true // Explicitly marking this as a Magic Event
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success("Magic Event created successfully");
      // Redirect to the Magic details page instead of the regular Album page
      router.push(`/studio/magic/${data.album.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create Magic Event");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Wand2 className="w-8 h-8 text-blue-500" />
          Create Magic Event
        </h2>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Smith Wedding" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" name="clientName" required placeholder="e.g. John Doe" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Mobile Number</Label>
              <Input 
                id="clientPhone" 
                name="clientPhone" 
                type="tel" 
                required 
                placeholder="10-digit number (e.g. 9876543210)" 
                pattern="\d{10}"
                maxLength={10}
                disabled={isLoading} 
              />
            </div>

            <div className="bg-amber-500/10 p-4 rounded-md border border-amber-500/20 text-amber-600 text-sm flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-semibold uppercase tracking-wider text-[11px]">Payment Notice</p>
                <p>Creating this event will deduct <span className="font-bold">₹299</span> from your studio wallet balance.</p>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Creating..." : "Create Magic Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
