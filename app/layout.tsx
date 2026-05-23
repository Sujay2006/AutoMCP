import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "./marketing.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans-fallback" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "MCPBuilder.ai — The bridge between AI and your business",
  description:
    "Make your website AI-ready in 60 seconds. ChatGPT, Claude, and Siri can then search your products, take orders, and book appointments — automatically.",
  openGraph: {
    title: "MCPBuilder.ai — The bridge between AI and your business",
    description:
      "Make your website AI-ready in 60 seconds. ChatGPT, Claude, and Siri can then search your products, take orders, and book appointments — automatically.",
    url: APP_URL,
    siteName: "MCPBuilder.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPBuilder.ai — The bridge between AI and your business",
    description:
      "Make your website AI-ready in 60 seconds. ChatGPT, Claude, and Siri can then search your products, take orders, and book appointments — automatically.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        inter.variable,
        interTight.variable,
        jetbrainsMono.variable,
        geist.variable,
      )}
    >
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
