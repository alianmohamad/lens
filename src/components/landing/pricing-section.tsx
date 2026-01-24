"use client";

import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "forever",
        description: "Perfect for trying out the magic.",
        features: [
            "5 free generations per month",
            "Standard resolution (1024x1024)",
            "Personal license",
            "Access to community prompts",
            "Basic lighting controls"
        ],
        cta: "Start Creating",
        href: "/sign-up",
        popular: false,
        icon: Zap
    },
    {
        name: "Pro",
        price: "$29",
        period: "/month",
        description: "For creators & small brands.",
        features: [
            "500 generations per month",
            "High-Resolution generations",
            "Commercial license",
            "Priority processing",
            "Advanced lighting studio",
            "Batch processing (10 images)",
            "No watermarks"
        ],
        cta: "Get Pro Access",
        href: "/sign-up?plan=pro",
        popular: true,
        icon: Sparkles
    },
    {
        name: "Agency",
        price: "Custom",
        period: "",
        description: "For high-volume needs.",
        features: [
            "Unlimited generations",
            "API Access",
            "Custom brand models",
            "Dedicated support",
            "Team collaboration",
            "SSO / Enterprise security"
        ],
        cta: "Contact Sales",
        href: "/contact",
        popular: false,
        icon: Building2
    }
];

export function PricingSection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.4) 0%, transparent 70%)' }} />

            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 md:mb-24"
                >
                    <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
                        Simple, transparent <span className="text-neon-subtle">pricing</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Unlock studio-quality product photography for a fraction of the cost of a traditional photoshoot.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "relative flex flex-col p-8 rounded-3xl transition-all duration-300 group",
                                plan.popular
                                    ? "glass-neon border-gradient-premium shadow-2xl scale-105 z-10"
                                    : "glass border border-border/50 hover:border-primary/30 hover:scale-[1.02]"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-neon text-white text-sm font-semibold shadow-lg shadow-neon/30 z-20">
                                    Most Popular
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        plan.popular ? "bg-neon text-white" : "bg-muted text-foreground"
                                    )}>
                                        <plan.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
                                        {plan.price}
                                    </span>
                                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                                    <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                                </div>

                                <div className="space-y-4 flex-1 mb-8">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className={cn(
                                                "w-4 h-4 mt-0.5 shrink-0",
                                                plan.popular ? "text-neon" : "text-muted-foreground"
                                            )} />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href={plan.href} className="w-full">
                                    <button className={cn(
                                        "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300",
                                        plan.popular
                                            ? "btn-cta shadow-lg shadow-neon/20 hover:shadow-neon/40"
                                            : "bg-muted/50 hover:bg-muted text-foreground"
                                    )}>
                                        {plan.cta}
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
