"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordCyclerProps {
    words: string[];
    className?: string;
    interval?: number;
}

export function TypeWriter({
    words,
    className = "",
    interval = 3000,
}: WordCyclerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % words.length);
        }, interval);

        return () => clearInterval(timer);
    }, [words.length, interval]);

    return (
        <span className="inline-block relative">
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentIndex}
                    className={`inline-block ${className}`}
                    initial={{
                        opacity: 0,
                        scale: 0.92,
                        filter: "blur(10px)"
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)"
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1.08,
                        filter: "blur(10px)"
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    {words[currentIndex]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
