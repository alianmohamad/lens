
"use client";

import { useEffect, useState } from "react";
import * as fabric from "fabric";
import { Download, Copy, SplitSquareHorizontal, Save, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ComparisonSlider } from "./comparison-slider";
import { motion, AnimatePresence } from "framer-motion";

interface ShapeToolbarProps {
    canvas: fabric.Canvas;
}

export function ShapeToolbar({ canvas }: ShapeToolbarProps) {
    const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);
    const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            const active = canvas.getActiveObject();
            const allActive = canvas.getActiveObjects() || [];

            const isSingleFrame = allActive.length === 1 && (allActive[0] as any).data?.type === "generation-frame";
            const isMultiSelection = allActive.length > 1;

            if (active && (isSingleFrame || isMultiSelection)) {
                const vpt = canvas.viewportTransform;
                if (!vpt) return;

                const bound = active.getBoundingRect();

                let screenX = (bound.left + bound.width / 2) * vpt[0] + vpt[4];
                let screenY = (bound.top) * vpt[3] + vpt[5];

                const PADDING = 20;
                if (screenY - 70 < PADDING) {
                    screenY = 70 + PADDING;
                }

                const minX = 100;
                const maxX = window.innerWidth - 100;
                if (screenX < minX) screenX = minX;
                if (screenX > maxX) screenX = maxX;

                setToolbarPos({ x: screenX, y: screenY });
                setSelectedObj(active);
            } else {
                setSelectedObj(null);
            }
        };

        canvas.on("selection:created", updatePosition);
        canvas.on("selection:updated", updatePosition);
        canvas.on("selection:cleared", () => setSelectedObj(null));
        canvas.on("object:moving", updatePosition);
        canvas.on("object:scaling", updatePosition);
        canvas.on("mouse:wheel", updatePosition);
        canvas.on("mouse:up", updatePosition);

        return () => {
            canvas.off("selection:created", updatePosition);
            canvas.off("selection:updated", updatePosition);
            canvas.off("selection:cleared");
            canvas.off("object:moving", updatePosition);
            canvas.off("object:scaling", updatePosition);
            canvas.off("mouse:wheel", updatePosition);
            canvas.off("mouse:up", updatePosition);
        };
    }, [canvas]);

    if (!selectedObj) return null;

    const data = (selectedObj as any).data || {};
    const count = canvas.getActiveObjects().length;
    const isMulti = count > 1;

    const handleDownload = () => {
        if (!data.originalUrl) return;
        const link = document.createElement("a");
        link.href = data.originalUrl;
        link.download = `zerolens-gen-${data.id}.png`;
        link.click();
        toast.success("Download started");
    };

    const handleCopy = async () => {
        if (!data.originalUrl) return;
        try {
            const response = await fetch(data.originalUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            toast.success("Image copied");
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    return (
        <>
            <div
                className="absolute flex items-center gap-1 p-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl z-50 -translate-x-1/2 transition-transform duration-75 ease-out"
                style={{
                    left: toolbarPos.x,
                    top: toolbarPos.y - 70,
                }}
                onMouseDown={e => e.stopPropagation()}
            >
                {/* Single Selection Tools */}
                {!isMulti && data.originalUrl && (
                    <>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-800" onClick={handleDownload} title="Download">
                            <Download className="h-4 w-4 text-zinc-200" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-800" onClick={handleCopy} title="Copy">
                            <Copy className="h-4 w-4 text-zinc-200" />
                        </Button>
                    </>
                )}

                {/* Multi Selection Tools */}
                {isMulti && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-purple-500/20"
                        onClick={() => {
                            const active = canvas.getActiveObjects();
                            if (active.length >= 2) {
                                import("@/lib/fabric-utils").then(({ createConnector }) => {
                                    const sorted = [...active].sort((a: any, b: any) => (a.left || 0) - (b.left || 0));

                                    for (let i = 0; i < sorted.length - 1; i++) {
                                        const conn = createConnector(sorted[i], sorted[i + 1]);
                                        canvas.add(conn);
                                        // FIX: Fabric v6+ uses sendObjectToBack. Types are v5.
                                        (canvas as any).sendObjectToBack(conn);
                                    }
                                    canvas.requestRenderAll();
                                    toast.success("Nodes Connected");
                                });
                            }
                        }}
                        title="Connect Nodes"
                    >
                        <LinkIcon className="h-4 w-4 text-purple-400" />
                    </Button>
                )}

                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-800" title="Save Prompt (Soon)">
                    <Save className="h-4 w-4 text-zinc-200" />
                </Button>

                {!isMulti && data.originalUrl && (
                    <>
                        <div className="w-px h-4 bg-zinc-700 mx-1" />
                        <Button
                            variant={showComparison ? "secondary" : "ghost"}
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-zinc-800"
                            onClick={() => setShowComparison(true)}
                            title="Compare"
                        >
                            <SplitSquareHorizontal className="h-4 w-4 text-zinc-200" />
                        </Button>
                    </>
                )}
            </div>

            <AnimatePresence>
                {showComparison && data.originalUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-2000 bg-background/95 backdrop-blur-md flex items-center justify-center p-8 pointer-events-auto"
                        onClick={() => setShowComparison(false)}
                    >
                        <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800" onClick={e => e.stopPropagation()}>
                            <ComparisonSlider
                                original={data.originalUrl}
                                generated={data.originalUrl}
                                className="w-full h-full"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-4 right-4 rounded-full bg-black/50 border-white/10 hover:bg-black/70 text-white"
                                onClick={() => setShowComparison(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
