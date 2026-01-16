"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformExample {
  id: string;
  title: string;
  category: string;
  beforeStyle: string;
  afterStyle: string;
}

const examples: TransformExample[] = [
  {
    id: "1",
    title: "Minimalist Watch",
    category: "Accessories",
    beforeStyle: "from-zinc-400 via-zinc-500 to-zinc-600",
    afterStyle: "from-amber-300 via-orange-400 to-rose-400",
  },
  {
    id: "2",
    title: "Leather Sneaker",
    category: "Footwear",
    beforeStyle: "from-stone-400 via-stone-500 to-stone-600",
    afterStyle: "from-cyan-300 via-blue-400 to-indigo-500",
  },
  {
    id: "3",
    title: "Perfume Bottle",
    category: "Beauty",
    beforeStyle: "from-slate-400 via-slate-500 to-slate-600",
    afterStyle: "from-purple-300 via-pink-400 to-rose-400",
  },
];

// Visual placeholder component
function PlaceholderImage({
  type,
  gradient,
  title
}: {
  type: "before" | "after";
  gradient: string;
  title: string;
}) {
  const Icon = type === "before" ? Camera : Sparkles;

  return (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center",
      `bg-gradient-to-br ${gradient}`
    )}>
      {/* Abstract product shape */}
      <div className={cn(
        "relative w-32 h-32 md:w-48 md:h-48 rounded-3xl",
        type === "before"
          ? "bg-white/20 backdrop-blur-sm shadow-lg"
          : "bg-white/40 backdrop-blur-md shadow-2xl"
      )}>
        <div className={cn(
          "absolute inset-4 rounded-2xl",
          type === "before"
            ? "bg-gradient-to-br from-white/10 to-white/5"
            : "bg-gradient-to-br from-white/30 to-white/10"
        )} />
        <Icon className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          type === "before" ? "w-8 h-8 text-white/40" : "w-10 h-10 text-white/70"
        )} />
      </div>

      {/* Product name hint */}
      <p className={cn(
        "mt-6 text-sm font-medium",
        type === "before" ? "text-white/50" : "text-white/80"
      )}>
        {title}
      </p>

      {/* Visual noise/grain effect for before */}
      {type === "before" && (
        <div className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      )}

      {/* Shine effect for after */}
      {type === "after" && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
      )}
    </div>
  );
}

export function BeforeAfterShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const activeExample = examples[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const nextExample = () => {
    setActiveIndex((prev) => (prev + 1) % examples.length);
    setSliderPosition(50);
  };

  const prevExample = () => {
    setActiveIndex((prev) => (prev - 1 + examples.length) % examples.length);
    setSliderPosition(50);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="pill mb-6 inline-flex">
            <ArrowLeftRight className="w-4 h-4" />
            Before & After
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            See the <span className="text-neon-subtle block sm:inline">transformation</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            From amateur snapshots to professional studio shots. Drag the slider to see the magic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Main Comparison Container */}
          <div
            className="relative aspect-[4/3] rounded-3xl overflow-hidden bento-card cursor-col-resize select-none"
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* Before Image */}
            <PlaceholderImage
              type="before"
              gradient={activeExample.beforeStyle}
              title={activeExample.title}
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium z-20">
              Before
            </div>

            {/* After Image (Clipped) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <PlaceholderImage
                type="after"
                gradient={activeExample.afterStyle}
                title={activeExample.title}
              />
              <div className="absolute top-6 right-6 px-4 py-2 bg-neon text-black rounded-full text-sm font-medium z-20">
                After
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white z-30"
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
              {/* Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-neon cursor-grab active:cursor-grabbing">
                <ArrowLeftRight className="w-5 h-5 text-neon" />
              </div>
            </div>
          </div>

          {/* Example Info & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 md:mt-8 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                {activeExample.category}
              </p>
              <h3 className="text-xl md:text-2xl font-bold">{activeExample.title}</h3>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-3 md:gap-4">
              {/* Dots */}
              <div className="flex gap-2">
                {examples.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveIndex(i);
                      setSliderPosition(50);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === activeIndex
                        ? "w-6 md:w-8 bg-neon"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <button
                  onClick={prevExample}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-border flex items-center justify-center hover:border-neon hover:text-neon transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={nextExample}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-border flex items-center justify-center hover:border-neon hover:text-neon transition-colors"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
