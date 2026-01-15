"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Zap,
  Image as ImageIcon,
  Sparkles,
  Play,
  Star,
  ArrowUpRight,
  CircleCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Stats
const stats = [
  { value: "50K+", label: "Generated" },
  { value: "<30s", label: "Per Image" },
  { value: "98%", label: "Satisfaction" },
];

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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Background Mesh */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60 dark:opacity-100"
        style={{
          background: `
            radial-gradient(at 40% 20%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.06) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.08) 0px, transparent 50%)
          `
        }}
      />
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-8">
        <div className="section-container w-full relative z-10 py-12 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-12">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className="pill">
                <Sparkles className="w-4 h-4" />
                AI-Powered Generation
              </span>
            </motion.div>

            {/* Main Headline - Super Bold */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-[0.9] tracking-tight mb-8"
            >
              <span className="block">Product photos</span>
              <span className="block text-neon">reimagined.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-xl mb-12"
            >
              Transform any product image into studio-quality photography.
              No photographer. No studio. Just AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-16"
            >
              <Link href="/studio">
                <button className="btn-cta flex items-center gap-2 text-lg">
                  Start Creating
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="btn-ghost flex items-center gap-2 text-lg">
                  <Play className="w-5 h-5" />
                  See Examples
                </button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card p-0 text-left">
                  <div className="text-4xl md:text-5xl font-bold text-neon-subtle mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating badge - Desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="hidden xl:block shrink-0"
          >
            <div className="bento-card p-6 w-72">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-neon/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-neon" />
                </div>
                <div>
                  <div className="font-semibold">4.9/5 Rating</div>
                  <div className="text-sm text-muted-foreground">2,000+ reviews</div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {["SC", "MW", "ET", "JD", "AK"].map((initials) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-neon/20 border-2 border-background flex items-center justify-center text-xs text-neon">
                  +2k
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative py-32">
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
      <section className="relative py-32">
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
      <section className="relative py-32">
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

      {/* Final CTA */}
      <section className="relative py-32">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bento-card p-12 md:p-20 text-center relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon/20 rounded-full blur-[100px]" />

            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                Start creating <span className="text-neon">today</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
                Join thousands of creators using ZeroLens. Free to start.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Link href="/sign-up">
                  <button className="btn-cta flex items-center gap-2 text-lg glow-neon-pulse">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/marketplace">
                  <button className="btn-ghost flex items-center gap-2 text-lg">
                    Browse Prompts
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  No watermarks
                </span>
                <span className="flex items-center gap-2">
                  <CircleCheck className="w-4 h-4 text-neon" />
                  Commercial license
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
