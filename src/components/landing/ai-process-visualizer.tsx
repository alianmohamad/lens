"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Scan, Palette, Sparkles, Check, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

// Process steps
const processSteps = [
  {
    id: "analyze",
    icon: Scan,
    title: "Analyzing Image",
    description: "Detecting product boundaries, materials & lighting",
    duration: 2000,
  },
  {
    id: "understand",
    icon: Brain,
    title: "Understanding Context",
    description: "Identifying product type, texture & optimal angles",
    duration: 2000,
  },
  {
    id: "enhance",
    icon: Palette,
    title: "Applying Enhancements",
    description: "Studio lighting, shadow correction & color grading",
    duration: 2000,
  },
  {
    id: "generate",
    icon: Sparkles,
    title: "Generating Output",
    description: "Rendering final studio-quality photograph",
    duration: 2000,
  },
];

// Fixed binary grid overlay - no overflow issues
function BinaryOverlay({ isActive }: { isActive: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTick(t => t + 1), 150);
    return () => clearInterval(interval);
  }, [isActive]);

  // Generate stable grid based on tick
  const grid = useMemo(() => {
    const rows = 12;
    const cols = 16;
    const result: string[][] = [];
    for (let i = 0; i < rows; i++) {
      result[i] = [];
      for (let j = 0; j < cols; j++) {
        // Use tick to create deterministic randomness
        const seed = (tick + i * cols + j) % 7;
        result[i][j] = seed > 3 ? "1" : "0";
      }
    }
    return result;
  }, [tick]);

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center overflow-hidden pointer-events-none p-4">
      <div className="font-mono text-xs md:text-sm leading-relaxed">
        {grid.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 md:gap-2">
            {row.map((char, j) => {
              const isHighlight = ((tick + i + j) % 5) === 0;
              return (
                <span
                  key={j}
                  className={cn(
                    "transition-colors duration-150 w-3 text-center",
                    isHighlight ? "text-neon" : "text-neon/30"
                  )}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Product placeholder visual
function ProductVisual({ isComplete }: { isComplete: boolean }) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center transition-all duration-1000",
      isComplete
        ? "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500"
        : "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-800"
    )}>
      {/* Product shape */}
      <div className={cn(
        "relative w-32 h-32 md:w-48 md:h-48 rounded-3xl transition-all duration-1000",
        isComplete
          ? "bg-white/40 backdrop-blur-md shadow-2xl scale-105"
          : "bg-white/20 backdrop-blur-sm shadow-lg"
      )}>
        <div className={cn(
          "absolute inset-3 md:inset-4 rounded-2xl transition-all duration-1000",
          isComplete
            ? "bg-gradient-to-br from-white/40 to-white/20"
            : "bg-gradient-to-br from-white/10 to-white/5"
        )}>
          <Cpu className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000",
            isComplete ? "w-10 h-10 md:w-12 md:h-12 text-white/80" : "w-8 h-8 md:w-10 md:h-10 text-white/40"
          )} />
        </div>
      </div>

      {/* Grain effect when not complete */}
      {!isComplete && (
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      )}

      {/* Shine effect when complete */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
      )}
    </div>
  );
}

export function AIProcessVisualizer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const advanceStep = useCallback(() => {
    if (currentStep < processSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setTimeout(() => {
        setCurrentStep(0);
        setIsPlaying(false);
      }, 2000);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(advanceStep, processSteps[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, advanceStep]);

  const startAnimation = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const isComplete = hasStarted && !isPlaying;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="pill mb-6 inline-flex">
            <Brain className="w-4 h-4" />
            AI Processing
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            How the <span className="text-neon-subtle">magic</span> happens
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch our AI analyze, understand, and transform your product photos in real-time.
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          {/* Left Side - Image Preview */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden bento-card">
              {/* Product Visual */}
              <ProductVisual isComplete={isComplete} />

              {/* Binary Overlay - Active during processing */}
              <AnimatePresence>
                {isPlaying && currentStep < 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 overflow-hidden"
                  >
                    <BinaryOverlay isActive={isPlaying} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan Line Effect */}
              <AnimatePresence>
                {isPlaying && currentStep === 0 && (
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 top-0 h-1 bg-neon z-20"
                    style={{ boxShadow: "0 0 20px #05B6D4, 0 0 40px #05B6D4" }}
                  />
                )}
              </AnimatePresence>

              {/* Grid Overlay */}
              <AnimatePresence>
                {isPlaying && currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(5, 182, 212, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(5, 182, 212, 0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px'
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Processing Indicator */}
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-30">
                <div className="bg-black/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <span className="text-xs md:text-sm text-white/70">Processing</span>
                    <span className="text-xs md:text-sm font-mono text-neon">
                      {isPlaying
                        ? `${Math.round(((currentStep + 1) / processSteps.length) * 100)}%`
                        : hasStarted
                        ? "100%"
                        : "0%"}
                    </span>
                  </div>
                  <div className="h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: isPlaying
                          ? `${((currentStep + 1) / processSteps.length) * 100}%`
                          : hasStarted
                          ? "100%"
                          : "0%",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Corner Brackets */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 border-neon/50 z-20" />
              <div className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 border-neon/50 z-20" />
              <div className="absolute bottom-20 md:bottom-24 left-3 md:left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-neon/50 z-20" />
              <div className="absolute bottom-20 md:bottom-24 right-3 md:right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-neon/50 z-20" />
            </div>
          </div>

          {/* Right Side - Steps */}
          <div className="space-y-3 md:space-y-4 order-1 lg:order-2">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index && isPlaying;
              const isStepCompleted = currentStep > index || (hasStarted && !isPlaying);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-500",
                    isActive
                      ? "bg-neon/10 border-neon"
                      : isStepCompleted
                      ? "bg-card/50 border-neon/30"
                      : "bg-card/30 border-border"
                  )}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Step Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                        isActive
                          ? "bg-neon text-black"
                          : isStepCompleted
                          ? "bg-neon/20 text-neon"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isStepCompleted && !isActive ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "text-base md:text-lg font-semibold mb-0.5 md:mb-1 transition-colors",
                          isActive && "text-neon"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-neon animate-pulse"
                        />
                      )}
                    </div>
                  </div>

                  {/* Progress bar for active step */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon/20 rounded-b-xl md:rounded-b-2xl overflow-hidden"
                    >
                      <motion.div
                        className="h-full bg-neon"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: step.duration / 1000, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Start Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={startAnimation}
              disabled={isPlaying}
              className={cn(
                "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base",
                isPlaying
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "btn-cta"
              )}
            >
              {isPlaying
                ? "Processing..."
                : hasStarted
                ? "Run Again"
                : "See It In Action"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
