"use client";

import { motion } from "framer-motion";
import { Store, Bookmark, ArrowRight, Sparkles, Zap, Smartphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ecosystemFeatures = [
    {
        title: "Prompt Marketplace",
        description: "Browse a curated collection of pro-grade prompts. From hyper-realistic studio lighting to creative outdoor scenes, find the foundation for your next masterpiece.",
        icon: Store,
        stats: "Curated Collection",
        cta: "Explore Marketplace",
        href: "/marketplace",
        color: "text-purple-500",
        bgGlow: "rgba(147, 51, 234, 0.1)",
        badges: ["Community", "Pro Presets"]
    },
    {
        title: "Prompt Pocket",
        description: "Stop losing your best work. Pocket is your dedicated space to organize and store every winning prompt, making it easy to replicate success across your entire catalog.",
        icon: Bookmark,
        stats: "Safe Storage",
        cta: "Go to Studio",
        href: "/studio",
        color: "text-blue-500",
        bgGlow: "rgba(59, 130, 246, 0.1)",
        badges: ["Organization", "Never Lose A Prompt"]
    }
];

export function EcosystemSection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.4) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }} />

            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 md:mb-24"
                >
                    <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                        The AI <span className="text-neon-subtle">Ecosystem</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        ZeroLens isn&apos;t just a generator. It&apos;s a complete workflow designed to turn ideas into professional assets at scale.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {ecosystemFeatures.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group bento-card p-8 md:p-12 relative overflow-hidden"
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${feature.bgGlow}, transparent 70%)` }} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/20 border border-border transition-colors group-hover:border-neon/30", feature.color)}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex gap-2">
                                        {feature.badges.map(badge => (
                                            <span key={badge} className="px-2.5 py-1 rounded-full bg-muted/30 text-[10px] uppercase tracking-wider font-bold text-muted-foreground border border-border/50">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground text-lg mb-8 flex-1 leading-relaxed">
                                    {feature.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-8 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-neon" />
                                        <span className="font-bold text-lg">{feature.stats}</span>
                                    </div>
                                    <Link href={feature.href}>
                                        <button className="flex items-center gap-2 font-semibold text-neon hover:gap-3 transition-all">
                                            {feature.cta}
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Workflow Teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 text-neon border border-neon/20 text-sm font-medium">
                        <Smartphone className="w-4 h-4" />
                        Integrated Experience
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
