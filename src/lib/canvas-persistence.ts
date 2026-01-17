
import * as fabric from "fabric";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AUTOSAVE_DELAY = 1000;

export async function loadCanvasFromApi(): Promise<any | null> {
    try {
        const res = await fetch("/api/canvas");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        return data.snapshot;
    } catch (err) {
        console.error("Load error:", err);
        return null;
    }
}

export async function saveCanvasToApi(snapshot: any) {
    try {
        await fetch("/api/canvas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot }),
        });
    } catch (err) {
        console.error("Save error:", err);
    }
}

export function useCanvasPersistence(canvas: fabric.Canvas | null, onLoaded?: () => void) {
    const [isLoaded, setIsLoaded] = useState(false);

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
            } catch (e) {
                console.error("Failed to load init snapshot", e);
            } finally {
                if (isMounted) {
                    setIsLoaded(true);
                    onLoaded?.();
                }
            }
        }

        load();

        return () => { isMounted = false; };
    }, [canvas]);

    // Auto-Save
    useEffect(() => {
        if (!canvas || !isLoaded) return;

        // Debounced save
        const saveTimer = { current: null as any };

        const save = () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                const snapshot = canvas.toJSON(); // Serializes everything
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
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [canvas, isLoaded]);

    return { isLoaded };
}
