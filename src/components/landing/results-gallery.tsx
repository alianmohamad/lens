"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  style: string;
  rating: number;
  downloads: string;
  gradient: string;
}

const galleryItemsRow1: GalleryItem[] = [
  {
    id: "1",
    title: "Luxury Minimalist",
    category: "Premium",
    style: "Clean studio with soft shadows",
    rating: 4.9,
    downloads: "2.3k",
    gradient: "from-amber-500 via-orange-600 to-red-600",
  },
  {
    id: "2",
    title: "Neon Cyberpunk",
    category: "Creative",
    style: "Futuristic neon lighting",
    rating: 4.8,
    downloads: "1.8k",
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
  },
  {
    id: "3",
    title: "Natural Elegance",
    category: "Lifestyle",
    style: "Botanical garden setting",
    rating: 4.9,
    downloads: "3.1k",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
  },
  {
    id: "4",
    title: "Dark Moody",
    category: "Editorial",
    style: "Dramatic shadows & contrast",
    rating: 4.7,
    downloads: "1.5k",
    gradient: "from-slate-600 via-zinc-700 to-neutral-800",
  },
  {
    id: "5",
    title: "Pastel Dreams",
    category: "Aesthetic",
    style: "Soft pastel backgrounds",
    rating: 4.8,
    downloads: "2.7k",
    gradient: "from-pink-400 via-rose-400 to-fuchsia-500",
  },
];

const galleryItemsRow2: GalleryItem[] = [
  {
    id: "6",
    title: "Golden Hour",
    category: "Warm",
    style: "Sunset warm tones",
    rating: 4.9,
    downloads: "2.1k",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
  },
  {
    id: "7",
    title: "Arctic Frost",
    category: "Cool",
    style: "Icy blue minimalism",
    rating: 4.8,
    downloads: "1.9k",
    gradient: "from-sky-300 via-blue-400 to-indigo-500",
  },
  {
    id: "8",
    title: "Vintage Film",
    category: "Retro",
    style: "Classic film grain look",
    rating: 4.7,
    downloads: "2.4k",
    gradient: "from-amber-600 via-yellow-700 to-orange-800",
  },
  {
    id: "9",
    title: "Studio White",
    category: "Clean",
    style: "Pure white backdrop",
    rating: 4.9,
    downloads: "4.2k",
    gradient: "from-gray-200 via-slate-300 to-zinc-400",
  },
  {
    id: "10",
    title: "Neon Nights",
    category: "Vibrant",
    style: "Bold neon gradients",
    rating: 4.8,
    downloads: "1.6k",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
  },
];

// Showcase card
function ShowcaseCard({ item }: { item: GalleryItem }) {
  return (
    <div className="group relative shrink-0 w-[260px] md:w-[300px]">
      <div className="relative rounded-2xl overflow-hidden aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.02]">
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-700",
          item.gradient
        )} />

        {/* Ambient light overlay */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)
            `
          }}
        />

        {/* Product mockup */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-full max-w-[65%] aspect-square group-hover:-translate-y-2 transition-transform duration-500">
            {/* Main product shape */}
            <div className="absolute inset-0 rounded-2xl bg-white/25 backdrop-blur-sm shadow-2xl" />
            <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-white/35 to-white/15" />

            {/* Decorative floating elements */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-white/30 backdrop-blur-md shadow-lg group-hover:-translate-y-1 transition-transform duration-700 delay-75" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-lg bg-white/25 backdrop-blur-sm shadow-md group-hover:-translate-y-2 transition-transform duration-700 delay-150" />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
            {item.category}
          </span>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-xs font-medium">{item.rating}</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <h3 className="text-white font-bold text-base mb-0.5">{item.title}</h3>
          <p className="text-white/70 text-xs mb-2">{item.style}</p>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Download className="w-3 h-3" />
            <span>{item.downloads} uses</span>
          </div>
        </div>

        {/* Hover shine */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/10 to-white/5 pointer-events-none" />
      </div>
    </div>
  );
}

// Auto-scrolling marquee row using CSS animation
function MarqueeRow({
  items,
  direction = "left",
  duration = "60s"
}: {
  items: GalleryItem[];
  direction?: "left" | "right";
  duration?: string;
}) {
  // Triple the items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-2">
      <div
        className={cn(
          "flex gap-4 md:gap-6 w-max",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
        style={{
          animationDuration: duration,
        }}
      >
        {duplicatedItems.map((item, index) => (
          <ShowcaseCard key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function ResultsGallery() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Section Header */}
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="pill mb-6 inline-flex">
            <Sparkles className="w-4 h-4" />
            Style Gallery
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            Stunning <span className="text-neon-subtle">results</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our most popular styles crafted by professional photographers.
          </p>
        </motion.div>
      </div>

      {/* Full-width Marquee Gallery */}
      <div className="relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 lg:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 lg:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Marquee Rows */}
        <div className="space-y-4 md:space-y-6">
          <MarqueeRow items={galleryItemsRow1} direction="left" duration="50s" />
          <MarqueeRow items={galleryItemsRow2} direction="right" duration="55s" />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-16"
        >
          <Link href="/marketplace">
            <button className="btn-cta inline-flex items-center gap-2">
              Explore All Styles
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            2,500+ professional prompts available
          </p>
        </motion.div>
      </div>
    </section>
  );
}
