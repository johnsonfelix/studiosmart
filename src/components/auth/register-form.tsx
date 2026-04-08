"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { registerUser } from "@/app/(auth)/actions";
import { toast } from "react-hot-toast";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"STUDIO" | "CLIENT">("STUDIO");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("role", role);
    
    try {
      const result = await registerUser(formData);
      
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details below to get started.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={role === "STUDIO" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setRole("STUDIO")}
            >
              Studio Owner
            </Button>
            <Button
              type="button"
              variant={role === "CLIENT" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setRole("CLIENT")}
            >
              Client
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required disabled={isLoading} />
          </div>
          {role === "STUDIO" && (
            <div className="space-y-2">
              <Label htmlFor="studioName">Studio Name</Label>
              <Input id="studioName" name="studioName" required={role === "STUDIO"} disabled={isLoading} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
          <Button variant="link" className="w-full" type="button" onClick={() => router.push("/login")}>
            Already have an account? Log In
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
