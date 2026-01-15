"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ShoppingBag,
    Calendar,
    Image as ImageIcon,
    ExternalLink,
    Search,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CATEGORY_LABELS } from "@/types";
import type { Category } from "@/types";

interface PurchasedPrompt {
    id: string;
    amount: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
        description: string;
        category: Category;
        exampleImages: string[];
        creator: {
            id: string;
            name: string | null;
            image: string | null;
        };
    };
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function PurchaseSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PurchasesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [purchases, setPurchases] = useState<PurchasedPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        async function fetchPurchases() {
            try {
                const response = await fetch("/api/user/purchases");
                const data = await response.json();
                if (data.success && data.data) {
                    setPurchases(data.data);
                    const total = data.data.reduce(
                        (sum: number, p: PurchasedPrompt) => sum + p.amount,
                        0
                    );
                    setTotalSpent(total);
                }
            } catch (err) {
                console.error("Failed to fetch purchases:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (session?.user) {
            fetchPurchases();
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        router.push("/sign-in?callbackUrl=/dashboard/purchases");
        return null;
    }

    const filteredPurchases = purchases.filter((purchase) =>
        purchase.prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold">
                                My Purchases
                            </h1>
                            <p className="text-muted-foreground">
                                View and manage your purchased prompts
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                <p className="text-2xl font-bold gradient-text">
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{purchases.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{purchases.length}</p>
                                    <p className="text-sm text-muted-foreground">Active Prompts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-cyan-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Unlimited</p>
                                    <p className="text-sm text-muted-foreground">Generations</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search purchases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>
                </div>

                {/* Purchases List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <PurchaseSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery ? "No matching purchases" : "No purchases yet"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery
                                    ? "Try adjusting your search terms"
                                    : "Start exploring the marketplace to find amazing prompts"}
                            </p>
                            {!searchQuery && (
                                <Button asChild>
                                    <Link href="/marketplace">Browse Marketplace</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredPurchases.map((purchase, index) => (
                            <motion.div
                                key={purchase.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                                                {purchase.prompt.exampleImages?.[0] ? (
                                                    <img
                                                        src={purchase.prompt.exampleImages[0]}
                                                        alt={purchase.prompt.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <Badge variant="outline" className="mb-2">
                                                            {CATEGORY_LABELS[purchase.prompt.category]}
                                                        </Badge>
                                                        <h3 className="font-semibold truncate">
                                                            {purchase.prompt.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {purchase.prompt.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(purchase.createdAt)}
                                                            </span>
                                                            <span>
                                                                by {purchase.prompt.creator.name || "Unknown"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="font-semibold">
                                                            {formatCurrency(purchase.amount)}
                                                        </p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/marketplace/${purchase.prompt.id}`}>
                                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            <Button size="sm" asChild>
                                                                <Link href="/studio">
                                                                    Use in Studio
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
