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
    ExternalLink,
    ShoppingCart,
    Sparkles,
    Star,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/stripe";
import { CATEGORY_LABELS } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
            <div className="flex flex-col sm:flex-row">
                <Skeleton className="h-48 sm:h-auto sm:w-48 shrink-0" />
                <CardContent className="p-4 flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

export default function PocketPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedPrompts, setSavedPrompts] = useState<SavedPromptData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const { addItem, isInCart } = useCartStore();

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user) {
            router.push("/sign-in?callbackUrl=/pocket");
            return;
        }

        const fetchPocket = async () => {
            try {
                const res = await fetch("/api/pocket");
                if (res.ok) {
                    const data = await res.json();
                    setSavedPrompts(data.savedPrompts);
                }
            } catch (error) {
                console.error("Error fetching pocket:", error);
                toast.error("Failed to load your Pocket");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPocket();
    }, [session, status, router]);

    const handleRemove = async (promptId: string) => {
        setRemovingIds((prev) => new Set(prev).add(promptId));

        try {
            const res = await fetch(`/api/pocket?promptId=${promptId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSavedPrompts((prev) =>
                    prev.filter((sp) => sp.prompt.id !== promptId)
                );
                toast.success("Removed from Pocket");
            } else {
                throw new Error("Failed to remove");
            }
        } catch (error) {
            console.error("Error removing from pocket:", error);
            toast.error("Failed to remove prompt");
        } finally {
            setRemovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(promptId);
                return newSet;
            });
        }
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
                <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
            <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
                <div className="section-container py-12">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
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
                                    {savedPrompts.length} saved prompt
                                    {savedPrompts.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content */}
                    {savedPrompts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="h-24 w-24 rounded-2xl gradient-bg-subtle mx-auto mb-6 flex items-center justify-center">
                                <Bookmark className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">
                                Your Pocket is empty
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Save prompts you love to revisit them later.
                                Browse the marketplace to discover amazing prompts.
                            </p>
                            <Button className="btn-premium" asChild>
                                <Link href="/marketplace">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Explore Marketplace
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {savedPrompts.map((saved, index) => {
                                    const prompt = saved.prompt;
                                    const inCart = isInCart(prompt.id);
                                    const isRemoving = removingIds.has(prompt.id);

                                    return (
                                        <motion.div
                                            key={saved.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ delay: index * 0.05 }}
                                            layout
                                        >
                                            <Card
                                                className={cn(
                                                    "overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20",
                                                    isRemoving && "opacity-50"
                                                )}
                                            >
                                                <div className="flex flex-col sm:flex-row">
                                                    {/* Image */}
                                                    <Link
                                                        href={`/marketplace/${prompt.id}`}
                                                        className="relative h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden bg-muted group"
                                                    >
                                                        {prompt.exampleImages[0] ? (
                                                            <Image
                                                                src={prompt.exampleImages[0]}
                                                                alt={prompt.title}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Sparkles className="h-12 w-12 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 left-2">
                                                            <Badge className="badge-gradient">
                                                                {formatPrice(prompt.price)}
                                                            </Badge>
                                                        </div>
                                                    </Link>

                                                    {/* Content */}
                                                    <CardContent className="p-4 flex-1 flex flex-col">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {CATEGORY_LABELS[prompt.category as keyof typeof CATEGORY_LABELS]}
                                                                    </Badge>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        Saved {formatTimeAgo(saved.savedAt)}
                                                                    </span>
                                                                </div>
                                                                <Link
                                                                    href={`/marketplace/${prompt.id}`}
                                                                    className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                                                                >
                                                                    {prompt.title}
                                                                </Link>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                            {prompt.description}
                                                        </p>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {prompt.tags.slice(0, 4).map((tag) => (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="mt-auto flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {/* Creator */}
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage
                                                                            src={prompt.creator.image || undefined}
                                                                        />
                                                                        <AvatarFallback className="text-xs gradient-bg text-white">
                                                                            {prompt.creator.name?.[0] || "?"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {prompt.creator.name || "Anonymous"}
                                                                    </span>
                                                                </div>

                                                                {/* Rating */}
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                                    <span className="text-sm">
                                                                        {prompt.rating.toFixed(1)}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ({prompt.reviewCount})
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemove(prompt.id)}
                                                                    disabled={isRemoving}
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link href={`/marketplace/${prompt.id}`}>
                                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className={cn(
                                                                        inCart
                                                                            ? "bg-green-500 hover:bg-green-600"
                                                                            : "btn-premium"
                                                                    )}
                                                                    onClick={() => handleAddToCart(prompt)}
                                                                    disabled={inCart}
                                                                >
                                                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                                                    {inCart ? "In Cart" : "Add"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
