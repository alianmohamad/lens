"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Zap,
  Image as ImageIcon,
  Sparkles,
  Play,
  Star,
  ArrowUpRight,
  Gift,
  Clock,
  CircleCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  BeforeAfterShowcase,
  AIProcessVisualizer,
  ResultsGallery,
  InteractiveHeroBackground,
  PricingSection,
  ComparisonSection,
  FaqSection,
  EcosystemSection
} from "@/components/landing";
import { TypeWriter } from "@/components/ui/typewriter";


// Dynamic words for typewriter effect
const heroWords = ["reimagined.", "transformed.", "elevated.", "perfected."];

// Testimonials
const testimonials = [
  {
    quote: "Cut photo costs by 85%. Quality rivals studio shots.",
    author: "Sarah Chen",
    role: "E-commerce Director",
  },
  {
    quote: "Our conversion rate jumped 40% after switching.",
    author: "Marcus Webb",
    role: "DTC Founder",
  },
  {
    quote: "Made $12k selling prompts. Platform is incredible.",
    author: "Elena Torres",
    role: "Prompt Engineer",
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Centered */}
      <section className="relative h-dvh flex items-center justify-center pt-0 md:pt-8 overflow-hidden -mt-16">
        {/* Interactive Hero Background */}
        <InteractiveHeroBackground />
        <div className="mx-auto max-w-6xl w-full px-2 sm:px-6 relative z-10 pt-4 md:pt-8 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 md:mb-4 flex justify-center"
          >
            <span className="pill text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              AI-Powered Generation
            </span>
          </motion.div>

          {/* Main Headline - Centered with TypeWriter */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-[1.1] tracking-tight mb-2 md:mb-4 mx-auto max-w-5xl"
          >
            <span className="block">Product photos</span>
            <span className="block pb-6 sm:pb-4">
              <TypeWriter words={heroWords} interval={3000} className="hero-gradient-text" />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-5 md:mb-12"
          >
            Transform any product image into studio-quality photography.
            No photographer. No studio. Just AI.
          </motion.p>

          {/* CTA Buttons - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 md:mb-12"
          >
            <Link href="/studio">
              <button className="btn-cta flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg">
                Try It Free
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="btn-ghost flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg">
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                See How It Works
              </button>
            </Link>
          </motion.div>

          {/* Honest value proposition instead of fake stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <Gift className="w-4 h-4 text-neon" />
              <span>Free credits</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <Zap className="w-4 h-4 text-neon" />
              <span>Easy start</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 text-neon" />
              <span>30s results</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Before & After Showcase */}
      <BeforeAfterShowcase />

      {/* Comparison Section - Why Us vs Them */}
      <ComparisonSection />

      {/* AI Process Visualizer */}
      <AIProcessVisualizer />

      {/* Bento Grid Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Cohesive gradient accent - top right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(251, 146, 60, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)' }} />
        {/* Cohesive gradient accent - bottom left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.06) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)' }} />
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">
              Why <span className="text-neon-subtle">ZeroLens</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl">
              Everything you need to create professional product photography at scale.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Feature Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bento-card p-8 md:p-12 group"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center group-hover:bg-neon/20 transition-colors">
                  <Sparkles className="w-7 h-7 text-neon" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-neon transition-colors" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                AI That Understands Products
              </h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Our AI doesn&apos;t just edit — it understands context, materials, and lighting to create photos that sell.
              </p>
            </motion.div>

            {/* Speed Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bento-card p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 group-hover:bg-neon/20 transition-colors">
                <Zap className="w-6 h-6 text-neon" />
              </div>
              <div className="text-5xl font-bold text-neon mb-2">&lt;30s</div>
              <p className="text-muted-foreground">Per generation</p>
            </motion.div>

            {/* Prompts Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bento-card p-8 group"
            >
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 group-hover:bg-neon/20 transition-colors">
                <ImageIcon className="w-6 h-6 text-neon" />
              </div>
              <div className="text-5xl font-bold text-neon mb-2">2,500+</div>
              <p className="text-muted-foreground">Pro prompts available</p>
            </motion.div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bento-card p-8 md:p-12 bg-linear-to-br from-neon/10 to-transparent group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Ready to transform your photos?
                  </h3>
                  <p className="text-muted-foreground">Start free. No credit card required.</p>
                </div>
                <Link href="/studio">
                  <button className="btn-cta flex items-center gap-2 whitespace-nowrap">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="relative py-32 overflow-hidden">
        {/* Cohesive gradient accent - center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.05) 0%, rgba(139, 92, 246, 0.03) 30%, rgba(6, 182, 212, 0.02) 50%, transparent 70%)' }} />
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">
              How it <span className="text-neon-subtle">works</span>
            </h2>
            <p className="text-xl text-muted-foreground">Three steps. Under a minute.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Upload", desc: "Drop your product image. Any angle, any lighting." },
              { num: "02", title: "Choose", desc: "Pick a prompt from our marketplace or write your own." },
              { num: "03", title: "Generate", desc: "Get studio-quality photos in seconds. Download & use." },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[8rem] font-bold text-muted/50 absolute -top-8 -left-4 select-none">
                  {step.num}
                </div>
                <div className="relative pt-16">
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-32 overflow-hidden">
        {/* Cohesive gradient accent */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.06) 0%, rgba(251, 146, 60, 0.03) 40%, transparent 70%)' }} />
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">
              Loved by <span className="text-neon-subtle">creators</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-neon text-neon" />
                  ))}
                </div>
                <p className="text-lg mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Gallery */}
      <ResultsGallery />

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Final CTA */}
      <section className="relative py-16 md:py-32">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bento-card p-8 md:p-12 lg:p-20 text-center relative overflow-hidden"
          >
            {/* Glow effect - warm/cool gradient blend */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]" style={{ background: 'linear-gradient(90deg, rgba(251, 146, 60, 0.15) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(6, 182, 212, 0.15) 100%)' }} />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6">
                Start creating <span className="text-neon">today</span>
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-lg mx-auto">
                Join thousands of creators using ZeroLens. Free to start.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-6 md:mb-10">
                <Link href="/sign-up">
                  <button className="btn-cta flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg w-full sm:w-auto glow-neon-pulse">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/marketplace">
                  <button className="btn-ghost flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg w-full sm:w-auto">
                    Browse Prompts
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  <span>Free to start</span>
                </span>
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  <span>No watermarks</span>
                </span>
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  <span>Commercial use</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
