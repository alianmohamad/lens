"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as fabric from "fabric";
import { createGenerationCard, createConnector } from "@/lib/fabric-utils";
import type { CanvasObjectData } from "@/types/canvas";

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_DELAY = 150;

// Serialized state for history
interface HistoryState {
    objects: SerializedObject[];
    viewportTransform: number[];
}

interface SerializedObject {
    type: string;
    data: CanvasObjectData;
    left: number;
    top: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
}

/**
 * Serialize canvas state for history
 */
function serializeForHistory(canvas: fabric.Canvas): HistoryState {
    const objects: SerializedObject[] = [];

    canvas.getObjects().forEach((obj: any) => {
        // Skip skeletons
        if (obj.data?.type === 'skeleton') return;
        if (!obj.data?.type) return;

        objects.push({
            type: obj.data.type,
            data: { ...obj.data },
            left: obj.left || 0,
            top: obj.top || 0,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
        });
    });

    return {
        objects,
        viewportTransform: canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0],
    };
}

/**
 * Restore canvas from history state
 */
async function restoreFromHistory(
    canvas: fabric.Canvas,
    state: HistoryState
): Promise<void> {
    // Clear existing objects
    canvas.clear();

    const objectMap: Map<string, fabric.Object> = new Map();

    // First pass: Create all non-connector objects
    for (const obj of state.objects) {
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
            try {
                const { createFailedCard } = await import('@/lib/fabric-utils');
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
                console.error('Failed to restore failed card:', error);
            }
        }
    }

    // Second pass: Create connectors
    for (const obj of state.objects) {
        if (obj.type !== 'connector') continue;

        const source = objectMap.get(obj.data.sourceId || '');
        const target = objectMap.get(obj.data.targetId || '');

        if (source && target) {
            const connector = createConnector(source, target);
            canvas.add(connector);
            (canvas as any).sendObjectToBack(connector);
        }
    }

    // Restore viewport
    if (state.viewportTransform?.length === 6) {
        canvas.setViewportTransform(state.viewportTransform as [number, number, number, number, number, number]);
    }

    canvas.requestRenderAll();
}

export function useCanvasHistory(canvas: fabric.Canvas | null) {
    // Use refs to avoid stale closures
    const historyRef = useRef<HistoryState[]>([]);
    const indexRef = useRef(-1);
    const isRestoringRef = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef(canvas);

    // State for UI updates only
    const [, forceUpdate] = useState(0);

    // Keep canvasRef current
    useEffect(() => {
        canvasRef.current = canvas;
    }, [canvas]);

    const canUndo = indexRef.current > 0;
    const canRedo = indexRef.current < historyRef.current.length - 1;

    // Push current state to history (with debouncing)
    const pushState = useCallback(() => {
        const currentCanvas = canvasRef.current;
        if (!currentCanvas || isRestoringRef.current) return;

        // Debounce to avoid too many states for rapid changes
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (!canvasRef.current || isRestoringRef.current) return;

            const state = serializeForHistory(canvasRef.current);

            // Remove any future states if we're not at the end
            const currentIndex = indexRef.current;
            const newHistory = historyRef.current.slice(0, currentIndex + 1);

            // Add new state
            newHistory.push(state);

            // Limit history size
            if (newHistory.length > MAX_HISTORY_SIZE) {
                newHistory.shift();
                indexRef.current = newHistory.length - 1;
            } else {
                indexRef.current = newHistory.length - 1;
            }

            historyRef.current = newHistory;

            // Force re-render to update canUndo/canRedo
            forceUpdate(n => n + 1);
        }, DEBOUNCE_DELAY);
    }, []);

    // Undo
    const undo = useCallback(async () => {
        const currentCanvas = canvasRef.current;
        if (!currentCanvas || indexRef.current <= 0) return;

        isRestoringRef.current = true;
        const newIndex = indexRef.current - 1;
        const state = historyRef.current[newIndex];

        if (state) {
            await restoreFromHistory(currentCanvas, state);
            indexRef.current = newIndex;
            forceUpdate(n => n + 1);
        }

        // Small delay to let canvas events settle before allowing new history entries
        setTimeout(() => {
            isRestoringRef.current = false;
        }, 50);
    }, []);

    // Redo
    const redo = useCallback(async () => {
        const currentCanvas = canvasRef.current;
        if (!currentCanvas || indexRef.current >= historyRef.current.length - 1) return;

        isRestoringRef.current = true;
        const newIndex = indexRef.current + 1;
        const state = historyRef.current[newIndex];

        if (state) {
            await restoreFromHistory(currentCanvas, state);
            indexRef.current = newIndex;
            forceUpdate(n => n + 1);
        }

        // Small delay to let canvas events settle before allowing new history entries
        setTimeout(() => {
            isRestoringRef.current = false;
        }, 50);
    }, []);

    // Initialize history and listen to canvas changes
    useEffect(() => {
        if (!canvas) return;

        // Push initial state
        const initialState = serializeForHistory(canvas);
        historyRef.current = [initialState];
        indexRef.current = 0;
        forceUpdate(n => n + 1);

        const handleChange = () => {
            if (!isRestoringRef.current) {
                pushState();
            }
        };

        canvas.on("object:added", handleChange);
        canvas.on("object:removed", handleChange);
        canvas.on("object:modified", handleChange);

        return () => {
            canvas.off("object:added", handleChange);
            canvas.off("object:removed", handleChange);
            canvas.off("object:modified", handleChange);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [canvas, pushState]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if we're typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            // Ctrl/Cmd + Shift + Z = Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                redo();
            }

            // Ctrl/Cmd + Y = Redo (alternative)
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        undo,
        redo,
        canUndo,
        canRedo,
        historyLength: historyRef.current.length,
    };
}
