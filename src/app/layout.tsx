import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timeline Me - Free LinkedIn Timeline Generator",
  description: "Visualize your professional journey in a stunning vertical timeline. Import from LinkedIn PDF or create manually. Privacy-focused, client-side only.",
  keywords: ["timeline maker", "linkedin visualizer", "career path", "resume timeline", "free timeline generator", "react timeline"],
  openGraph: {
    title: "Timeline Me - Free LinkedIn Timeline Generator",
    description: "Visualize your professional journey in a stunning vertical timeline. Import from LinkedIn PDF or create manually.",
    url: "https://agalliani.github.io/timeline-me",
    siteName: "Timeline Me",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
