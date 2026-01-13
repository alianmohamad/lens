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
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface PurchasedPrompt {
    id: string;
    title: string;
    category: string;
    exampleImages: string[];
}

export default function StudioPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<string>("");
    const [customPrompt, setCustomPrompt] = useState<string>("");
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [demoMode, setDemoMode] = useState(false);

    // Fetch purchased prompts
    useEffect(() => {
        async function fetchPurchasedPrompts() {
            if (!session?.user) return;

            try {
                const response = await fetch("/api/user/purchases");
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setPurchasedPrompts(
                            data.data.map((purchase: { prompt: PurchasedPrompt }) => purchase.prompt)
                        );
                    }
                }
            } catch (err) {
                console.error("Failed to fetch purchased prompts:", err);
            } finally {
                setIsLoadingPrompts(false);
            }
        }

        fetchPurchasedPrompts();
    }, [session]);

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

        // Simulate progress while waiting for API
        const interval = setInterval(() => {
            setGenerationProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productImageUrl: uploadedImage,
                    promptId: useCustomPrompt ? undefined : selectedPrompt,
                    customPrompt: useCustomPrompt ? customPrompt : undefined,
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
        link.download = `promptlens-generated-${Date.now()}.png`;
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

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-4">AI Studio</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Transform Your <span className="gradient-text">Product Photos</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Upload your product image, select a prompt, and let AI create stunning
                        visuals
                    </p>
                </div>

                {/* Demo Mode Banner */}
                {demoMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            <strong>Demo Mode:</strong> Image generation API is not configured.
                            Configure <code>REPLICATE_API_TOKEN</code> in your environment for
                            actual AI generation.
                        </p>
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Preview */}
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <Card className="border-2 border-dashed border-border overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" />
                                    Upload Product Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        "relative rounded-xl overflow-hidden transition-all duration-300",
                                        isDragging && "ring-2 ring-primary ring-offset-2"
                                    )}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {uploadedImage ? (
                                        <div className="relative aspect-square">
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded product"
                                                className="w-full h-full object-contain bg-muted rounded-xl"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="absolute top-3 right-3"
                                                onClick={handleReset}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                Change
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer">
                                            <div className="aspect-square bg-muted rounded-xl flex flex-col items-center justify-center p-8 hover:bg-muted/80 transition-colors">
                                                <div className="h-16 w-16 rounded-2xl gradient-bg-subtle flex items-center justify-center mb-4">
                                                    <ImageIcon className="h-8 w-8 text-primary" />
                                                </div>
                                                <p className="font-medium mb-1">
                                                    Drop your image here or click to upload
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Supports JPG, PNG, WebP (max 10MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prompt Selection */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Select a Prompt
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Toggle between purchased and custom */}
                                <div className="flex gap-2">
                                    <Button
                                        variant={!useCustomPrompt ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setUseCustomPrompt(false)}
                                    >
                                        My Prompts
                                    </Button>
                                    <Button
                                        variant={useCustomPrompt ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setUseCustomPrompt(true)}
                                    >
                                        Custom Prompt
                                    </Button>
                                </div>

                                {useCustomPrompt ? (
                                    <Textarea
                                        placeholder="Enter your custom prompt for image generation..."
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="min-h-[120px]"
                                    />
                                ) : isLoadingPrompts ? (
                                    <div className="py-8 text-center">
                                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Loading your prompts...
                                        </p>
                                    </div>
                                ) : purchasedPrompts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">
                                            You haven't purchased any prompts yet
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push("/marketplace")}
                                        >
                                            Browse Marketplace
                                        </Button>
                                    </div>
                                ) : (
                                    <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Choose from your purchased prompts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {purchasedPrompts.map((prompt) => (
                                                <SelectItem key={prompt.id} value={prompt.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{prompt.title}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {prompt.category}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </CardContent>
                        </Card>

                        {/* Generate Button */}
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg btn-premium"
                            disabled={
                                !uploadedImage ||
                                (!useCustomPrompt && !selectedPrompt) ||
                                (useCustomPrompt && !customPrompt.trim()) ||
                                isGenerating
                            }
                            onClick={handleGenerate}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-5 w-5 mr-2" />
                                    Generate Image
                                </>
                            )}
                        </Button>

                        {/* Progress */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Processing...</span>
                                        <span className="font-medium">
                                            {Math.round(generationProgress)}%
                                        </span>
                                    </div>
                                    <Progress value={generationProgress} className="h-2" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                            >
                                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                                <p className="text-sm text-destructive">{error}</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Result */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wand2 className="h-5 w-5 text-primary" />
                                    Generated Result
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {generatedImage ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                                            <img
                                                src={generatedImage}
                                                alt="Generated result"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <Badge className="badge-gradient">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Complete
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                className="flex-1 btn-premium"
                                                onClick={handleDownload}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={handleGenerate}
                                                disabled={isGenerating}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Regenerate
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="aspect-square bg-muted rounded-xl flex flex-col items-center justify-center text-center p-8">
                                        <div className="h-16 w-16 rounded-2xl bg-muted-foreground/10 flex items-center justify-center mb-4">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium mb-1 text-muted-foreground">
                                            Your generated image will appear here
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Upload an image and select a prompt to get started
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-16">
                    <h2 className="text-xl font-semibold mb-6">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                step: 1,
                                title: "Upload Your Product",
                                description: "Drop or select your product image in any format",
                                icon: Upload,
                            },
                            {
                                step: 2,
                                title: "Choose a Prompt",
                                description:
                                    "Select from your purchased prompts or write a custom one",
                                icon: Sparkles,
                            },
                            {
                                step: 3,
                                title: "Generate & Download",
                                description: "AI transforms your image in seconds",
                                icon: Download,
                            },
                        ].map((item, index) => (
                            <div key={item.step} className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                                    <item.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-medium mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                                {index < 2 && (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground hidden md:block shrink-0 mt-2.5" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
