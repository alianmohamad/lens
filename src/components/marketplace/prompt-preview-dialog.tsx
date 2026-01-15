"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShoppingCart, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/stripe";
import { CATEGORY_LABELS, PromptCardData } from "@/types";
import { cn } from "@/lib/utils";

interface PromptPreviewDialogProps {
    prompt: PromptCardData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PromptPreviewDialog({ prompt, open, onOpenChange }: PromptPreviewDialogProps) {
    const { addItem, isInCart } = useCartStore();

    if (!prompt) return null;

    const inCart = isInCart(prompt.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0 bg-card/95 backdrop-blur-xl border-border sm:rounded-3xl shadow-2xl">
                <div className="sr-only">
                    <DialogTitle>{prompt.title} Preview</DialogTitle>
                </div>

                <div className="grid md:grid-cols-2 h-[85vh] md:h-[600px]">
                    {/* Image Side */}
                    <div className="relative h-64 md:h-full bg-muted/20">
                        {prompt.exampleImages[0] ? (
                            <Image
                                src={prompt.exampleImages[0]}
                                alt={prompt.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No preview image
                            </div>
                        )}
                        {/* Mobile Close Button */}
                        <DialogClose className="absolute top-4 right-4 md:hidden bg-black/60 text-white rounded-full p-2 backdrop-blur-md z-50 hover:bg-black/80 transition-colors">
                            <X className="h-4 w-4" />
                        </DialogClose>
                    </div>

                    {/* Content Side */}
                    <div className="flex flex-col h-full p-6 md:p-8 overflow-y-auto custom-scrollbar bg-card/50">
                        <div className="flex items-start justify-between mb-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                {CATEGORY_LABELS[prompt.category]}
                            </Badge>
                            <DialogClose className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full hover:bg-muted">
                                <X className="h-4 w-4" />
                            </DialogClose>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 leading-tight">{prompt.title}</h2>

                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
                            <Avatar className="h-8 w-8 ring-2 ring-background">
                                <AvatarImage src={prompt.creator.image || undefined} />
                                <AvatarFallback>{prompt.creator.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{prompt.creator.name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center text-amber-400">
                                        <Star className="h-3 w-3 fill-current mr-1" />
                                        {prompt.rating.toFixed(1)}
                                    </span>
                                    <span>•</span>
                                    <span>{prompt.reviewCount} reviews</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Description</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{prompt.description}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {prompt.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="bg-background/50">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-border/50">
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold font-display text-primary">{formatPrice(prompt.price)}</span>
                                <span className="text-xs text-muted-foreground">Personal License</span>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className={cn("flex-1 h-12 text-base shadow-lg shadow-primary/20", inCart ? "bg-green-600 hover:bg-green-700" : "btn-premium")}
                                    onClick={() => addItem(prompt)}
                                    disabled={inCart}
                                >
                                    {inCart ? (
                                        <>
                                            <Check className="h-5 w-5 mr-2" /> Added
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                                        </>
                                    )}
                                </Button>
                                <Button variant="secondary" asChild className="h-12 px-6 bg-muted/50 hover:bg-muted border border-border/50">
                                    <Link href={`/marketplace/${prompt.id}`}>Details</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
