"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Scan, Palette, Sparkles, Check, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Process steps
const processSteps = [
  {
    id: "analyze",
    icon: Scan,
    title: "Analyzing",
    description: "Detecting product boundaries & materials",
    duration: 1200,
  },
  {
    id: "understand",
    icon: Brain,
    title: "Understanding",
    description: "Identifying texture & optimal angles",
    duration: 1200,
  },
  {
    id: "enhance",
    icon: Palette,
    title: "Enhancing",
    description: "Applying studio lighting & color grading",
    duration: 1200,
  },
  {
    id: "generate",
    icon: Sparkles,
    title: "Generating",
    description: "Rendering final studio-quality image",
    duration: 1200,
  },
];

// Demo images
const demoImages = {
  before: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80",
  after: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&q=80",
};

// Binary Scanner Effect
function BinaryOverlay({ isActive }: { isActive: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(interval);
  }, [isActive]);

  const grid = useMemo(() => {
    const rows = 8;
    const cols = 12;
    const result: string[][] = [];
    for (let i = 0; i < rows; i++) {
      result[i] = [];
      for (let j = 0; j < cols; j++) {
        const seed = (tick + i * cols + j) * 9301 + 49297;
        result[i][j] = (seed % 233280) % 2 === 0 ? "1" : "0";
      }
    }
    return result;
  }, [tick]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="font-mono text-xs leading-relaxed tracking-[0.3em] text-center select-none opacity-60">
        {grid.map((row, i) => (
          <div key={i} className="flex justify-center gap-0.5">
            {row.map((char, j) => {
              const isHighlight = Math.random() > 0.92;
              return (
                <span
                  key={j}
                  className={cn(
                    "w-4 h-4 flex items-center justify-center transition-colors duration-75",
                    isHighlight ? "text-primary font-bold" : "text-primary/30"
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

export function AIProcessVisualizer() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isPlaying || currentStep < 0) return;

    if (currentStep >= processSteps.length) {
      setIsPlaying(false);
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, processSteps[currentStep]?.duration || 1000);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const startSimulation = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setIsComplete(false);
  };

  const resetSimulation = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsComplete(false);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Interactive Demo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            Watch AI Transform Your Photos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            See how our AI analyzes and enhances your product images in seconds
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left: Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="group relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-border bg-card shadow-xl">
              {/* Before Image */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-700",
                  isComplete ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}
              >
                <img
                  src={demoImages.before}
                  alt="Before transformation"
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    isPlaying && "blur-[2px] brightness-75"
                  )}
                />

                {/* Binary Scanner Overlay */}
                <BinaryOverlay isActive={isPlaying} />

                {/* Scanning Line */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_20px_4px] shadow-primary"
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </AnimatePresence>

                {/* Processing Status Overlay */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-background/90 to-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {currentStep >= 0 && currentStep < processSteps.length && (
                            (() => {
                              const Icon = processSteps[currentStep].icon;
                              return <Icon className="w-4 h-4 text-primary" />;
                            })()
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {currentStep >= 0 && currentStep < processSteps.length
                            ? processSteps[currentStep].title + "..."
                            : "Starting..."}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Before Label */}
                {!isPlaying && !isComplete && (
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs font-medium">
                    Before
                  </div>
                )}
              </div>

              {/* After Image */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-700",
                  isComplete ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
              >
                <img
                  src={demoImages.after}
                  alt="After transformation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Studio Quality
                </div>
              </div>

              {/* Start Button Overlay */}
              {!isPlaying && !isComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer" onClick={startSimulation}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl transition-all"
                  >
                    <Play className="w-5 h-5" />
                    Start Demo
                  </motion.button>
                </div>
              )}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-4 right-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetSimulation}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm text-foreground rounded-full text-sm font-medium hover:bg-background transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Replay
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between h-full"
          >
            <div className="flex flex-col gap-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = isPlaying && currentStep === index;
                const isCompleted = currentStep > index || isComplete;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                      isActive
                        ? "bg-primary/10 border-primary"
                        : isCompleted
                          ? "bg-card border-border"
                          : "bg-transparent border-border/50 opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("font-semibold text-base", isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="pt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">
                  {isComplete ? "100%" : currentStep >= 0 ? `${Math.round(((currentStep + 1) / processSteps.length) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: isComplete ? "100%" : currentStep >= 0 ? `${((currentStep + 1) / processSteps.length) * 100}%` : "0%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div >
    </section >
  );
}
