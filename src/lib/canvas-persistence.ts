import * as fabric from "fabric";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import type { CanvasState } from "@/types/canvas";

const AUTOSAVE_DELAY = 1000;

export async function loadCanvasFromApi(): Promise<CanvasState | null> {
    try {
        const res = await fetch("/api/canvas");
        if (!res.ok) return null;
        const data = await res.json();
        return data.snapshot;
    } catch {
        return null;
    }
}

export async function saveCanvasToApi(snapshot: CanvasState): Promise<boolean> {
    try {
        const res = await fetch("/api/canvas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export function useCanvasPersistence(canvas: fabric.Canvas | null, onLoaded?: () => void) {
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Load
    useEffect(() => {
        if (!canvas) return;

        let isMounted = true;

        async function load() {
            try {
                const snapshot = await loadCanvasFromApi();
                if (!isMounted) return;

                if (snapshot && canvas) {
                    canvas.loadFromJSON(snapshot, () => {
                        canvas.requestRenderAll();
                        toast.info("Canvas loaded");
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoaded(true);
                    onLoaded?.();
                }
            }
        }

        load();

        return () => { isMounted = false; };
    }, [canvas, onLoaded]);

    // Auto-Save
    useEffect(() => {
        if (!canvas || !isLoaded) return;

        const save = () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                const snapshot = canvas.toJSON() as CanvasState;
                saveCanvasToApi(snapshot);
            }, AUTOSAVE_DELAY);
        };

        // Listen to object modifications
        canvas.on("object:modified", save);
        canvas.on("object:added", save);
        canvas.on("object:removed", save);

        return () => {
            canvas.off("object:modified", save);
            canvas.off("object:added", save);
            canvas.off("object:removed", save);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [canvas, isLoaded]);

    return { isLoaded };
}
