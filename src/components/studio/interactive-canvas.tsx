"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Download,
    Copy,
    Share2,
    Maximize2,
    SplitSquareHorizontal,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Search,
    X,
    Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComparisonSlider } from "@/components/studio/comparison-slider";
import { cn } from "@/lib/utils";

interface InteractiveCanvasProps {
    originalImage: string | null;
    generatedImage: string | null;
    onDownload: () => void;
    onCopy: () => void;
    showComparison: boolean;
    setShowComparison: (show: boolean) => void;
}

export function InteractiveCanvas({
    originalImage,
    generatedImage,
    onDownload,
    onCopy,
    showComparison,
    setShowComparison,
}: InteractiveCanvasProps) {
    // Zoom & Pan state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Spotlight/Magnifier state
    const [showSpotlight, setShowSpotlight] = useState(false);
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Reveal animation state
    const [hasRevealed, setHasRevealed] = useState(false);

    // Keyboard shortcuts hint
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Container dimensions for spotlight calculation
    const [containerSize, setContainerSize] = useState({ width: 500, height: 500 });

    // Track if mounted for portal
    const [isMounted, setIsMounted] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    // 3D Tilt effect values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
    const scale = useSpring(1, { stiffness: 200, damping: 20 });

    // Reveal animation on new generated image
    useEffect(() => {
        if (generatedImage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasRevealed(false);
            const timer = setTimeout(() => setHasRevealed(true), 100);
            return () => clearTimeout(timer);
        }
    }, [generatedImage]);

    // Update container size on mount and resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    // Set mounted state for portal
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!generatedImage) return;

            switch (e.key) {
                case " ": // Space - toggle comparison
                    e.preventDefault();
                    if (originalImage) setShowComparison(!showComparison);
                    break;
                case "+":
                case "=": // Zoom in
                    e.preventDefault();
                    setZoom(z => Math.min(z + 0.25, 4));
                    break;
                case "-": // Zoom out
                    e.preventDefault();
                    setZoom(z => Math.max(z - 0.25, 0.5));
                    break;
                case "0": // Reset zoom
                    e.preventDefault();
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                    break;
                case "f": // Fullscreen
                    e.preventDefault();
                    setIsFullscreen(!isFullscreen);
                    break;
                case "d": // Download
                    e.preventDefault();
                    onDownload();
                    break;
                case "c": // Copy
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        onCopy();
                    }
                    break;
                case "m": // Magnifier toggle
                    e.preventDefault();
                    setShowSpotlight(!showSpotlight);
                    break;
                case "?": // Show shortcuts
                    e.preventDefault();
                    setShowShortcuts(!showShortcuts);
                    break;
                case "Escape":
                    setIsFullscreen(false);
                    setShowShortcuts(false);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [generatedImage, originalImage, showComparison, setShowComparison, isFullscreen, showSpotlight, onDownload, onCopy]);

    // 3D Tilt handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || isDragging || zoom > 1) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(x);
        mouseY.set(y);

        // Update spotlight position
        if (showSpotlight) {
            setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            setMousePos({ x: x + 0.5, y: y + 0.5 });
        }
    }, [mouseX, mouseY, isDragging, zoom, showSpotlight]);

    const handleMouseEnter = () => {
        if (zoom <= 1) scale.set(1.02);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        scale.set(1);
    };

    // Zoom with scroll
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (showComparison) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.max(0.5, Math.min(4, z + delta)));
    }, [showComparison]);

    // Pan handlers
    const handlePanStart = useCallback((e: React.MouseEvent) => {
        if (zoom <= 1 || showComparison) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [zoom, pan, showComparison]);

    const handlePanMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    }, [isDragging, dragStart]);

    const handlePanEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch gesture handlers for pinch-to-zoom
    const [touchStart, setTouchStart] = useState<{ distance: number; zoom: number } | null>(null);

    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            setTouchStart({
                distance: getTouchDistance(e.touches),
                zoom: zoom,
            });
        }
    }, [zoom]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStart) {
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / touchStart.distance;
            setZoom(Math.max(0.5, Math.min(4, touchStart.zoom * scale)));
        }
    }, [touchStart]);

    const handleTouchEnd = useCallback(() => {
        setTouchStart(null);
    }, []);

    // Reset view
    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const canvasContent = (
        <motion.div
            ref={containerRef}
            className={cn(
                "relative w-full h-full rounded-2xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-xl ring-1 ring-white/10",
                zoom > 1 && !showComparison ? "cursor-grab" : "cursor-default",
                isDragging && "cursor-grabbing"
            )}
            style={{
                rotateX: zoom <= 1 ? rotateX : 0,
                rotateY: zoom <= 1 ? rotateY : 0,
                scale: zoom <= 1 ? scale : 1,
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => { handleMouseLeave(); handlePanEnd(); }}
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            onMouseMoveCapture={handlePanMove}
            onMouseUp={handlePanEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Reveal Animation Overlay */}
            <AnimatePresence>
                {!hasRevealed && generatedImage && (
                    <motion.div
                        className="absolute inset-0 z-30 bg-background"
                        initial={{ clipPath: "inset(0 0 0 0)" }}
                        animate={{ clipPath: "inset(0 100% 0 0)" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                    />
                )}
            </AnimatePresence>

            {/* Shimmer Reveal Effect */}
            <AnimatePresence>
                {!hasRevealed && generatedImage && (
                    <motion.div
                        className="absolute inset-0 z-40 pointer-events-none"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Image Content */}
            <div
                ref={imageRef}
                className="w-full h-full flex items-center justify-center transition-transform duration-100"
                style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                }}
            >
                {originalImage && showComparison ? (
                    <ComparisonSlider original={originalImage} generated={generatedImage || ""} />
                ) : (
                    <img
                        src={generatedImage || ""}
                        alt="Generated Result"
                        className="w-full h-full object-contain select-none"
                        draggable={false}
                    />
                )}
            </div>

            {/* Spotlight/Magnifier Overlay */}
            <AnimatePresence>
                {showSpotlight && !showComparison && generatedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute pointer-events-none z-20"
                        style={{
                            left: spotlightPos.x - 75,
                            top: spotlightPos.y - 75,
                            width: 150,
                            height: 150,
                        }}
                    >
                        <div className="w-full h-full rounded-full border-2 border-white/50 shadow-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${generatedImage})`,
                                    backgroundSize: `${containerSize.width * 3}px ${containerSize.height * 3}px`,
                                    backgroundPosition: `${-mousePos.x * containerSize.width * 3 + 75}px ${-mousePos.y * containerSize.height * 3 + 75}px`,
                                }}
                            />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-primary/50 pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zoom Indicator */}
            <AnimatePresence>
                {zoom !== 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-xs font-mono text-muted-foreground"
                    >
                        {Math.round(zoom * 100)}%
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Magnifier Active Indicator */}
            <AnimatePresence>
                {showSpotlight && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-xs font-medium text-primary flex items-center gap-1.5"
                    >
                        <Search className="h-3 w-3" /> Magnifier Active
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // Fullscreen content rendered via portal
    const fullscreenContent = isFullscreen && isMounted ? createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl p-8 flex flex-col items-center justify-center"
            style={{ maxHeight: "100vh" }}
        >
            {canvasContent}

            {/* Floating Toolbar */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute bottom-12 flex items-center gap-1.5 p-1.5 rounded-full bg-background/90 backdrop-blur-xl border border-border shadow-2xl ring-1 ring-white/5"
            >
                {/* Primary Actions */}
                <Button size="sm" onClick={onDownload} className="rounded-full px-5 btn-premium h-10 font-medium shadow-lg shadow-primary/20">
                    <Download className="h-4 w-4 mr-2" /> Download
                </Button>

                <div className="w-px h-4 bg-border/50 mx-1" />

                {/* View Controls */}
                {originalImage && (
                    <Button
                        variant={showComparison ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setShowComparison(!showComparison)}
                        className={cn("rounded-full h-10 w-10 transition-colors", showComparison ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                        title="Toggle Comparison (Space)"
                    >
                        <SplitSquareHorizontal className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    variant={showSpotlight ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setShowSpotlight(!showSpotlight)}
                    className={cn("rounded-full h-10 w-10 transition-colors", showSpotlight ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                    title="Magnifier (M)"
                >
                    <Search className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-border/50 mx-1" />

                {/* Zoom Controls */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                    className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                    title="Zoom Out (-)"
                    disabled={showComparison}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                    className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                    title="Zoom In (+)"
                    disabled={showComparison}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                {zoom !== 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetView}
                        className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                        title="Reset View (0)"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}

                <div className="w-px h-4 bg-border/50 mx-1" />

                {/* Secondary Actions */}
                <Button variant="ghost" size="icon" onClick={onCopy} className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy (Ctrl+C)">
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Share">
                    <Share2 className="h-4 w-4" />
                </Button>
            </motion.div>

            {/* Close Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-6 right-6"
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFullscreen(false)}
                    className="rounded-full h-12 w-12 bg-background/80 backdrop-blur-md"
                >
                    <X className="h-5 w-5" />
                </Button>
            </motion.div>
        </motion.div>,
        document.body
    ) : null;

    return (
        <>
            {/* Normal Canvas (when not fullscreen) */}
            {!isFullscreen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                    style={{ maxHeight: "calc(100vh - 160px)" }}
                >
                    {canvasContent}

                    {/* Floating Toolbar */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="absolute bottom-8 flex items-center gap-1.5 p-1.5 rounded-full bg-background/90 backdrop-blur-xl border border-border shadow-2xl ring-1 ring-white/5"
                    >
                        {/* Primary Actions */}
                        <Button size="sm" onClick={onDownload} className="rounded-full px-5 btn-premium h-10 font-medium shadow-lg shadow-primary/20">
                            <Download className="h-4 w-4 mr-2" /> Download
                        </Button>

                        <div className="w-px h-4 bg-border/50 mx-1" />

                        {/* View Controls */}
                        {originalImage && (
                            <Button
                                variant={showComparison ? "secondary" : "ghost"}
                                size="icon"
                                onClick={() => setShowComparison(!showComparison)}
                                className={cn("rounded-full h-10 w-10 transition-colors", showComparison ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                                title="Toggle Comparison (Space)"
                            >
                                <SplitSquareHorizontal className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant={showSpotlight ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setShowSpotlight(!showSpotlight)}
                            className={cn("rounded-full h-10 w-10 transition-colors", showSpotlight ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Magnifier (M)"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-4 bg-border/50 mx-1" />

                        {/* Zoom Controls */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                            title="Zoom Out (-)"
                            disabled={showComparison}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                            title="Zoom In (+)"
                            disabled={showComparison}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        {zoom !== 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={resetView}
                                className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                                title="Reset View (0)"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="w-px h-4 bg-border/50 mx-1" />

                        {/* Secondary Actions */}
                        <Button variant="ghost" size="icon" onClick={onCopy} className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy (Ctrl+C)">
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Share">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFullscreen(true)}
                            className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Fullscreen (F)"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>

                        <div className="w-px h-4 bg-border/50 mx-1" />

                        {/* Help */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowShortcuts(true)}
                            className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Keyboard Shortcuts (?)"
                        >
                            <Keyboard className="h-4 w-4" />
                        </Button>
                    </motion.div>
                </motion.div>
            )}

            {/* Fullscreen Portal */}
            {fullscreenContent}

            {/* Keyboard Shortcuts Modal */}
            <AnimatePresence>
                {showShortcuts && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
                        onClick={() => setShowShortcuts(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-display font-bold">Keyboard Shortcuts</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(false)} className="rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { key: "Space", action: "Toggle comparison view" },
                                    { key: "+", action: "Zoom in" },
                                    { key: "-", action: "Zoom out" },
                                    { key: "0", action: "Reset zoom & pan" },
                                    { key: "M", action: "Toggle magnifier" },
                                    { key: "F", action: "Toggle fullscreen" },
                                    { key: "D", action: "Download image" },
                                    { key: "Ctrl+C", action: "Copy image" },
                                    { key: "?", action: "Show shortcuts" },
                                    { key: "Esc", action: "Close fullscreen/modal" },
                                ].map((shortcut) => (
                                    <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                        <span className="text-muted-foreground">{shortcut.action}</span>
                                        <kbd className="px-3 py-1 rounded-lg bg-muted text-sm font-mono">{shortcut.key}</kbd>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-6 text-center">
                                Scroll to zoom &bull; Drag to pan when zoomed &bull; Pinch to zoom on touch
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
