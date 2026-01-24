"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Camera, Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

type ComparisonType = "ai" | "traditional";

const comparisonData = {
    ai: {
        competitor: {
            title: "Generic AI (Gemini/GPT)",
            icon: BrainCircuit,
            description: "Great for text, random for products.",
            points: [
                { text: "Inconsistent branding & style", type: "negative" },
                { text: "Hallucinates product details", type: "negative" },
                { text: "Complex 'prompt engineering' needed", type: "negative" },
                { text: "Generic lighting logic", type: "negative" },
                { text: "Random composition every time", type: "negative" }
            ]
        },
        zerolens: {
            title: "ZeroLens AI Studio",
            icon: Sparkles,
            description: "Built strictly for product photography.",
            points: [
                { text: "Brand-consistent visual engine", type: "positive" },
                { text: "Preserves exact product text/details", type: "positive" },
                { text: "One-click professional presets", type: "positive" },
                { text: "Studio-grade lighting simulation", type: "positive" },
                { text: "Commercially safe & royalty-free", type: "positive" }
            ]
        }
    },
    traditional: {
        competitor: {
            title: "Traditional Studio",
            icon: Camera,
            description: "High quality, but slow and expensive.",
            points: [
                { text: "$5,000+ per photoshoot", type: "negative" },
                { text: "2-3 weeks turnaround time", type: "negative" },
                { text: "Shipping logistics & insurance", type: "negative" },
                { text: "Limited set locations/props", type: "negative" },
                { text: "Pay per image/retouching", type: "negative" }
            ]
        },
        zerolens: {
            title: "ZeroLens AI Studio",
            icon: Sparkles,
            description: "Pro quality, instant results.",
            points: [
                { text: "$29/month flat rate", type: "positive" },
                { text: "30 seconds per image", type: "positive" },
                { text: "No shipping required", type: "positive" },
                { text: "Unlimited digital scenes", type: "positive" },
                { text: "Unlimited generations", type: "positive" }
            ]
        }
    }
};

export function ComparisonSection() {
    const [activeTab, setActiveTab] = useState<ComparisonType>("ai");

    const activeData = comparisonData[activeTab];

    return (
        <section className="relative py-32 overflow-hidden">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                        Why use <span className="text-neon-subtle">ZeroLens</span>?
                    </h2>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="inline-flex p-1 rounded-full bg-muted/50 border border-border">
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === "ai"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Vs Generic AI
                            </button>
                            <button
                                onClick={() => setActiveTab("traditional")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    activeTab === "traditional"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Vs Photographer
                            </button>
                        </div>
                    </div>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto h-14">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="block"
                            >
                                {activeTab === "ai"
                                    ? "Stop gambling with generic models. Get consistent, professional results."
                                    : "Skip the logistics, costs, and waiting. Get studio quality instantly."
                                }
                            </motion.span>
                        </AnimatePresence>
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`competitor-${activeTab}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bento-card p-8 md:p-10 border-border/50 bg-muted/20"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                    <activeData.competitor.icon className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold text-muted-foreground">{activeData.competitor.title}</h3>
                            </div>
                            <p className="text-muted-foreground mb-8 text-lg">
                                {activeData.competitor.description}
                            </p>

                            <div className="space-y-4">
                                {activeData.competitor.points.map((point: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                            <X className="w-4 h-4 text-destructive" />
                                        </div>
                                        <span className="text-muted-foreground text-lg">{point.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            key={`zerolens-${activeTab}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bento-card p-8 md:p-10 border-neon/30 bg-card/60 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-neon/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-neon flex items-center justify-center shadow-lg shadow-neon/30">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">{activeData.zerolens.title}</h3>
                                </div>
                                <p className="text-neon mb-8 text-lg font-medium">
                                    {activeData.zerolens.description}
                                </p>

                                <div className="space-y-4">
                                    {activeData.zerolens.points.map((point: any, i: number) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-neon/20 flex items-center justify-center shrink-0">
                                                <Check className="w-4 h-4 text-neon" />
                                            </div>
                                            <span className="text-foreground text-lg">{point.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
