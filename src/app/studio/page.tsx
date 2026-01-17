
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { StudioNav } from "@/components/studio/studio-nav";
import { StudioCanvas } from "@/components/studio/studio-canvas";
import { StudioToolPalette } from "@/components/studio/studio-tool-palette";
import { StudioBottomBar } from "@/components/studio/studio-bottom-bar";
import { cn } from "@/lib/utils";
import * as fabric from "fabric";

export default function StudioPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Core State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusText, setStatusText] = useState("Ready");

    // UI State
    const [activeTool, setActiveTool] = useState<"select" | "hand">("select");
    const [isDragging, setIsDragging] = useState(false);

    // Generation Params
    const [prompt, setPrompt] = useState("");
    const [stylePreset, setStylePreset] = useState("realistic");
    const [aspectRatio, setAspectRatio] = useState("1:1");

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => setUploadedImage(event.target?.result as string);
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
            reader.onload = (event) => setUploadedImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setStatusText("Initializing...");

        // Simulate API
        setTimeout(() => setStatusText("Analyzing image..."), 1000);
        setTimeout(() => setStatusText("Generating variations..."), 2500);
        setTimeout(() => {
            setIsGenerating(false);
            setGeneratedImage(uploadedImage); // Demo
            setCanvas(prev => {
                // Force re-render if needed
                return prev;
            });
            toast.success("Generation Complete!");
        }, 4000);
    };

    const handleFitToScreen = () => {
        if (canvas) {
            const vpt = canvas.viewportTransform;
            if (vpt) {
                vpt[4] = 0; // Reset Pan logic roughly
                vpt[5] = 0;
                canvas.setZoom(1);
                canvas.requestRenderAll();
            }
        }
    };

    useEffect(() => {
        if (status === "unauthenticated" || (!session && status !== "loading")) {
            router.push("/sign-in");
        }
    }, [session, status, router]);

    if (status === "loading") return null;
    if (!session) return null;

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-purple-500/30">

            {/* L0: Canvas */}
            <div className="absolute inset-0 z-0">
                <StudioCanvas
                    onCanvasReady={setCanvas}
                    originalImage={uploadedImage}
                    generatedImage={generatedImage}
                />
            </div>

            {/* L1: Navigation */}
            <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
                <StudioNav />
            </div>

            {/* L2: Tool Palette (Left) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                <StudioToolPalette
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    onFitToScreen={handleFitToScreen}
                />
            </div>

            {/* L3: Bottom Control Bar */}
            <div className="absolute bottom-6 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
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
                />
            </div>

            {/* L4: Drop Zone Overlay (Initial State) */}
            <AnimatePresence>
                {!uploadedImage && !isGenerating && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none">
                        <div
                            className={cn(
                                "pointer-events-auto group flex flex-col items-center justify-center w-full max-w-lg p-10 rounded-[2rem] border-2 border-dashed transition-all duration-500 ease-out relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-sm shadow-2xl",
                                isDragging ? "border-purple-500 bg-purple-500/10 scale-105" : "border-slate-700/50 hover:border-slate-600 hover:bg-[#0f172a]/60"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="h-16 w-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform border border-slate-700">
                                <Sparkles className="h-8 w-8 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">Start Creating</h2>
                            <p className="text-slate-400 mb-6 text-center text-sm">
                                Drag & drop for instant setup.
                            </p>
                            <Button
                                size="lg"
                                className="rounded-full px-8 h-10 text-sm bg-white text-slate-900 hover:bg-slate-200"
                                onClick={() => document.getElementById("file-upload-init")?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Browse Files
                            </Button>
                            <input id="file-upload-init" type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* L5: Loading Overlay */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
                    >
                        <div className="bg-[#0f172a] p-8 rounded-2xl border border-purple-500/20 shadow-2xl flex flex-col items-center">
                            {/* Spinner */}
                            <div className="relative h-12 w-12 mb-4">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-200 font-medium text-sm">{statusText}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
