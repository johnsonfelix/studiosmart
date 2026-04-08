"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { loginUser } from "@/app/(auth)/actions";
import { toast } from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await loginUser(formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Logged in successfully");
        // Handled by NextAuth redirect, but just in case
        router.refresh();
      }
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your email and password to login to your account.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button variant="link" className="w-full" type="button" onClick={() => router.push("/register")}>
            Don't have an account? Sign Up
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
