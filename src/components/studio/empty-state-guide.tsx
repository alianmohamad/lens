"use client";

import { useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateGuideProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmptyStateGuide({ onUpload }: EmptyStateGuideProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const steps = [
        {
            icon: <Upload className="h-5 w-5 text-blue-400" />,
            title: "Upload Product",
            desc: "Start with your product image",
            bg: "bg-blue-500/10 border-blue-500/20",
        },
        {
            icon: <Sparkles className="h-5 w-5 text-purple-400" />,
            title: "Describe Scene",
            desc: "Tell AI how to place it",
            bg: "bg-purple-500/10 border-purple-500/20",
        },
        {
            icon: <ImageIcon className="h-5 w-5 text-green-400" />,
            title: "Generate",
            desc: "Get amazing variations",
            bg: "bg-green-500/10 border-green-500/20",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4"
        >
            <div className="w-full max-w-2xl bg-white/5 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6">
                        <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                        Welcome to ZeroLens Studio
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-lg">
                        Turn your product photos into professional marketing assets in seconds.
                    </p>
                </div>

                {/* Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full">
                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            <div className={`h-full p-5 rounded-2xl border ${step.bg} transition-all hover:scale-105 duration-300`}>
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5`}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{step.title}</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Connector Arrow (Desktop only) */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                                    <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div>
                    <Button
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-14 px-8 text-lg rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-105 transition-all shadow-xl font-semibold dark:bg-white dark:text-black"
                    >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Product Image
                    </Button>
                    <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                        Supports PNG, JPG, WEBP up to 5MB
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onUpload}
                />
            </div>
        </motion.div>
    );
}
