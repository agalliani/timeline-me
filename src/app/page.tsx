import { Suspense } from "react";
import { TimelineApp } from "@/components/timeline-app";
import { TimelineSkeleton } from "@/components/timeline-skeleton";

import { siteConfig } from "@/lib/config";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": siteConfig.name,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": siteConfig.description,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
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
            Visualize Your Professional Journey with Timeline Me
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
