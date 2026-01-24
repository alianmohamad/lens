"use client";

import { useEffect } from "react";
import * as fabric from "fabric";

interface UseKeyboardShortcutsProps {
    canvas: fabric.Canvas | null;
    onGenerate?: () => void;
    activeTool: string;
}

export function useKeyboardShortcuts({
    canvas,
    onGenerate,
    activeTool,
}: UseKeyboardShortcutsProps) {
    useEffect(() => {
        if (!canvas) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLDivElement && e.target.isContentEditable
            ) {
                // Allow Ctrl+Enter to generate even in input
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    onGenerate?.();
                    return;
                }
                return;
            }

            // Shortcuts
            switch (e.key) {
                case "Delete":
                case "Backspace":
                    const activeObjects = canvas.getActiveObjects();
                    if (activeObjects.length > 0) {
                        // Filter out non-deletable objects if any
                        activeObjects.forEach((obj) => {
                            canvas.remove(obj);
                        });
                        canvas.discardActiveObject();
                        canvas.requestRenderAll();
                    }
                    break;

                case "Enter":
                    // Only if Ctrl/Cmd is pressed (consistent with input)
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        onGenerate?.();
                    }
                    break;

                case " ": // Space
                    if (!e.repeat && activeTool !== "hand") {
                        (canvas as any).isHandMode = true;
                        canvas.selection = false;
                        canvas.defaultCursor = "grab";
                        canvas.setCursor("grab");

                        // If resizing logic exists, it might need update, but for now just cursor
                    }
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLDivElement && e.target.isContentEditable
            ) {
                return;
            }

            if (e.key === " ") {
                if (activeTool !== "hand") {
                    (canvas as any).isHandMode = false;
                    canvas.selection = true;
                    canvas.defaultCursor = "default";
                    canvas.setCursor("default");
                    canvas.requestRenderAll();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [canvas, onGenerate, activeTool]);
}
