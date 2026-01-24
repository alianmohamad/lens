import * as fabric from "fabric";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createGenerationCard, createConnector } from "./fabric-utils";
import type { CanvasObjectData, GenerationParams } from "@/types/canvas";

const AUTOSAVE_DELAY = 1000;

// Serialized object format for persistence
interface SerializedCanvasObject {
    type: string;
    data: CanvasObjectData;
    left: number;
    top: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
}

// Canvas snapshot format
interface CanvasSnapshot {
    version: string;
    objects: SerializedCanvasObject[];
    viewportTransform: number[];
}

/**
 * Serialize canvas to a custom format that preserves our card data
 */
function serializeCanvas(canvas: fabric.Canvas): CanvasSnapshot {
    const objects: SerializedCanvasObject[] = [];

    canvas.getObjects().forEach((obj: any) => {
        // Skip skeletons (temporary loading indicators)
        if (obj.data?.type === 'skeleton') return;
        if (!obj.data?.type) return;

        const serialized: SerializedCanvasObject = {
            type: obj.data.type,
            data: { ...obj.data },
            left: obj.left || 0,
            top: obj.top || 0,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
        };

        objects.push(serialized);
    });

    return {
        version: '1.0',
        objects,
        viewportTransform: canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0],
    };
}

/**
 * Deserialize a snapshot and restore canvas state
 */
async function deserializeCanvas(
    canvas: fabric.Canvas,
    snapshot: CanvasSnapshot
): Promise<void> {
    // Clear existing objects
    canvas.clear();

    // Track created objects by ID for connector restoration
    const objectMap: Map<string, fabric.Object> = new Map();

    // First pass: Create all non-connector objects
    for (const obj of snapshot.objects) {
        if (obj.type === 'connector') continue;

        if (obj.type === 'generation-frame' && obj.data.originalUrl) {
            try {
                const card = await createGenerationCard(obj.data.originalUrl, {
                    left: obj.left,
                    top: obj.top,
                    prompt: obj.data.prompt,
                    id: obj.data.id,
                    label: obj.data.label,
                });

                // Restore scale and angle if present
                if (obj.scaleX !== undefined && obj.scaleY !== undefined) {
                    card.set({ scaleX: obj.scaleX, scaleY: obj.scaleY });
                }
                if (obj.angle !== undefined) {
                    card.set({ angle: obj.angle });
                }

                canvas.add(card);
                if (obj.data.id) {
                    objectMap.set(obj.data.id, card);
                }
            } catch (error) {
                console.error('Failed to restore card:', obj.data.id, error);
            }
        } else if (obj.type === 'failed-generation') {
            // Import and create failed card dynamically
            try {
                const { createFailedCard } = await import('./fabric-utils');
                if (typeof createFailedCard === 'function') {
                    const failedCard = createFailedCard({
                        left: obj.left,
                        top: obj.top,
                        error: obj.data.error || 'Generation failed',
                        generationParams: obj.data.generationParams,
                        id: obj.data.id,
                    });
                    canvas.add(failedCard);
                    if (obj.data.id) {
                        objectMap.set(obj.data.id, failedCard);
                    }
                }
            } catch (error) {
                console.error('Failed to restore failed card:', obj.data.id, error);
            }
        }
    }

    // Second pass: Create connectors
    for (const obj of snapshot.objects) {
        if (obj.type !== 'connector') continue;

        const source = objectMap.get(obj.data.sourceId || '');
        const target = objectMap.get(obj.data.targetId || '');

        if (source && target) {
            const connector = createConnector(source, target);
            canvas.add(connector);
            (canvas as any).sendObjectToBack(connector);
        }
    }

    // Restore viewport transform
    if (snapshot.viewportTransform && snapshot.viewportTransform.length === 6) {
        canvas.setViewportTransform(snapshot.viewportTransform as [number, number, number, number, number, number]);
    }

    canvas.requestRenderAll();
}

export async function loadCanvasFromApi(projectId: string): Promise<CanvasSnapshot | null> {
    try {
        const res = await fetch(`/api/canvas?projectId=${projectId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.snapshot;
    } catch {
        return null;
    }
}

export async function saveCanvasToApi(projectId: string, snapshot: CanvasSnapshot): Promise<boolean> {
    try {
        const res = await fetch("/api/canvas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, snapshot }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export function useCanvasPersistence(
    canvas: fabric.Canvas | null,
    projectId: string | null,
    onLoaded?: (hasContent: boolean) => void
) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isRestoringRef = useRef(false);
    const hasLoadedRef = useRef(false);
    const onLoadedRef = useRef(onLoaded);

    // Keep the callback ref updated
    onLoadedRef.current = onLoaded;

    // Save function with debouncing
    const triggerSave = useCallback(() => {
        if (!canvas || !projectId || !isLoaded || isRestoringRef.current) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        setSaveStatus("saving");
        saveTimerRef.current = setTimeout(async () => {
            const snapshot = serializeCanvas(canvas);
            const success = await saveCanvasToApi(projectId, snapshot);
            setSaveStatus(success ? "saved" : "error");

            if (!success) {
                toast.error("Failed to save canvas");
            }
        }, AUTOSAVE_DELAY);
    }, [canvas, projectId, isLoaded]);

    // Initial Load - only runs once per canvas/projectId combination
    useEffect(() => {
        if (!canvas || !projectId || hasLoadedRef.current) return;

        let isMounted = true;
        hasLoadedRef.current = true;

        async function load() {
            let loadedWithContent = false;
            try {
                isRestoringRef.current = true;
                const snapshot = await loadCanvasFromApi(projectId!);
                if (!isMounted) return;

                if (snapshot && canvas && snapshot.objects && snapshot.objects.length > 0) {
                    await deserializeCanvas(canvas, snapshot);
                    loadedWithContent = true;
                }
            } catch (error) {
                console.error('Failed to load canvas:', error);
                toast.error("Failed to load saved canvas");
            } finally {
                if (isMounted) {
                    isRestoringRef.current = false;
                    setIsLoaded(true);
                    setHasContent(loadedWithContent);
                    onLoadedRef.current?.(loadedWithContent);
                }
            }
        }

        load();

        return () => { isMounted = false; };
    }, [canvas, projectId]);

    // Auto-Save on canvas changes
    useEffect(() => {
        if (!canvas || !isLoaded) return;

        canvas.on("object:modified", triggerSave);
        canvas.on("object:added", triggerSave);
        canvas.on("object:removed", triggerSave);

        return () => {
            canvas.off("object:modified", triggerSave);
            canvas.off("object:added", triggerSave);
            canvas.off("object:removed", triggerSave);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [canvas, isLoaded, triggerSave]);

    return { isLoaded, hasContent, saveStatus, triggerSave };
}

// Export types for use elsewhere
export type { CanvasSnapshot, SerializedCanvasObject };
