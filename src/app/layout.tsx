import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartSidebar } from "@/components/layout/cart-sidebar";

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
      </body>
    </html>
  );
}
