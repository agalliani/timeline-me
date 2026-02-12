import { Suspense } from "react";
import { TimelineApp } from "@/components/timeline-app";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased py-10 px-4 sm:px-8">
      <main className="container mx-auto max-w-5xl">
        <Suspense fallback={<div className="text-center p-10">Loading Timeline...</div>}>
          <TimelineApp />
        </Suspense>
      </main>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Tailwind, and Shadcn/UI.</p>
        <p className="mt-2">
          Feedback? <a href="mailto:andrea.galliani.29@gmail.com" className="underline hover:text-foreground">Contact Me</a>
        </p>
      </footer>
    </div>
  );
}
