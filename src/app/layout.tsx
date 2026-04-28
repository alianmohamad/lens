import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartSidebar } from "@/components/layout/cart-sidebar";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZeroLens - AI Product Photography Marketplace",
    template: "%s | ZeroLens",
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
  authors: [{ name: "ZeroLens" }],
  creator: "ZeroLens",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zerolens.ai",
    siteName: "ZeroLens",
    title: "ZeroLens - AI Product Photography Marketplace",
    description:
      "The premium marketplace for AI-powered product photography prompts. Transform your e-commerce images with expert-crafted prompts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroLens - AI Product Photography Marketplace",
    description:
      "The premium marketplace for AI-powered product photography prompts. Transform your e-commerce images with expert-crafted prompts.",
    creator: "@zerolens",
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
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <CartSidebar />
        </Providers>
        <Script
          src="http://localhost:3000/api/sdk/contentchat.js"
          strategy="afterInteractive"
          data-cc-sdk
          data-site-id="679f9806-b3b5-44b0-8e08-9213cd64a870"
          data-api-key="827c5c765f9d49fa5b9df9e1:e1e1a9db8670d608bcbc4e4cc926f4a7:fdbaf55aec947c93f387e480a6db7cab3d1d3137a0c7b1969786d4afbe1beb5020ac96bd9a9594c07efc1af5d2c71d478d1cb0"
        />

      </body>
    </html>
  );
}
