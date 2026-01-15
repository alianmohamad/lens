
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ComparisonSliderProps {
    original: string;
    generated: string;
    className?: string;
}

export function ComparisonSlider({ original, generated, className }: ComparisonSliderProps) {
    const [sliderLocation, setSliderLocation] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderLocation(percentage);
    }, []);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Global event listeners for smooth dragging outside connection
    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // Touch support
    const handleTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderLocation(percentage);
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full aspect-square rounded-xl overflow-hidden select-none cursor-col-resize group", className)}
            onMouseMove={(e) => !isResizing && handleMouseMove(e)}
            onTouchMove={handleTouchMove}
        >
            {/* Background Image (Original/Before) */}
            <div className="absolute inset-0 w-full h-full bg-muted">
                <Image
                    src={original}
                    alt="Original"
                    fill
                    className="object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    Original
                </div>
            </div>

            {/* Foreground Image (Generated/After) - Clipped */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden bg-muted"
                style={{ clipPath: `inset(0 ${100 - sliderLocation}% 0 0)` }}
            >
                <Image
                    src={generated}
                    alt="Generated"
                    fill
                    className="object-contain"
                />
                <div className="absolute top-4 right-4 bg-primary/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                    Generated
                </div>
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderLocation}%` }}
            >
                {/* Handle */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95 text-primary"
                    onMouseDown={handleMouseDown}
                    onTouchStart={() => setIsResizing(true)}
                >
                    <GripVertical className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}
