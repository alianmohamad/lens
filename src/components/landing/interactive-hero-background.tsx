"use client";

import { useCallback, useEffect, useState, useRef } from "react";

interface MousePosition {
    x: number;
    y: number;
}

export function InteractiveHeroBackground() {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
    const [time, setTime] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timeAnimationRef = useRef<number | null>(null);

    // Slow ambient animation
    useEffect(() => {
        const animate = () => {
            setTime(t => t + 0.005);
            timeAnimationRef.current = requestAnimationFrame(animate);
        };
        timeAnimationRef.current = requestAnimationFrame(animate);
        return () => {
            if (timeAnimationRef.current) {
                cancelAnimationFrame(timeAnimationRef.current);
            }
        };
    }, []);

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

    // Combine cursor position with slow ambient movement
    const ambientX = Math.sin(time) * 15;
    const ambientY = Math.cos(time * 0.7) * 15;
    const gradientX = 50 + (mousePosition.x - 0.5) * 100 + ambientX;
    const gradientY = 50 + (mousePosition.y - 0.5) * 100 + ambientY;

    // Ambient-only gradient position (no cursor effect)
    const ambientOnlyX = 50 + ambientX;
    const ambientOnlyY = 50 + ambientY;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
        >
            {/* Mobile: Ambient-animated chevrons (no cursor effect) */}
            <svg
                className="absolute inset-0 w-full h-full sm:hidden"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id="mobileGradient"
                        x1={`${100 - ambientOnlyX}%`}
                        y1={`${100 - ambientOnlyY}%`}
                        x2={`${ambientOnlyX}%`}
                        y2={`${ambientOnlyY}%`}
                    >
                        <stop offset="0%" stopColor="rgba(147, 51, 234, 0)" />
                        <stop offset="25%" stopColor="rgba(147, 51, 234, 0.5)" />
                        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                        <stop offset="75%" stopColor="rgba(251, 191, 136, 0.4)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>
                    <linearGradient
                        id="mobileGradient2"
                        x1={`${ambientOnlyX}%`}
                        y1={`${100 - ambientOnlyY}%`}
                        x2={`${100 - ambientOnlyX}%`}
                        y2={`${ambientOnlyY}%`}
                    >
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                        <stop offset="40%" stopColor="rgba(59, 130, 246, 0.35)" />
                        <stop offset="70%" stopColor="rgba(147, 51, 234, 0.25)" />
                        <stop offset="100%" stopColor="rgba(251, 191, 136, 0)" />
                    </linearGradient>
                </defs>

                {/* Top-left corner chevrons */}
                <path d="M 0,20 L 10,10 L 0,0" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L 17.5,17.5 L 0,0" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,50 L 25,25 L 0,0" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Top-right corner chevrons */}
                <path d="M 100,20 L 90,10 L 100,0" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,35 L 82.5,17.5 L 100,0" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,50 L 75,25 L 100,0" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom-left corner chevrons */}
                <path d="M 0,80 L 10,90 L 0,100" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,65 L 17.5,82.5 L 0,100" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,50 L 25,75 L 0,100" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom-right corner chevrons */}
                <path d="M 100,80 L 90,90 L 100,100" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,65 L 82.5,82.5 L 100,100" fill="none" stroke="url(#mobileGradient2)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,50 L 75,75 L 100,100" fill="none" stroke="url(#mobileGradient)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Desktop: Full animated chevrons (cursor + ambient) */}
            <svg
                className="absolute inset-0 w-full h-full hidden sm:block"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
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

                {/* Top-left corner chevrons */}
                <path d="M 0,20 L 10,10 L 0,0" fill="none" stroke="url(#heroGradient)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,35 L 17.5,17.5 L 0,0" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,50 L 25,25 L 0,0" fill="none" stroke="url(#heroGradient)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Top-right corner chevrons */}
                <path d="M 100,20 L 90,10 L 100,0" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,35 L 82.5,17.5 L 100,0" fill="none" stroke="url(#heroGradient)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,50 L 75,25 L 100,0" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom-left corner chevrons */}
                <path d="M 0,80 L 10,90 L 0,100" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,65 L 17.5,82.5 L 0,100" fill="none" stroke="url(#heroGradient)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 0,50 L 25,75 L 0,100" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Bottom-right corner chevrons */}
                <path d="M 100,80 L 90,90 L 100,100" fill="none" stroke="url(#heroGradient)" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,65 L 82.5,82.5 L 100,100" fill="none" stroke="url(#heroGradient2)" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 100,50 L 75,75 L 100,100" fill="none" stroke="url(#heroGradient)" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Ambient glow following cursor - desktop only */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full pointer-events-none hidden sm:block"
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
