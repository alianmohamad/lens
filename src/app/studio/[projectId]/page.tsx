"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, MousePointer2, Maximize, Menu, Undo2, Redo2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { StudioNav } from "@/components/studio/studio-nav";
import { StudioCanvas } from "@/components/studio/studio-canvas";
import { StudioToolPalette } from "@/components/studio/studio-tool-palette";
import { StudioBottomBar } from "@/components/studio/studio-bottom-bar";
import { ZoomControls } from "@/components/studio/zoom-controls";
import { EmptyStateGuide } from "@/components/studio/empty-state-guide";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as fabric from "fabric";
import { createGenerationCard, createSkeletonCard, createFailedCard, createConnector } from "@/lib/fabric-utils";
import { useCanvasPersistence } from "@/lib/canvas-persistence";
import { useCanvasHistory } from "@/hooks/use-canvas-history";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRef } from "react";

interface PageProps {
    params: Promise<{ projectId: string }>;
}

export default function StudioEditorPage({ params }: PageProps) {
    const { projectId } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Core State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusText, setStatusText] = useState("Ready");

    // Project State
    const [projectName, setProjectName] = useState("Untitled Project");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [projectLoaded, setProjectLoaded] = useState(false);

    // Canvas Persistence - auto-saves to backend
    const { isLoaded: isCanvasLoaded, hasContent: hasRestoredContent, saveStatus } = useCanvasPersistence(
        canvas,
        projectId,
        (loaded) => {
            if (loaded) {
                setHasCanvasContent(true);
                // Try to restore the uploaded image state from the first generation card
                if (canvas) {
                    const objects = canvas.getObjects();
                    const genCard = objects.find((o: any) => o.data?.originalUrl);
                    if (genCard) {
                        setUploadedImage((genCard as any).data.originalUrl);
                    }
                }
            }
        }
    );

    // Canvas History - undo/redo
    const { undo, redo, canUndo, canRedo } = useCanvasHistory(isCanvasLoaded ? canvas : null);



    // UI State
    const [activeTool, setActiveTool] = useState<"select" | "hand">("select");
    const [isDragging, setIsDragging] = useState(false);
    const [showMobileTools, setShowMobileTools] = useState(false);
    const [hasCanvasContent, setHasCanvasContent] = useState(false);

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        canvas,
        onGenerate: () => handleGenerate(),
        activeTool,
    });

    // Generation Params
    const [prompt, setPrompt] = useState("");
    const [stylePreset, setStylePreset] = useState("realistic");
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [modelId, setModelId] = useState("gemini-3-pro");

    // Source card tracking for auto-connect
    const sourceCardRef = useRef<fabric.Object | null>(null);

    // Load project details
    useEffect(() => {
        if (status === "authenticated" && projectId) {
            fetchProject();
        }
    }, [status, projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProjectName(data.project.name);
                setProjectLoaded(true);
            } else if (res.status === 404) {
                toast.error("Project not found");
                router.push("/studio");
            } else if (res.status === 403) {
                toast.error("Access denied");
                router.push("/studio");
            }
        } catch (error) {
            toast.error("Failed to load project");
            router.push("/studio");
        }
    };

    // Update project name on server
    const handleProjectNameChange = async (newName: string) => {
        setProjectName(newName);
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName }),
            });
        } catch (error) {
            console.error("Failed to update project name:", error);
        }
    };

    // Update lastSaved when save completes
    useEffect(() => {
        if (saveStatus === "saved") {
            setLastSaved(new Date());
        }
    }, [saveStatus]);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setHasCanvasContent(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setHasCanvasContent(true);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleGenerate = async (imageUrlOverride?: string) => {
        const imageToUse = imageUrlOverride || uploadedImage;
        if (!imageToUse) {
            toast.error("Please upload an image first");
            return;
        }

        setIsGenerating(true);
        setStatusText(`Processing with ${modelId === 'imagen-3' ? 'Imagen 3' : 'Gemini 3 Pro'}...`);

        // 1. Calculate Position - prioritize placing next to source card
        let nextLeft = 0;
        let nextCenterY = 0;
        const CARD_GAP = 80; // Gap between connected cards

        if (canvas) {
            // If we have a source card (chain generation), position relative to it
            if (sourceCardRef.current) {
                const sourceCard = sourceCardRef.current as any;
                // Use model coordinates (left/top) not screen coordinates (getBoundingRect)
                const sourceLeft = sourceCard.left || 0;
                const sourceTop = sourceCard.top || 0;
                const sourceWidth = sourceCard.getScaledWidth?.() || sourceCard.width || 400;
                const sourceHeight = sourceCard.getScaledHeight?.() || sourceCard.height || 400;

                nextLeft = sourceLeft + sourceWidth + CARD_GAP;
                nextCenterY = sourceTop + sourceHeight / 2;
            } else {
                // No source card - find position based on existing cards or center
                const existingCards = canvas.getObjects().filter((o: any) =>
                    o.data?.type === "generation-frame" || o.data?.type === "skeleton"
                );

                if (existingCards.length > 0) {
                    // Place to the right of the rightmost card
                    let maxRight = -Infinity;
                    existingCards.forEach((c: any) => {
                        const cardLeft = c.left || 0;
                        const cardWidth = c.getScaledWidth?.() || c.width || 400;
                        const rightEdge = cardLeft + cardWidth;
                        if (rightEdge > maxRight) {
                            maxRight = rightEdge;
                            const cardTop = c.top || 0;
                            const cardHeight = c.getScaledHeight?.() || c.height || 400;
                            nextCenterY = cardTop + cardHeight / 2;
                        }
                    });
                    nextLeft = maxRight + CARD_GAP;
                } else {
                    // First card - center in viewport
                    const center = canvas.getVpCenter();
                    nextLeft = center.x;
                    nextCenterY = center.y;
                }
            }
        }

        // 2. Add Skeleton Loader
        const skeleton = canvas ? createSkeletonCard({
            left: nextLeft,
            top: nextCenterY - 256,
            scale: 1
        }) : null;

        if (canvas && skeleton) {
            canvas.add(skeleton);
            canvas.requestRenderAll();
        }

        try {
            // 3. Prepare payload
            const payload = {
                productImageUrl: imageToUse,
                promptId: "",
                customPrompt: prompt || "Professional product photography",
                aspectRatio: aspectRatio,
                stylePreset: stylePreset,
                productStrength: 80,
                demoMode: false,
                modelId: modelId
            };

            // 2. Call API
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            if (data.success && data.data?.generatedUrl) {
                setGeneratedImage(data.data.generatedUrl);
                setStatusText("Rendering...");

                if (canvas) {
                    const group = await createGenerationCard(data.data.generatedUrl, {
                        left: nextLeft,
                        top: nextCenterY,
                        prompt: prompt || stylePreset,
                        label: `Gen: ${modelId === 'imagen-3' ? 'Img3' : 'Gem3'}`
                    });

                    const myHeight = group.getScaledHeight();
                    group.set({ top: nextCenterY - myHeight / 2 });

                    if (skeleton) canvas.remove(skeleton);

                    canvas.add(group);

                    // Auto-connect: Create connector from source card to new generation
                    if (sourceCardRef.current) {
                        const connector = createConnector(sourceCardRef.current, group);
                        canvas.add(connector);
                        (canvas as any).sendObjectToBack(connector);
                        sourceCardRef.current = null; // Reset source after connecting
                    }

                    canvas.setActiveObject(group);
                    canvas.requestRenderAll();

                    toast.success("Generation Complete!");
                }
            } else {
                throw new Error("No image data received");
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to generate image";

            if (canvas && skeleton) {
                const skeletonLeft = skeleton.left || nextLeft;
                const skeletonTop = skeleton.top || nextCenterY - 128;
                canvas.remove(skeleton);

                const failedCard = createFailedCard({
                    left: skeletonLeft,
                    top: skeletonTop,
                    error: errorMessage,
                    generationParams: {
                        productImageUrl: imageToUse,
                        prompt: prompt || "Professional product photography",
                        stylePreset: stylePreset,
                        aspectRatio: aspectRatio,
                        modelId: modelId,
                    },
                });
                canvas.add(failedCard);
                canvas.setActiveObject(failedCard);
            }
            canvas?.requestRenderAll();
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
            setStatusText("Ready");
        }
    };

    const handleRetry = async (failedCard: fabric.Object) => {
        if (!canvas) return;

        const data = (failedCard as any).data;
        if (!data?.generationParams) {
            toast.error("Cannot retry - missing generation parameters");
            return;
        }

        canvas.remove(failedCard);
        canvas.requestRenderAll();

        const params = data.generationParams;
        setUploadedImage(params.productImageUrl);
        setPrompt(params.prompt);
        setStylePreset(params.stylePreset);
        setAspectRatio(params.aspectRatio);
        setModelId(params.modelId);

        setTimeout(() => {
            handleGenerate();
        }, 100);
    };

    // Chain generation - use an existing card's image as source for new generation
    const handleGenerateFrom = (sourceCard: fabric.Object) => {
        const data = (sourceCard as any).data;
        if (!data?.originalUrl) {
            toast.error("Cannot generate from this card");
            return;
        }

        // Set the source card for auto-connect
        sourceCardRef.current = sourceCard;

        // Also update state for UI consistency
        setUploadedImage(data.originalUrl);

        // Pass image URL directly to avoid async state timing issues
        handleGenerate(data.originalUrl);
    };

    const handleFitToScreen = () => {
        if (!canvas) return;

        const objects = canvas.getObjects().filter((o: any) => o.data?.type !== "connector");

        if (objects.length === 0) {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.requestRenderAll();
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
            const bounds = obj.getBoundingRect();
            minX = Math.min(minX, bounds.left);
            minY = Math.min(minY, bounds.top);
            maxX = Math.max(maxX, bounds.left + bounds.width);
            maxY = Math.max(maxY, bounds.top + bounds.height);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        const margin = 150;
        const scaleX = (canvasWidth - margin * 2) / contentWidth;
        const scaleY = (canvasHeight - margin * 2) / contentHeight;
        const zoom = Math.min(scaleX, scaleY, 0.8);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const vpCenterX = canvasWidth / 2;
        const vpCenterY = canvasHeight / 2;

        canvas.setViewportTransform([
            zoom, 0, 0, zoom,
            vpCenterX - centerX * zoom,
            vpCenterY - centerY * zoom
        ]);
        canvas.requestRenderAll();
        toast.success("Centered on content");
    };

    useEffect(() => {
        if (status === "unauthenticated" || (!session && status !== "loading")) {
            router.push("/sign-in");
        }
    }, [session, status, router]);

    if (status === "loading" || !projectLoaded) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-purple-500/30">

            {/* L0: Canvas */}
            <div className="absolute inset-0 z-0">
                {isCanvasLoaded && !uploadedImage && !hasCanvasContent && <EmptyStateGuide onUpload={handleFileSelect} />}
                <StudioCanvas
                    onCanvasReady={setCanvas}
                    originalImage={uploadedImage}
                    onRetry={handleRetry}
                    onGenerateFrom={handleGenerateFrom}
                    generatedImage={generatedImage}
                    activeTool={activeTool}
                />
            </div>

            {/* L1: Navigation */}
            <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
                <StudioNav
                    userImage={session?.user?.image}
                    canvas={canvas}
                    projectName={projectName}
                    onProjectNameChange={handleProjectNameChange}
                    saveStatus={saveStatus}
                    lastSaved={lastSaved}
                    backLink="/studio"
                />
            </div>

            {/* L1b: Zoom Controls (Top Right) */}
            <div className="absolute top-20 right-4 lg:right-6 z-30 pointer-events-none">
                <ZoomControls canvas={canvas} />
            </div>

            {/* L2: Tool Palette (Left) - Hidden on Mobile */}
            <div className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center">
                <StudioToolPalette
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    onFitToScreen={handleFitToScreen}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            </div>

            {/* L2b: Mobile Tool FAB */}
            <div className="md:hidden absolute left-3 bottom-20 z-30">
                <Popover open={showMobileTools} onOpenChange={setShowMobileTools}>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl text-zinc-300 hover:text-white hover:bg-zinc-800"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        align="start"
                        className="w-auto p-2 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-2xl"
                    >
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setActiveTool("select"); setShowMobileTools(false); }}
                                className={cn(
                                    "justify-start gap-2 h-10 px-3 rounded-xl",
                                    activeTool === "select" ? "bg-purple-600 text-white" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                <MousePointer2 className="h-4 w-4" />
                                <span>Select</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setActiveTool("hand"); setShowMobileTools(false); }}
                                className={cn(
                                    "justify-start gap-2 h-10 px-3 rounded-xl",
                                    activeTool === "hand" ? "bg-purple-600 text-white" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
                                    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
                                    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16a2 2 0 0 1 0-2.6 2 2 0 0 1 2.8 0L8 15" />
                                </svg>
                                <span>Pan</span>
                            </Button>
                            <div className="h-px bg-zinc-800 my-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { handleFitToScreen(); setShowMobileTools(false); }}
                                className="justify-start gap-2 h-10 px-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800"
                            >
                                <Maximize className="h-4 w-4" />
                                <span>Fit to Screen</span>
                            </Button>
                            <div className="h-px bg-zinc-800 my-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { undo(); setShowMobileTools(false); }}
                                disabled={!canUndo}
                                className={cn(
                                    "justify-start gap-2 h-10 px-3 rounded-xl",
                                    canUndo ? "text-zinc-300 hover:text-white hover:bg-zinc-800" : "text-zinc-600"
                                )}
                            >
                                <Undo2 className="h-4 w-4" />
                                <span>Undo</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { redo(); setShowMobileTools(false); }}
                                disabled={!canRedo}
                                className={cn(
                                    "justify-start gap-2 h-10 px-3 rounded-xl",
                                    canRedo ? "text-zinc-300 hover:text-white hover:bg-zinc-800" : "text-zinc-600"
                                )}
                            >
                                <Redo2 className="h-4 w-4" />
                                <span>Redo</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* L3: Bottom Control Bar */}
            <div className="absolute bottom-4 md:bottom-6 left-2 right-2 md:left-0 md:right-0 z-30 md:px-4 flex justify-center pointer-events-none">
                <StudioBottomBar
                    onUpload={handleFileSelect}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    uploadedImage={uploadedImage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    stylePreset={stylePreset}
                    setStylePreset={setStylePreset}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    modelId={modelId}
                    setModelId={setModelId}
                />
            </div>

            {/* L4: Drop Zone Overlay (Initial State) */}


            {/* L5: Loading Overlay */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
                    >
                        <div className="bg-[#0f172a] p-8 rounded-2xl border border-purple-500/20 shadow-2xl flex flex-col items-center">
                            <div className="relative h-12 w-12 mb-4">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-200 font-medium text-sm">{statusText}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
