"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateStudioSettings } from "@/actions/studio.actions";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialData: {
    studioName: string;
    ownerName: string;
    email: string;
    phone: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateStudioSettings(formData);
      
      if (result?.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Handle validation errors
          const errors = Object.values(result.error).flat();
          toast.error(errors[0] || "Validation failed");
        }
        return;
      }

      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Studio Details</CardTitle>
          <CardDescription>
            Update your studio profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studioName">Studio Name</Label>
            <Input 
              id="studioName" 
              name="studioName" 
              defaultValue={initialData.studioName}
              placeholder="e.g. Moonlight Studios"
              required 
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input 
                id="ownerName" 
                name="ownerName" 
                defaultValue={initialData.ownerName}
                placeholder="Your full name"
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                defaultValue={initialData.phone}
                placeholder="+91 XXXXX XXXXX" 
                required 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email Address (Cannot be changed)</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              defaultValue={initialData.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
