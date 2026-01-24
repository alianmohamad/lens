"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
    items: {
        id: string;
        title: string;
        content: string;
    }[];
    className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className="bento-card overflow-hidden transition-all duration-300 border border-border/50 hover:border-primary/20"
                >
                    <button
                        onClick={() => toggle(item.id)}
                        className="w-full flex items-center justify-between p-6 text-left"
                    >
                        <span className="text-lg font-medium text-foreground">
                            {item.title}
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                openId === item.id ? "rotate-180 text-primary" : ""
                            )}
                        />
                    </button>
                    <AnimatePresence initial={false}>
                        {openId === item.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                    {item.content}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

import { useState } from "react";
