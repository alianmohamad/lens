"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bookmark,
    Trash2,
    ShoppingCart,
    Sparkles,
    Star,
    Plus,
    Copy,
    PenTool,
    Globe,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/stores/cart-store";
import { CATEGORY_LABELS } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface SavedPromptData {
    id: string;
    savedAt: string;
    prompt: {
        id: string;
        title: string;
        description: string;
        price: number;
        category: string;
        rating: number;
        reviewCount: number;
        tags: string[];
        exampleImages: string[];
        creator: {
            id: string;
            name: string | null;
            image: string | null;
        };
    };
}

interface CustomPromptData {
    id: string;
    title: string;
    promptText: string;
    image?: string | null;
    isPublic: boolean;
    createdAt: string;
}

interface HistoryImage {
    id: string;
    generatedUrl: string;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

function PocketCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-4 h-full">
                <Skeleton className="h-48 sm:h-32 w-full sm:w-48 shrink-0 rounded-lg" />
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function PocketPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedPrompts, setSavedPrompts] = useState<SavedPromptData[]>([]);
    const [customPrompts, setCustomPrompts] = useState<CustomPromptData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const { addItem, isInCart } = useCartStore();

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPromptTitle, setNewPromptTitle] = useState("");
    const [newPromptText, setNewPromptText] = useState("");
    const [newPromptImage, setNewPromptImage] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Image Generation/Selection State
    const [activeImageTab, setActiveImageTab] = useState("upload");
    const [historyImages, setHistoryImages] = useState<HistoryImage[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationReferenceImage, setGenerationReferenceImage] = useState("");

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user) {
            router.push("/sign-in?callbackUrl=/pocket");
            return;
        }

        const fetchData = async () => {
            try {
                const [savedRes, customRes] = await Promise.all([
                    fetch("/api/pocket"),
                    fetch("/api/pocket/custom"),
                ]);

                if (savedRes.ok) {
                    const data = await savedRes.json();
                    setSavedPrompts(data.savedPrompts);
                }
                if (customRes.ok) {
                    const data = await customRes.json();
                    console.log("Custom prompts data:", data); // Debug
                    setCustomPrompts(data.customPrompts || []);
                }
            } catch (error) {
                console.error("Error fetching pocket data:", error);
                toast.error("Failed to load your Pocket");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session, status, router]);

    const fetchHistory = async () => {
        if (historyImages.length > 0) return;
        setIsLoadingHistory(true);
        try {
            const res = await fetch("/api/generate");
            if (res.ok) {
                const data = await res.json();
                setHistoryImages(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if larger than 800px
                    const MAX_SIZE = 800;
                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        if (width > height) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        } else {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7 quality
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setFunc(compressedBase64);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!newPromptText) {
            toast.error("Please enter prompt text first");
            return;
        }
        if (!generationReferenceImage) {
            toast.error("Please upload a reference product image");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productImageUrl: generationReferenceImage,
                    customPrompt: newPromptText,
                    promptId: null,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setNewPromptImage(data.data.generatedUrl);
                toast.success("Image generated successfully!");
            } else {
                throw new Error(data.error || "Generation failed");
            }
        } catch (error) {
            console.error("Generation error:", error);
            toast.error("Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemoveSaved = async (promptId: string) => {
        setRemovingIds((prev) => new Set(prev).add(promptId));
        try {
            const res = await fetch(`/api/pocket?promptId=${promptId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSavedPrompts((prev) => prev.filter((sp) => sp.prompt.id !== promptId));
                toast.success("Removed from Pocket");
            } else {
                throw new Error("Failed to remove");
            }
        } catch (error) {
            toast.error("Failed to remove prompt");
        } finally {
            setRemovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(promptId);
                return newSet;
            });
        }
    };

    const handleRemoveCustom = async (promptId: string) => {
        if (!confirm("Are you sure you want to delete this prompt?")) return;
        setRemovingIds((prev) => new Set(prev).add(promptId));
        try {
            const res = await fetch(`/api/pocket/custom?promptId=${promptId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCustomPrompts((prev) => prev.filter((p) => p.id !== promptId));
                toast.success("Prompt deleted");
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.error("Failed to delete prompt");
        } finally {
            setRemovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(promptId);
                return newSet;
            });
        }
    };

    const handleCreateCustom = async () => {
        if (!newPromptTitle.trim() || !newPromptText.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/pocket/custom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newPromptTitle,
                    promptText: newPromptText,
                    image: newPromptImage,
                    isPublic,
                }),
            });

            if (res.ok) {
                const newPrompt = await res.json();
                setCustomPrompts((prev) => [newPrompt, ...prev]);
                toast.success("Prompt created!");
                setIsDialogOpen(false);
                setNewPromptTitle("");
                setNewPromptText("");
                setNewPromptImage("");
                setGenerationReferenceImage("");
                setIsPublic(false);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create");
            }
        } catch (error) {
            console.error("Creation error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create prompt");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Prompt copied to clipboard!");
    };

    const handleAddToCart = (prompt: SavedPromptData["prompt"]) => {
        addItem({
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            price: prompt.price,
            category: prompt.category as keyof typeof CATEGORY_LABELS,
            rating: prompt.rating,
            reviewCount: prompt.reviewCount,
            tags: prompt.tags,
            exampleImages: prompt.exampleImages,
            creator: prompt.creator,
        });
        toast.success("Added to cart");
    };

    if (status === "loading" || (status === "authenticated" && isLoading)) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
                    <div className="section-container py-12">
                        <div className="mb-8">
                            <Skeleton className="h-10 w-48 mb-2" />
                            <Skeleton className="h-5 w-72" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <PocketCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
                <div className="section-container py-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
                                    <Bookmark className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-display font-bold">
                                        Your Pocket
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Manage your saved and custom prompts
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="btn-premium hidden sm:flex">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Prompt
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[900px]">
                                <DialogHeader>
                                    <DialogTitle>Create Custom Prompt</DialogTitle>
                                    <DialogDescription>
                                        Save your own prompts for later use or sharing.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-8 py-6">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g. Minimalist Coffee Cup"
                                                    value={newPromptTitle}
                                                    onChange={(e) => setNewPromptTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="prompt">Prompt Text</Label>
                                                <Textarea
                                                    id="prompt"
                                                    placeholder="Enter your detailed prompt here..."
                                                    className="h-32"
                                                    value={newPromptText}
                                                    onChange={(e) => setNewPromptText(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="public"
                                                    checked={isPublic}
                                                    onCheckedChange={(c) => setIsPublic(c === true)}
                                                />
                                                <Label htmlFor="public" className="cursor-pointer">Make Public (Allow others to see/buy)</Label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Cover Image</Label>
                                            <Tabs defaultValue="upload" onValueChange={(v) => {
                                                setActiveImageTab(v);
                                                if (v === "history") fetchHistory();
                                            }}>
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="upload">Upload</TabsTrigger>
                                                    <TabsTrigger value="history">History</TabsTrigger>
                                                    <TabsTrigger value="generate">Generate</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="upload" className="space-y-3">
                                                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            id="image-upload"
                                                            onChange={(e) => handleFileUpload(e, setNewPromptImage)}
                                                        />
                                                        <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                            {newPromptImage ? (
                                                                <div className="relative h-32 w-full rounded-md overflow-hidden">
                                                                    <Image src={newPromptImage} alt="Preview" fill className="object-cover" />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                        <Plus className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                                                                </>
                                                            )}
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px bg-border flex-1" />
                                                        <span className="text-xs text-muted-foreground">OR</span>
                                                        <div className="h-px bg-border flex-1" />
                                                    </div>
                                                    <Input
                                                        placeholder="Paste image URL..."
                                                        value={newPromptImage}
                                                        onChange={(e) => setNewPromptImage(e.target.value)}
                                                    />
                                                </TabsContent>

                                                <TabsContent value="history">
                                                    <div className="h-64 overflow-y-auto pr-2">
                                                        {isLoadingHistory ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-md bg-muted/60" />)}
                                                            </div>
                                                        ) : historyImages.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground text-center py-8">No generation history found</p>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {historyImages.map((img) => (
                                                                    <div
                                                                        key={img.id}
                                                                        className={cn(
                                                                            "relative h-24 rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                                                                            newPromptImage === img.generatedUrl ? "border-primary" : "border-transparent hover:border-primary/50"
                                                                        )}
                                                                        onClick={() => setNewPromptImage(img.generatedUrl)}
                                                                    >
                                                                        <Image src={img.generatedUrl} alt="History" fill className="object-cover" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="generate" className="space-y-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Reference Product</Label>
                                                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                id="ref-upload"
                                                                onChange={(e) => handleFileUpload(e, setGenerationReferenceImage)}
                                                            />
                                                            <Label htmlFor="ref-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                                {generationReferenceImage ? (
                                                                    <div className="relative h-24 w-full rounded-md overflow-hidden">
                                                                        <Image src={generationReferenceImage} alt="Reference" fill className="object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                                                        </div>
                                                                        <span className="text-xs text-muted-foreground">Upload product reference</span>
                                                                    </>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleGenerateImage}
                                                        disabled={isGenerating || !generationReferenceImage || !newPromptText}
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        {isGenerating ? <><Sparkles className="h-3 w-3 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-3 w-3 mr-2" /> Generate Preview</>}
                                                    </Button>
                                                    {newPromptImage && activeImageTab === 'generate' && (
                                                        <div className="relative h-32 w-full rounded-md overflow-hidden mt-2 border border-border">
                                                            <Image src={newPromptImage} alt="Generated" fill className="object-cover" />
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateCustom} disabled={isCreating} className="bg-primary text-primary-foreground">
                                        {isCreating ? "Creating..." : "Create Prompt"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Tabs defaultValue="saved" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
                            <TabsTrigger value="custom">My Prompts</TabsTrigger>
                        </TabsList>

                        <TabsContent value="saved" className="space-y-4">
                            {savedPrompts.length === 0 ? (
                                <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                                    <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                                        <Bookmark className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No saved prompts yet</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Browse the marketplace to find prompts you like.
                                    </p>
                                    <Button variant="outline" asChild>
                                        <Link href="/marketplace">Explore Marketplace</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {savedPrompts.map((saved, index) => {
                                            const prompt = saved.prompt;
                                            const inCart = isInCart(prompt.id);
                                            const isRemoving = removingIds.has(prompt.id);

                                            return (
                                                <motion.div
                                                    key={saved.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Card className={cn("overflow-hidden hover:border-primary/50 transition-colors", isRemoving && "opacity-50")}>
                                                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                                                            <Link href={`/marketplace/${prompt.id}`} className="shrink-0">
                                                                <div className="relative h-32 w-full sm:w-48 rounded-lg overflow-hidden bg-muted">
                                                                    {prompt.exampleImages[0] && (
                                                                        <Image
                                                                            src={prompt.exampleImages[0]}
                                                                            alt={prompt.title}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </Link>
                                                            <div className="flex-1 flex flex-col">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {CATEGORY_LABELS[prompt.category as keyof typeof CATEGORY_LABELS]}
                                                                            </Badge>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Saved {formatTimeAgo(saved.savedAt)}
                                                                            </span>
                                                                        </div>
                                                                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                                                            <Link href={`/marketplace/${prompt.id}`}>{prompt.title}</Link>
                                                                        </h3>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-amber-400">
                                                                        <Star className="h-4 w-4 fill-current" />
                                                                        <span className="text-sm font-medium">{prompt.rating.toFixed(1)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarImage src={prompt.creator.image || undefined} />
                                                                            <AvatarFallback className="text-[10px]">{prompt.creator.name?.[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-sm text-muted-foreground max-w-[100px] truncate">
                                                                            {prompt.creator.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleRemoveSaved(prompt.id)}
                                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleAddToCart(prompt)}
                                                                            className={cn(inCart ? "bg-green-500 hover:bg-green-600" : "")}
                                                                            disabled={inCart}
                                                                        >
                                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                                            {inCart ? "In Cart" : "Add to Cart"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4">
                            <div className="flex justify-end sm:hidden mb-4">
                                <Button className="w-full btn-premium" onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Prompt
                                </Button>
                            </div>

                            {customPrompts.length === 0 ? (
                                <div className="text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                                    <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                                        <PenTool className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Create your first prompt</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                        Write and save your own prompts. Keep them private or share them with the world.
                                    </p>
                                    <Button onClick={() => setIsDialogOpen(true)}>
                                        Create Prompt
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {customPrompts.map((custom, index) => (
                                            <motion.div
                                                key={custom.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
                                                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                                                        {/* Thumbnail Image */}
                                                        <div className="shrink-0 relative h-32 w-full sm:w-48 rounded-lg overflow-hidden bg-muted border border-border/50">
                                                            {custom.image ? (
                                                                <Image
                                                                    src={custom.image}
                                                                    alt={custom.title}
                                                                    fill
                                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                                                    <PenTool className="h-8 w-8 text-muted-foreground/30" />
                                                                </div>
                                                            )}
                                                            {/* Public/Private Badge overlay on image */}
                                                            <div className="absolute top-2 left-2">
                                                                {custom.isPublic ? (
                                                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm h-5 px-1.5 text-[10px] gap-1">
                                                                        <Globe className="h-3 w-3" /> Public
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm h-5 px-1.5 text-[10px] gap-1">
                                                                        <Lock className="h-3 w-3" /> Private
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Content Side */}
                                                        <div className="flex-1 flex flex-col min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div>
                                                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate pr-2">
                                                                        {custom.title}
                                                                    </h3>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Created {formatTimeAgo(custom.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Prompt Text Preview */}
                                                            <div className="bg-muted/30 border border-border/50 p-2.5 rounded-md text-xs font-mono text-muted-foreground line-clamp-2 mb-auto break-words">
                                                                {custom.promptText}
                                                            </div>

                                                            {/* Actions Footer */}
                                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="flex-1 h-8 text-xs font-medium"
                                                                    onClick={() => handleCopyToClipboard(custom.promptText)}
                                                                >
                                                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                                                    Copy
                                                                </Button>
                                                                <div className="w-px h-4 bg-border/50" />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="flex-1 h-8 text-xs font-medium text-primary hover:text-primary"
                                                                >
                                                                    <Link href={`/studio?prompt=${encodeURIComponent(custom.promptText)}`}>
                                                                        <Sparkles className="h-3.5 w-3.5 mr-2" />
                                                                        Use in Studio
                                                                    </Link>
                                                                </Button>
                                                                <div className="w-px h-4 bg-border/50" />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleRemoveCustom(custom.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </>
    );
}
