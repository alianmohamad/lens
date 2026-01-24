"use client";

import { useState, useEffect, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as fabric from "fabric";

interface ZoomControlsProps {
    canvas: fabric.Canvas | null;
}

export function ZoomControls({ canvas }: ZoomControlsProps) {
    const [zoom, setZoom] = useState(100);

    // Update zoom display when canvas zoom changes
    useEffect(() => {
        if (!canvas) return;

        const updateZoom = () => {
            const currentZoom = canvas.getZoom();
            setZoom(Math.round(currentZoom * 100));
        };

        // Initial zoom
        updateZoom();

        // Listen for viewport changes
        canvas.on("viewport:transform:changed" as any, updateZoom);
        canvas.on("mouse:wheel", updateZoom);

        return () => {
            canvas.off("viewport:transform:changed" as any, updateZoom);
            canvas.off("mouse:wheel", updateZoom);
        };
    }, [canvas]);

    const handleZoomIn = useCallback(() => {
        if (!canvas) return;
        const currentZoom = canvas.getZoom();
        const newZoom = Math.min(currentZoom * 1.2, 5); // Max 500%
        const center = canvas.getVpCenter();
        canvas.zoomToPoint(center, newZoom);
        canvas.requestRenderAll();
        setZoom(Math.round(newZoom * 100));
    }, [canvas]);

    const handleZoomOut = useCallback(() => {
        if (!canvas) return;
        const currentZoom = canvas.getZoom();
        const newZoom = Math.max(currentZoom / 1.2, 0.1); // Min 10%
        const center = canvas.getVpCenter();
        canvas.zoomToPoint(center, newZoom);
        canvas.requestRenderAll();
        setZoom(Math.round(newZoom * 100));
    }, [canvas]);

    const handleResetZoom = useCallback(() => {
        if (!canvas) return;
        const center = canvas.getVpCenter();
        canvas.zoomToPoint(center, 1);
        canvas.requestRenderAll();
        setZoom(100);
    }, [canvas]);

    return (
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-lg pointer-events-auto">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="h-7 w-7 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
                <Minus className="h-3.5 w-3.5" />
            </Button>
            <button
                onClick={handleResetZoom}
                className="min-w-[48px] px-2 py-1 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                title="Reset to 100%"
            >
                {zoom}%
            </button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="h-7 w-7 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
