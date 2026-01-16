"use client";

import { useCallback, useEffect, useState, useRef } from "react";

interface MousePosition {
    x: number;
    y: number;
}

export function InteractiveHeroBackground() {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        if (e.clientY > rect.bottom + 200) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            setMousePosition({ x, y });
        });
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [handleMouseMove]);

    // Cursor-based gradient position
    const gradientX = 50 + (mousePosition.x - 0.5) * 100;
    const gradientY = 50 + (mousePosition.y - 0.5) * 100;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
        >
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Multi-color gradient - purple, blue, orange, white */}
                    <linearGradient
                        id="heroGradient"
                        x1={`${100 - gradientX}%`}
                        y1={`${100 - gradientY}%`}
                        x2={`${gradientX}%`}
                        y2={`${gradientY}%`}
                    >
                        <stop offset="0%" stopColor="rgba(147, 51, 234, 0)" />
                        <stop offset="25%" stopColor="rgba(147, 51, 234, 0.5)" />
                        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                        <stop offset="75%" stopColor="rgba(251, 191, 136, 0.4)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>

                    <linearGradient
                        id="heroGradient2"
                        x1={`${gradientX}%`}
                        y1={`${100 - gradientY}%`}
                        x2={`${100 - gradientX}%`}
                        y2={`${gradientY}%`}
                    >
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                        <stop offset="40%" stopColor="rgba(59, 130, 246, 0.35)" />
                        <stop offset="70%" stopColor="rgba(147, 51, 234, 0.25)" />
                        <stop offset="100%" stopColor="rgba(251, 191, 136, 0)" />
                    </linearGradient>
                </defs>

                {/* Top-left corner arc */}
                <path
                    d="M 0,0 Q 15,25 0,40"
                    fill="none"
                    stroke="url(#heroGradient)"
                    strokeWidth="0.2"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />
                <path
                    d="M 0,0 Q 25,15 40,0"
                    fill="none"
                    stroke="url(#heroGradient2)"
                    strokeWidth="0.15"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />

                {/* Top-right corner arc */}
                <path
                    d="M 100,0 Q 85,25 100,40"
                    fill="none"
                    stroke="url(#heroGradient2)"
                    strokeWidth="0.2"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />
                <path
                    d="M 100,0 Q 75,15 60,0"
                    fill="none"
                    stroke="url(#heroGradient)"
                    strokeWidth="0.15"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />

                {/* Bottom-left corner arc */}
                <path
                    d="M 0,100 Q 15,75 0,60"
                    fill="none"
                    stroke="url(#heroGradient2)"
                    strokeWidth="0.2"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />
                <path
                    d="M 0,100 Q 25,85 40,100"
                    fill="none"
                    stroke="url(#heroGradient)"
                    strokeWidth="0.15"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />

                {/* Bottom-right corner arc */}
                <path
                    d="M 100,100 Q 85,75 100,60"
                    fill="none"
                    stroke="url(#heroGradient)"
                    strokeWidth="0.2"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />
                <path
                    d="M 100,100 Q 75,85 60,100"
                    fill="none"
                    stroke="url(#heroGradient2)"
                    strokeWidth="0.15"
                    style={{ transition: "stroke 0.3s ease-out" }}
                />
            </svg>

            {/* Ambient glow following cursor */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                    left: `${mousePosition.x * 100}%`,
                    top: `${mousePosition.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)`,
                    transition: "left 0.4s ease-out, top 0.4s ease-out",
                }}
            />
        </div>
    );
}
