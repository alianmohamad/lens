import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartSidebar } from "@/components/layout/cart-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PromptLens - AI Product Photography Marketplace",
    template: "%s | PromptLens",
  },
  description:
    "The premium marketplace for AI-powered product photography prompts. Transform your e-commerce images with expert-crafted prompts.",
  keywords: [
    "AI",
    "product photography",
    "prompts",
    "e-commerce",
    "marketplace",
    "image generation",
    "Imagen 3",
  ],
  authors: [{ name: "PromptLens" }],
  creator: "PromptLens",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptlens.ai",
    siteName: "PromptLens",
    title: "PromptLens - AI Product Photography Marketplace",
    description:
      "The premium marketplace for AI-powered product photography prompts. Transform your e-commerce images with expert-crafted prompts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptLens - AI Product Photography Marketplace",
    description:
      "The premium marketplace for AI-powered product photography prompts. Transform your e-commerce images with expert-crafted prompts.",
    creator: "@promptlens",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <CartSidebar />
        </Providers>
      </body>
    </html>
  );
}
