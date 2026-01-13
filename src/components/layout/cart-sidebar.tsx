"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/stripe";

export function CartSidebar() {
    const { items, isOpen, closeCart, removeItem, getSubtotal, getTotal } =
        useCartStore();

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Shopping Cart</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {items.length} {items.length === 1 ? "item" : "items"}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeCart}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Cart Items */}
                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">Your cart is empty</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                                    Explore our marketplace to discover amazing AI prompts for your
                                    product photography needs.
                                </p>
                                <Button onClick={closeCart} asChild>
                                    <Link href="/marketplace">
                                        Browse Marketplace
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.promptId}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="flex gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    {item.prompt.exampleImages[0] ? (
                                                        <Image
                                                            src={item.prompt.exampleImages[0]}
                                                            alt={item.prompt.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm line-clamp-1 mb-1">
                                                        {item.prompt.title}
                                                    </h4>
                                                    <Badge variant="outline" className="text-xs mb-2">
                                                        {item.prompt.category}
                                                    </Badge>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-primary">
                                                            {formatPrice(item.prompt.price)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeItem(item.promptId)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Footer */}
                                <div className="border-t border-border p-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(getSubtotal())}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span className="text-lg gradient-text">
                                                {formatPrice(getTotal())}
                                            </span>
                                        </div>
                                    </div>

                                    <Button className="w-full btn-premium" size="lg" asChild>
                                        <Link href="/cart" onClick={closeCart}>
                                            Proceed to Checkout
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={closeCart}
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
