"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/stripe";
import { CATEGORY_LABELS } from "@/types";
import type { PromptCardData } from "@/types";
import { cn } from "@/lib/utils";

interface PromptCardProps {
    prompt: PromptCardData;
    onPreview?: (prompt: PromptCardData) => void;
}

export function PromptCard({ prompt, onPreview }: PromptCardProps) {
    const { addItem, isInCart, openCart } = useCartStore();
    const inCart = isInCart(prompt.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (inCart) {
            openCart();
        } else {
            addItem(prompt);
        }
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onPreview?.(prompt);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link href={`/marketplace/${prompt.id}`}>
                <Card className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 h-full bg-card/50">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {prompt.exampleImages[0] ? (
                            <Image
                                src={prompt.exampleImages[0]}
                                alt={prompt.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="h-16 w-16 rounded-xl gradient-bg-subtle flex items-center justify-center">
                                    <ShoppingCart className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1 backdrop-blur-sm bg-white/90 hover:bg-white text-black"
                                    onClick={handlePreview}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    className={cn(
                                        "flex-1 backdrop-blur-sm",
                                        inCart
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "btn-premium"
                                    )}
                                    onClick={handleAddToCart}
                                >
                                    {inCart ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            In Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Add
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-3 right-3">
                            <Badge className="badge-gradient text-sm font-semibold px-3 py-1 shadow-lg">
                                {formatPrice(prompt.price)}
                            </Badge>
                        </div>
                    </div>

                    <CardContent className="p-4">
                        {/* Category */}
                        <Badge variant="outline" className="mb-2 text-xs">
                            {CATEGORY_LABELS[prompt.category]}
                        </Badge>

                        {/* Title */}
                        <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                            {prompt.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {prompt.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {prompt.tags.slice(0, 3).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {prompt.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    +{prompt.tags.length - 3}
                                </Badge>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            {/* Creator */}
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={prompt.creator.image || undefined}
                                        alt={prompt.creator.name || "Creator"}
                                    />
                                    <AvatarFallback className="text-xs gradient-bg text-white">
                                        {prompt.creator.name?.[0]?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                                    {prompt.creator.name || "Anonymous"}
                                </span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">
                                    {prompt.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({prompt.reviewCount})
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
