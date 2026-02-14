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
  title: "Andrea Galliani | Interactive Timeline",
  description: "Explore the professional journey, milestones, and projects of Andrea Galliani through an interactive timeline. A visual history of software engineering experience.",
  keywords: ["timeline", "portfolio", "Andrea Galliani", "software engineer", "developer", "projects", "interactive history"],
  openGraph: {
    title: "Andrea Galliani | Interactive Timeline",
    description: "Explore the professional journey and milestones of Andrea Galliani.",
    url: "https://agalliani.github.io/timeline-me",
    siteName: "Andrea Galliani Timeline",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
