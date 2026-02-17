import { Suspense } from "react";
import { TimelineApp } from "@/components/timeline-app";
import { TimelineSkeleton } from "@/components/timeline-skeleton";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Andrea Galliani",
      "jobTitle": "Software Engineer",
      "url": "https://agalliani.github.io/timeline-me",
      "sameAs": [
        "https://github.com/agalliani",
        // Add LinkedIn or other profiles here if known, otherwise keep generic
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased py-10 px-4 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-5xl">
        <section className="mb-12 text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Your Professional Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A chronological visualization for your career, projects, and achievements.
            Explore the milestones that define your path.
          </p>
        </section>

        <Suspense fallback={<TimelineSkeleton />}>
          <TimelineApp />
        </Suspense>
      </main>

      <footer className="mt-20 text-center text-sm text-muted-foreground pb-8">
        <p>Built with Next.js, Tailwind, and Shadcn/UI.</p>
        <p className="mt-2">
          Feedback? <a href="mailto:andrea.galliani.29@gmail.com" className="underline hover:text-foreground">Contact Me</a>
        </p>
      </footer>
    </div>
  );
}
