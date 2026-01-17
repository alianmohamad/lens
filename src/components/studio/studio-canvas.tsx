
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { initInfiniteCanvas, createGenerationCard, updateConnector } from "@/lib/fabric-utils";
import useMeasure from "react-use-measure";
import { ShapeToolbar } from "./shape-toolbar";

interface StudioCanvasProps {
    onCanvasReady?: (canvas: fabric.Canvas) => void;
    generatedImage?: string | null;
    originalImage?: string | null;
    activeTool?: "select" | "hand";
}

export function StudioCanvas({ onCanvasReady, generatedImage, originalImage, activeTool = "select" }: StudioCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [measureRef, bounds] = useMeasure();

    // Grid State for CSS Background
    const [gridState, setGridState] = useState({ zoom: 1, x: 0, y: 0 });

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || fabricCanvas) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            renderOnAddRemove: true,
            selection: true,
            preserveObjectStacking: true,
        });

        initInfiniteCanvas(canvas);
        setFabricCanvas(canvas);
        if (onCanvasReady) onCanvasReady(canvas);

        const updateGrid = () => {
            const vpt = canvas.viewportTransform;
            if (vpt) {
                setGridState({
                    zoom: canvas.getZoom(),
                    x: vpt[4], y: vpt[5]
                });
            }
        };

        canvas.on("mouse:wheel", updateGrid);
        canvas.on("mouse:up", updateGrid);
        canvas.on("mouse:move", (e: any) => {
            if (e.e.buttons === 1 && (e.e.altKey || e.e.code === "Space")) {
                updateGrid();
            }
        });

        // Helper to find objects even if they are in a selection group
        const findObjectById = (id: string) => {
            // 1. Check main objects
            let found = canvas.getObjects().find((x: any) => x.data?.id === id);
            if (found) return found;

            // 2. Check inside ActiveSelection if applicable
            const active = canvas.getActiveObject();
            if (active && active.type === "activeSelection") {
                // @ts-ignore
                found = active.getObjects().find((x: any) => x.data?.id === id);
            }
            return found;
        };

        // Connector Updates (Drag Listener)
        const updateConnectedLines = (triggerObj: any) => {
            canvas.getObjects().forEach((o: any) => {
                if (o.data?.type === "connector") {
                    const sId = o.data.sourceId;
                    const tId = o.data.targetId;

                    // Optimization: If trigger is one of them, use it directly
                    // This is crucial during drag, as 'triggerObj' has the critical 'group' info
                    let s = sId === triggerObj.data?.id ? triggerObj : findObjectById(sId);
                    let t = tId === triggerObj.data?.id ? triggerObj : findObjectById(tId);

                    if (s && t) {
                        updateConnector(o as fabric.Path, s, t);
                    }
                }
            });
        };

        canvas.on("object:moving", (e: any) => {
            const target = e.target;
            if (!target) return;

            // Handle Group Selection Drag
            if (target.type === "activeSelection") {
                const objects = target.getObjects();
                objects.forEach((obj: any) => updateConnectedLines(obj));
            } else {
                updateConnectedLines(target);
            }
        });

        // Animation Loop (Marching Ants)
        let animationFrame: number;
        const animate = () => {
            if (!canvas.getElement()) return; // Canvas disposed?

            let needsRender = false;
            canvas.getObjects().forEach((obj: any) => {
                if (obj.data?.type === "connector") {
                    // Constant speed animation
                    const current = obj.strokeDashOffset || 0;
                    obj.set('strokeDashOffset', current - 0.5);
                    obj.dirty = true;
                    needsRender = true;
                }
            });

            if (needsRender) {
                canvas.requestRenderAll();
            }

            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            canvas.dispose();
        };
    }, []);

    // Resize handling
    useEffect(() => {
        if (!fabricCanvas || !containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        fabricCanvas.setDimensions({ width, height });
        fabricCanvas.requestRenderAll();
    }, [bounds, fabricCanvas]);

    // Tool Mode Handling
    useEffect(() => {
        if (!fabricCanvas) return;

        const isHand = activeTool === "hand";
        (fabricCanvas as any).isHandMode = isHand;

        fabricCanvas.selection = !isHand;
        fabricCanvas.defaultCursor = isHand ? "grab" : "default";
        fabricCanvas.hoverCursor = isHand ? "grab" : "move";

        // Disable selection of objects in Hand mode
        fabricCanvas.forEachObject((obj) => {
            obj.selectable = !isHand;
            obj.evented = !isHand; // Disable hover effects too? Maybe keep evented for hover but not select.
        });

        fabricCanvas.requestRenderAll();
    }, [fabricCanvas, activeTool]);

    // Handle Original Image Addition
    useEffect(() => {
        if (!fabricCanvas || !originalImage) return;

        const existing = fabricCanvas.getObjects().find((o: any) => o.data?.originalUrl === originalImage);
        if (existing) {
            fabricCanvas.setActiveObject(existing);
            fabricCanvas.requestRenderAll();
            return;
        }

        const center = fabricCanvas.getVpCenter();

        createGenerationCard(originalImage, {
            left: center.x,
            top: center.y,
            prompt: "Original Source"
        }).then(group => {
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.requestRenderAll();
        });
    }, [fabricCanvas, originalImage]);

    // Grid Style
    const gridSize = Math.max(20, 40 * gridState.zoom);
    const svgString = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="1.5" fill="#94a3b8" fill-opacity="0.5"/></svg>`;
    const bgImage = `url("data:image/svg+xml;base64,${btoa(svgString)}")`;

    return (
        <div ref={measureRef} className="w-full h-full relative overflow-hidden bg-[#020617]">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: bgImage,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    backgroundPosition: `${gridState.x}px ${gridState.y}px`,
                }}
            />

            <div ref={containerRef} className="absolute inset-0">
                <canvas ref={canvasRef} />
            </div>

            {fabricCanvas && <ShapeToolbar canvas={fabricCanvas} />}
        </div>
    );
}
