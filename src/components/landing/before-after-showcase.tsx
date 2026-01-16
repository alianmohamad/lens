"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TransformExample {
  id: string;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
}

const examples: TransformExample[] = [
  {
    id: "1",
    title: "Premium Sneakers",
    category: "Footwear",
    beforeImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "2",
    title: "Luxury Headphones",
    category: "Electronics",
    beforeImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "3",
    title: "Designer Watch",
    category: "Accessories",
    beforeImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop&q=80",
    afterImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&q=80",
  },
];

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
            {/* Before Image (full background) */}
            <div className="absolute inset-0">
              <Image
                src={activeExample.beforeImage}
                alt={`${activeExample.title} - Before`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                unoptimized
              />
              {/* Before Label - clips with the before image */}
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Before
              </div>
            </div>

            {/* After Image (revealed from right) */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <Image
                src={activeExample.afterImage}
                alt={`${activeExample.title} - After`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                unoptimized
              />
              {/* After Label - clips with the after image */}
              <div className="absolute top-6 right-6 px-4 py-2 bg-neon text-black rounded-full text-sm font-medium">
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
