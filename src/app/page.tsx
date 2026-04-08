import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold tracking-tight">StudioSmart</h1>
        <div className="space-x-4">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 max-w-3xl leading-tight">
          Modern Photo Selection & Proofing Platform
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Upload massive galleries in seconds. Let your clients choose their favorite photos beautifully, fast, and securely. You only upload the selected high-resolution shots afterwards.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/register">Start for free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">View Demo Studio</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
