"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Sparkles,
    Image as ImageIcon,
    Wand2,
    Download,
    RefreshCw,
    ChevronRight,
    Lock,
    Check,
    AlertCircle,
    Settings2,
    Share2,
    Copy,
    Maximize2,
    Zap,
    SplitSquareHorizontal,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ComparisonSlider } from "@/components/studio/comparison-slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface PurchasedPrompt {
    id: string;
    title: string;
    category: string;
    exampleImages: string[];
}

interface CustomPrompt {
    id: string;
    title: string;
    promptText: string;
    image: string | null;
}

interface SavedPrompt {
    id: string;
    prompt: {
        id: string;
        title: string;
        category: string;
    };
}

export default function StudioPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Quick prompts for users with no purchases
    const QUICK_PROMPTS = [
        { id: "quick-1", title: "Marble Luxury", text: "Product photography on a polished white marble surface, soft natural lighting, high-end aesthetic" },
        { id: "quick-2", title: "Neon Tech", text: "Cyberpunk product shot, neon blue and pink rim lighting, dark background, futuristic vibes" },
        { id: "quick-3", title: "Nature Outdoor", text: "Outdoor product photography, placed on a mossy rock in a forest, dappled sunlight, bokeh background" },
    ];

    const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
    const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<string>("");
    const [customPrompt, setCustomPrompt] = useState<string>("");
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [statusText, setStatusText] = useState("Initializing..."); // Smart status
    const [showComparison, setShowComparison] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [demoMode, setDemoMode] = useState(false);

    // Advanced Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:5" | "9:16">("1:1");
    const [numImages, setNumImages] = useState(1);
    const [stylePreset, setStylePreset] = useState("Studio");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [productStrength, setProductStrength] = useState(80);
    const [quality, setQuality] = useState<"standard" | "hd">("standard");

    const STYLE_PRESETS = [
        { id: "None", label: "None", color: "bg-muted" },
        { id: "Studio", label: "Studio Clean", color: "bg-blue-500/10 text-blue-500 border-blue-200" },
        { id: "Luxury", label: "Luxury Dark", color: "bg-amber-500/10 text-amber-500 border-amber-200" },
        { id: "Nature", label: "Nature", color: "bg-green-500/10 text-green-500 border-green-200" },
        { id: "Neon", label: "Neon Cyber", color: "bg-purple-500/10 text-purple-500 border-purple-200" },
        { id: "Minimal", label: "Minimalist", color: "bg-gray-500/10 text-gray-500 border-gray-200" },
    ];

    // Fetch all prompts (purchased, custom, saved)
    useEffect(() => {
        async function fetchAllPrompts() {
            if (!session?.user) return;

            try {
                // Fetch all prompt sources in parallel
                const [purchasesRes, customRes, savedRes] = await Promise.all([
                    fetch("/api/user/purchases"),
                    fetch("/api/pocket/custom"),
                    fetch("/api/pocket"),
                ]);

                // Process purchased prompts
                if (purchasesRes.ok) {
                    const data = await purchasesRes.json();
                    if (data.success && data.data) {
                        setPurchasedPrompts(
                            data.data.map((purchase: { prompt: PurchasedPrompt }) => purchase.prompt)
                        );
                    }
                }

                // Process custom prompts
                if (customRes.ok) {
                    const data = await customRes.json();
                    if (data.customPrompts) {
                        setCustomPrompts(data.customPrompts);
                    }
                }

                // Process saved/bookmarked prompts
                if (savedRes.ok) {
                    const data = await savedRes.json();
                    if (data.savedPrompts) {
                        setSavedPrompts(data.savedPrompts);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch prompts:", err);
            } finally {
                setIsLoadingPrompts(false);
            }
        }

        fetchAllPrompts();
    }, [session]);

    // Check for query param prompt
    useEffect(() => {
        const promptParam = searchParams.get("prompt");
        if (promptParam) {
            setCustomPrompt(promptParam);
            setUseCustomPrompt(true);
        }
    }, [searchParams]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            processFile(file);
        }
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                processFile(file);
            }
        },
        []
    );

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setGeneratedImage(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        const hasPrompt = useCustomPrompt ? customPrompt.trim() : selectedPrompt;
        if (!uploadedImage || !hasPrompt) return;

        setIsGenerating(true);
        setError(null);
        setGenerationProgress(0);
        setDemoMode(false);

        // Simulate progress and smart status while waiting for API
        const statusMessages = [
            "Analyzing composition...",
            "Identifying subjects...",
            "Enhancing lighting...",
            "Applying style transfer...",
            "Rendering details...",
            "Finalizing output..."
        ];

        let messageIndex = 0;
        setStatusText(statusMessages[0]);

        const interval = setInterval(() => {
            setGenerationProgress((prev) => {
                if (prev >= 90) {
                    return 90;
                }
                // Cycle messages based on progress approx
                const newProgress = prev + Math.random() * 10;
                if (newProgress > (messageIndex + 1) * (90 / statusMessages.length)) {
                    messageIndex = Math.min(messageIndex + 1, statusMessages.length - 1);
                    setStatusText(statusMessages[messageIndex]);
                }
                return newProgress;
            });
        }, 500);

        // Determine promptId and customPrompt based on selection type
        let promptIdToSend: string | undefined;
        let customPromptToSend: string | undefined;

        if (useCustomPrompt) {
            // User typed custom text
            customPromptToSend = customPrompt;
        } else if (selectedPrompt.startsWith("quick-")) {
            // Quick demo prompt
            customPromptToSend = QUICK_PROMPTS.find(p => p.id === selectedPrompt)?.text;
        } else if (selectedPrompt.startsWith("custom-")) {
            // Custom prompt from Pocket
            const customPromptId = selectedPrompt.replace("custom-", "");
            const cp = customPrompts.find(c => c.id === customPromptId);
            customPromptToSend = cp?.promptText;
        } else if (selectedPrompt.startsWith("saved-")) {
            // Saved/bookmarked marketplace prompt - use the actual prompt ID
            promptIdToSend = selectedPrompt.replace("saved-", "");
        } else {
            // Purchased prompt
            promptIdToSend = selectedPrompt;
        }

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productImageUrl: uploadedImage,
                    promptId: promptIdToSend,
                    customPrompt: customPromptToSend,
                    // Advanced Parameters
                    aspectRatio,
                    stylePreset: stylePreset === "None" ? undefined : stylePreset,
                    productStrength,
                    quality,
                    negativePrompt: negativePrompt.trim() || undefined,
                    numImages
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to generate image");
            }

            // Check if it's demo mode
            if (result.message?.includes("Demo mode")) {
                setDemoMode(true);
            }

            // If we got a generated URL immediately (demo mode)
            if (result.data?.generatedUrl) {
                setGeneratedImage(result.data.generatedUrl);
                setGenerationProgress(100);
            } else if (result.data?.predictionId) {
                // Poll for completion
                await pollForCompletion(result.data.predictionId, result.data.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate image");
        } finally {
            clearInterval(interval);
            setIsGenerating(false);
        }
    };

    const pollForCompletion = async (predictionId: string, imageId: string) => {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;

        while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            attempts++;

            try {
                const response = await fetch(
                    `/api/generate?predictionId=${predictionId}&imageId=${imageId}`
                );
                const result = await response.json();

                if (result.data?.status === "succeeded" && result.data?.output) {
                    const outputUrl = Array.isArray(result.data.output)
                        ? result.data.output[0]
                        : result.data.output;
                    setGeneratedImage(outputUrl);
                    setGenerationProgress(100);
                    return;
                } else if (result.data?.status === "failed") {
                    throw new Error("Image generation failed");
                }

                // Update progress
                setGenerationProgress(Math.min(90, 30 + attempts * 2));
            } catch (err) {
                console.error("Polling error:", err);
            }
        }

        throw new Error("Generation timed out");
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `zerolens-generated-${Date.now()}.png`;
        link.click();
    };

    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImage(null);
        setSelectedPrompt("");
        setCustomPrompt("");
        setGenerationProgress(0);
        setError(null);
        setDemoMode(false);
    };

    const handleCopyImage = async () => {
        if (!generatedImage) return;
        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            toast.success("Image copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy image");
        }
    };

    // Auth check
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="section-container py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Sign in Required</h1>
                        <p className="text-muted-foreground mb-6">
                            You need to be signed in to use the AI Studio.
                        </p>
                        <Button
                            size="lg"
                            className="btn-premium"
                            onClick={() => router.push("/sign-in?callbackUrl=/studio")}
                        >
                            Sign in to Continue
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }


    // [HELPER COMPONENT FOR CONTROLS TO AVOID DUPLICATION]
    const StudioSidebar = ({
        inputId = "file-upload",
        className = ""
    }: { inputId?: string, className?: string }) => (
        <div className={cn("space-y-8", className)}>
            {/* Header */}
            <div>
                <Badge className="mb-3 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">AI Studio Workspace</Badge>
                <h1 className="text-2xl font-display font-bold mb-1 tracking-tight">
                    Create <span className="gradient-text">Magic</span>
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Configure your shot settings and transform your product.
                </p>
            </div>

            {/* Upload Area - Compact */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5" /> Source
                </label>
                <div
                    className={cn(
                        "group relative rounded-2xl border border-dashed transition-all duration-300 overflow-hidden cursor-pointer",
                        isDragging ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card/50 hover:border-primary/50 hover:bg-muted/50",
                        uploadedImage ? "h-48 shadow-inner" : "h-36"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploadedImage && document.getElementById(inputId)?.click()}
                >
                    {uploadedImage ? (
                        <>
                            <img
                                src={uploadedImage || ""}
                                alt="Uploaded"
                                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <Button size="sm" variant="secondary" className="rounded-full font-medium" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                                    <RefreshCw className="h-3 w-3 mr-2" /> Replace Image
                                </Button>
                            </div>
                            {/* Scanning Animation */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div
                                        initial={{ top: "0%" }}
                                        animate={{ top: "100%" }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,1)] z-10"
                                    />
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Upload Product</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Accepts JPG, PNG, WEBP</p>
                            <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </div>
                    )}
                </div>
            </div>

            {/* Prompt Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" /> Creative Direction
                    </label>
                    <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/50">
                        <button
                            onClick={() => setUseCustomPrompt(false)}
                            className={cn("px-3 py-1 text-[10px] font-medium rounded-md transition-all", !useCustomPrompt ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            Saved
                        </button>
                        <button
                            onClick={() => setUseCustomPrompt(true)}
                            className={cn("px-3 py-1 text-[10px] font-medium rounded-md transition-all", useCustomPrompt ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                        >
                            Custom
                        </button>
                    </div>
                </div>

                {useCustomPrompt ? (
                    <Textarea
                        placeholder="Describe the scene, lighting, and mood..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="min-h-[100px] text-sm resize-y bg-background/50 border-input focus:border-primary/50 transition-colors"
                    />
                ) : (
                    <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                        <SelectTrigger className="w-full h-12 bg-background/50">
                            <SelectValue placeholder="Select a prompt" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                            {/* Purchased Prompts */}
                            {purchasedPrompts.length > 0 && (
                                <div className="p-2">
                                    <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                        <Lock className="h-3 w-3" /> Purchased
                                    </p>
                                    {purchasedPrompts.map((prompt) => (
                                        <SelectItem key={prompt.id} value={prompt.id}>{prompt.title}</SelectItem>
                                    ))}
                                </div>
                            )}

                            {/* Custom Prompts from Pocket */}
                            {customPrompts.length > 0 && (
                                <div className={cn("p-2", purchasedPrompts.length > 0 && "border-t border-border")}>
                                    <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                        <Wand2 className="h-3 w-3" /> My Custom Prompts
                                    </p>
                                    {customPrompts.map((cp) => (
                                        <div
                                            key={`custom-${cp.id}`}
                                            onClick={() => setSelectedPrompt(`custom-${cp.id}`)}
                                            className={cn("text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-muted flex items-center justify-between transition-colors", selectedPrompt === `custom-${cp.id}` && "bg-primary/5 text-primary")}
                                        >
                                            <span className="truncate">{cp.title}</span>
                                            {selectedPrompt === `custom-${cp.id}` && <Check className="h-3.5 w-3.5 shrink-0" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Saved/Bookmarked Prompts */}
                            {savedPrompts.length > 0 && (
                                <div className={cn("p-2", (purchasedPrompts.length > 0 || customPrompts.length > 0) && "border-t border-border")}>
                                    <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                        <Sparkles className="h-3 w-3" /> Bookmarked
                                    </p>
                                    {savedPrompts.map((sp) => (
                                        <div
                                            key={`saved-${sp.prompt.id}`}
                                            onClick={() => setSelectedPrompt(`saved-${sp.prompt.id}`)}
                                            className={cn("text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-muted flex items-center justify-between transition-colors", selectedPrompt === `saved-${sp.prompt.id}` && "bg-primary/5 text-primary")}
                                        >
                                            <span className="truncate">{sp.prompt.title}</span>
                                            {selectedPrompt === `saved-${sp.prompt.id}` && <Check className="h-3.5 w-3.5 shrink-0" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Try Prompts */}
                            <div className={cn("p-2", (purchasedPrompts.length > 0 || customPrompts.length > 0 || savedPrompts.length > 0) && "border-t border-border")}>
                                <p className="text-[10px] text-muted-foreground mb-2 px-2 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                    <Zap className="h-3 w-3" /> Quick Try
                                </p>
                                {QUICK_PROMPTS.map(qp => (
                                    <div
                                        key={qp.id}
                                        onClick={() => setSelectedPrompt(qp.id)}
                                        className={cn("text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-muted flex items-center justify-between transition-colors", selectedPrompt === qp.id && "bg-primary/5 text-primary")}
                                    >
                                        <span className="truncate">{qp.title}</span>
                                        {selectedPrompt === qp.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Controls Grid */}
            <div className="space-y-6 pt-2">
                {/* Aspect Ratio */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aspect Ratio</label>
                    <div className="grid grid-cols-4 gap-2">
                        {([
                            { id: "1:1", label: "1:1", icon: "▢" },
                            { id: "4:5", label: "4:5", icon: "▯" },
                            { id: "16:9", label: "16:9", icon: "▭" },
                            { id: "9:16", label: "9:16", icon: "▮" },
                        ] as const).map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => setAspectRatio(ratio.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-xl border text-xs transition-all duration-200",
                                    aspectRatio === ratio.id
                                        ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "border-border bg-card/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className="text-lg mb-1 leading-none opacity-80">{ratio.icon}</span>
                                <span className="font-medium">{ratio.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Styles */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Style Preset</label>
                    <div className="flex flex-wrap gap-2">
                        {STYLE_PRESETS.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setStylePreset(style.id)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-sm",
                                    stylePreset === style.id
                                        ? `${style.color} ring-1 ring-current border-transparent bg-opacity-10`
                                        : "bg-card/50 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Accordion */}
                <div className="pt-4 border-t border-border/50">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors group"
                    >
                        Advanced Settings
                        <Settings2 className={cn("h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45", showSettings && "rotate-180 text-primary")} />
                    </button>

                    <AnimatePresence>
                        {showSettings && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-6 pt-5 pb-2"
                            >
                                {/* Product Strength */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-foreground">Product Integrity</span>
                                        <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">{productStrength}%</span>
                                    </div>
                                    <Slider
                                        value={[productStrength]}
                                        onValueChange={([val]) => setProductStrength(val)}
                                        max={100}
                                        step={1}
                                        className="py-1"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Adjust how strictly the AI adheres to the original shape.</p>
                                </div>

                                {/* Quality & Batch */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Quality</label>
                                        <div className="flex rounded-lg shadow-sm">
                                            <button onClick={() => setQuality("standard")} className={cn("flex-1 px-2 py-1.5 text-xs font-medium rounded-l-lg border transition-colors", quality === "standard" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted")}>Std</button>
                                            <button onClick={() => setQuality("hd")} className={cn("flex-1 px-2 py-1.5 text-xs font-medium rounded-r-lg border-y border-r transition-colors", quality === "hd" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted")}>HD</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Count</label>
                                        <div className="flex rounded-lg shadow-sm">
                                            {[1, 2, 4].map((num) => (
                                                <button key={num} onClick={() => setNumImages(num)} className={cn("flex-1 px-2 py-1.5 text-xs font-medium border-y border-r first:border-l first:rounded-l-lg last:rounded-r-lg transition-colors", numImages === num ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted")}>{num}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Negative Prompt</label>
                                    <Textarea
                                        placeholder="blur, darkness, distortion..."
                                        value={negativePrompt}
                                        onChange={e => setNegativePrompt(e.target.value)}
                                        className="h-20 text-xs resize-none bg-background/50"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Generate Button */}
            <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-background via-background to-transparent z-10">
                <Button
                    size="lg"
                    className="w-full h-14 text-base font-semibold shadow-xl shadow-primary/25 btn-premium rounded-2xl hover:scale-[1.02] transition-transform duration-200"
                    disabled={!uploadedImage || (!useCustomPrompt && !selectedPrompt) || (useCustomPrompt && !customPrompt.trim()) || isGenerating}
                    onClick={handleGenerate}
                >
                    {isGenerating ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>Generating...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            <span>Generate Studio Shot</span>
                        </div>
                    )}
                </Button>
                <div className="mt-2 h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.p
                                key="status"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-[10px] text-primary font-medium flex items-center gap-1.5"
                            >
                                <Zap className="h-3 w-3" /> {statusText}
                            </motion.p>
                        ) : (
                            <motion.p
                                key="ready"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] text-muted-foreground/50"
                            >
                                Ready to create
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
            <Navbar />

            <main className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR - CONTROLS (Common) */}
                <div className="w-[420px] flex-none overflow-y-auto border-r border-border bg-sidebar/50 backdrop-blur-xl p-6 custom-scrollbar relative z-20 shadow-xl lg:block hidden">
                    <StudioSidebar inputId="desktop-upload" />
                </div>

                {/* RIGHT CANVAS - MAIN WORKSPACE */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-10 overflow-hidden bg-background">
                    {/* Subtle Grid Overlay */}
                    <div className="absolute inset-0 opacity-[0.6] pointer-events-none grid-bg" />

                    {/* Mobile Upload Drawer Trigger */}
                    <div className="lg:hidden absolute top-4 left-4 z-50">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur shadow-lg border-primary/20">
                                    <Settings2 className="h-4 w-4 mr-2" />
                                    Studio Controls
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[90%] sm:w-[420px] overflow-y-auto p-6 pt-10">
                                <StudioSidebar inputId="mobile-upload" />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* ... Rest of Canvas ... */}
                    {demoMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-4 z-20 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md shadow-lg"
                        >
                            <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" /> DEMO MODE: Configure REPLICATE_API_TOKEN
                            </p>
                        </motion.div>
                    )}

                    {/* Main Stage */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center max-w-6xl mx-auto z-10 perspective-1000">

                        {isGenerating ? (
                            /* GENERATING STATE - Scanning Animation */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative w-full h-full flex flex-col items-center justify-center"
                            >
                                <div className="relative w-full h-full max-h-[80vh] aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-background/50 backdrop-blur-sm ring-1 ring-primary/10 flex items-center justify-center">
                                    {/* Source Image with Scanning Effect */}
                                    {uploadedImage && (
                                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                            <img
                                                src={uploadedImage || ""}
                                                alt="Processing"
                                                className="max-w-full max-h-full object-contain opacity-50 blur-sm scale-105 transition-all duration-[20s] ease-linear"
                                                style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.8)' }}
                                            />
                                            {/* Scanning Laser */}
                                            <motion.div
                                                initial={{ top: "-10%" }}
                                                animate={{ top: "110%" }}
                                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                                className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10"
                                            />
                                            <motion.div
                                                initial={{ top: "-10%", opacity: 0 }}
                                                animate={{ top: "110%", opacity: [0, 0.5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                                className="absolute left-0 right-0 h-20 bg-gradient-to-b from-primary/0 via-primary/10 to-primary/0 z-0"
                                            />
                                        </div>
                                    )}

                                    {/* Central Status loader */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl rounded-full blur-xl" />
                                            <div className="relative w-24 h-24 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                                                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="mt-8 px-6 py-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 shadow-lg relative overflow-hidden">
                                            <motion.div
                                                className="absolute inset-0 bg-primary/5"
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "100%" }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            />
                                            <p className="text-sm font-medium text-primary flex items-center gap-2 relative z-10">
                                                <Zap className="h-3.5 w-3.5 fill-primary" />
                                                {statusText}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : generatedImage ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                                className="relative w-full h-full flex flex-col items-center justify-center"
                            >
                                <div
                                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/40 backdrop-blur-xl ring-1 ring-white/10"
                                    style={{ maxHeight: 'calc(100vh - 160px)' }}
                                >
                                    {uploadedImage && showComparison ? (
                                        <ComparisonSlider original={uploadedImage || ""} generated={generatedImage || ""} />
                                    ) : (
                                        <img src={generatedImage || ""} alt="Result" className="w-full h-full object-contain" />
                                    )}
                                </div>

                                {/* Floating Toolbar */}
                                <motion.div
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="absolute bottom-8 flex items-center gap-1.5 p-1.5 rounded-full bg-background/90 backdrop-blur-xl border border-border shadow-2xl ring-1 ring-white/5"
                                >
                                    <Button size="sm" onClick={handleDownload} className="rounded-full px-5 btn-premium h-10 font-medium shadow-lg shadow-primary/20">
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </Button>
                                    <div className="w-px h-4 bg-border/50 mx-1.5" />
                                    {uploadedImage && (
                                        <Button
                                            variant={showComparison ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setShowComparison(!showComparison)}
                                            className={cn("rounded-full h-10 w-10 transition-colors", showComparison ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                                            title="Toggle Comparison"
                                        >
                                            <SplitSquareHorizontal className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={handleCopyImage} className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Share2 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Maximize2 className="h-4 w-4" /></Button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* Empty State / Drop Zone */
                            <div
                                className={cn(
                                    "group flex flex-col items-center justify-center w-full max-w-3xl aspect-auto md:aspect-video min-h-[500px] md:min-h-0 rounded-[2rem] border-2 border-dashed transition-all duration-500 ease-out relative overflow-hidden",
                                    isDragging
                                        ? "border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10"
                                        : "border-border/40 hover:border-primary/30 hover:bg-card/30 backdrop-blur-sm"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {/* Animated Background Elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative z-10 flex flex-col items-center text-center p-6 md:p-8">
                                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-b from-muted to-background border border-white/10 shadow-xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary drop-shadow-lg" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-display font-medium mb-3 text-foreground tracking-tight">
                                        Start Your <span className="gradient-text">Creation</span>
                                    </h2>
                                    <p className="text-muted-foreground text-base md:text-lg max-w-md mb-8 md:mb-10 leading-relaxed">
                                        Drag and drop your product image here to begin the transformation.
                                    </p>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-md"
                                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Select Image
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
}
