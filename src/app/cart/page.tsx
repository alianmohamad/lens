"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    ShoppingCart,
    Trash2,
    ArrowRight,
    ArrowLeft,
    CreditCard,
    Shield,
    Lock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/stripe";
import { CATEGORY_LABELS } from "@/types";

function CartContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const { items, removeItem, clearCart, getSubtotal, getTotal } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [mounted, setMounted] = useState(false);

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (success === "true") {
            clearCart();
        }
    }, [success, clearCart]);

    const handleCheckout = async () => {
        if (!session) {
            router.push("/sign-in?callbackUrl=/cart");
            return;
        }

        setIsCheckingOut(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    promptIds: items.map((item) => item.promptId),
                }),
            });

            const data = await response.json();

            if (data.success && data.data.url) {
                window.location.href = data.data.url;
            } else {
                throw new Error(data.error || "Failed to create checkout session");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            // Show error toast
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <>
            {/* Success Message */}
            {success === "true" && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-xl bg-green-500/10 border border-green-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-600 dark:text-green-400">
                                Payment Successful!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Your prompts are now available in your{" "}
                                <Link href="/dashboard/purchases" className="underline">
                                    dashboard
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Canceled Message */}
            {canceled === "true" && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-600 dark:text-amber-400">
                                Checkout Canceled
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Your cart items are still saved. Continue when you&apos;re ready.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div className="mb-8">
                <Badge className="mb-4">Shopping Cart</Badge>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Your <span className="gradient-text">Cart</span>
                </h1>
                <p className="text-muted-foreground">
                    Review your selected prompts before checkout
                </p>
            </div>

            {items.length === 0 && !success ? (
                /* Empty Cart */
                <div className="text-center py-16">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-display font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Explore our marketplace to discover amazing AI prompts for your
                        product photography needs.
                    </p>
                    <Button size="lg" className="btn-premium" asChild>
                        <Link href="/marketplace">
                            Browse Marketplace
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            ) : items.length > 0 ? (
                /* Cart Content */
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.promptId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex gap-4 p-4">
                                            {/* Thumbnail */}
                                            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-lg overflow-hidden bg-muted shrink-0">
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
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <Link
                                                            href={`/marketplace/${item.promptId}`}
                                                            className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                                        >
                                                            {item.prompt.title}
                                                        </Link>
                                                        <Badge variant="outline" className="mt-1 text-xs">
                                                            {CATEGORY_LABELS[item.prompt.category]}
                                                        </Badge>
                                                    </div>
                                                    <span className="font-bold text-lg shrink-0 gradient-text">
                                                        {formatPrice(item.prompt.price)}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 hidden md:block">
                                                    {item.prompt.description}
                                                </p>

                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>By {item.prompt.creator?.name || "Anonymous"}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeItem(item.promptId)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Continue Shopping */}
                        <Link
                            href="/marketplace"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                                        </span>
                                        <span>{formatPrice(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Processing Fee</span>
                                        <span className="text-green-500">Free</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-xl gradient-text">
                                        {formatPrice(getTotal())}
                                    </span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-12 btn-premium"
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || status === "loading"}
                                >
                                    {isCheckingOut ? (
                                        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            {session ? "Proceed to Checkout" : "Sign in to Checkout"}
                                        </>
                                    )}
                                </Button>

                                {/* Trust Badges */}
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Shield className="h-5 w-5 text-green-500" />
                                        <span>Secure checkout with Stripe</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Lock className="h-5 w-5 text-green-500" />
                                        <span>Your payment info is encrypted</span>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                                    <svg className="h-8" viewBox="0 0 50 32" fill="currentColor">
                                        <rect width="50" height="32" rx="4" fill="#1A1F36" />
                                        <path d="M15 12h20v8H15z" fill="#00D4FF" />
                                    </svg>
                                    <svg className="h-8" viewBox="0 0 50 32" fill="currentColor">
                                        <rect width="50" height="32" rx="4" fill="#1A1F36" />
                                        <circle cx="20" cy="16" r="8" fill="#EB001B" />
                                        <circle cx="30" cy="16" r="8" fill="#F79E1B" opacity="0.8" />
                                    </svg>
                                    <svg className="h-8" viewBox="0 0 50 32" fill="currentColor">
                                        <rect width="50" height="32" rx="4" fill="#1A1F36" />
                                        <path d="M12 10h26v12H12z" fill="#1D3461" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </>
    );
}

function CartLoading() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function CartPage() {
    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                <Suspense fallback={<CartLoading />}>
                    <CartContent />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
