"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShoppingBag,
    TrendingUp,
    Settings,
    Image as ImageIcon,
    Store,
    DollarSign,
    Star,
    Package,
    ArrowRight,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface BuyerStats {
    totalPurchases: number;
    totalSpent: number;
    totalGenerations: number;
}

interface SellerStats {
    totalEarnings: number;
    totalSales: number;
    approvedPrompts: number;
    averageRating: number;
}

interface RecentPurchase {
    id: string;
    amount: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
    };
}

interface RecentSale {
    id: string;
    amount: number;
    sellerEarnings: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
    };
    user: {
        name: string | null;
    };
}

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMemberSince(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
        </Card>
    );
}

function ActivityItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-5 w-16" />
        </div>
    );
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [buyerStats, setBuyerStats] = useState<BuyerStats | null>(null);
    const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
    const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!session?.user) return;

            try {
                // Fetch profile and stats
                const profileResponse = await fetch("/api/user/profile");
                const profileData = await profileResponse.json();

                if (profileData.success && profileData.data) {
                    setProfile(profileData.data.user);

                    const isSeller =
                        profileData.data.user.role === "SELLER" ||
                        profileData.data.user.role === "ADMIN";

                    if (isSeller) {
                        setSellerStats({
                            totalEarnings: profileData.data.stats.totalEarnings || 0,
                            totalSales: profileData.data.stats.totalSales || 0,
                            approvedPrompts: profileData.data.stats.approvedPrompts || 0,
                            averageRating: profileData.data.stats.averageRating || 0,
                        });

                        // Fetch recent sales
                        const salesResponse = await fetch("/api/user/sales?limit=3");
                        const salesData = await salesResponse.json();
                        if (salesData.success && salesData.data) {
                            setRecentSales(salesData.data);
                        }
                    } else {
                        setBuyerStats({
                            totalPurchases: profileData.data.stats.totalPurchases || 0,
                            totalSpent: profileData.data.stats.totalSpent || 0,
                            totalGenerations: profileData.data.stats.totalGenerations || 0,
                        });
                    }

                    // Fetch recent purchases (for all users)
                    const purchasesResponse = await fetch("/api/user/purchases?limit=3");
                    const purchasesData = await purchasesResponse.json();
                    if (purchasesData.success && purchasesData.data) {
                        setRecentPurchases(purchasesData.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [session]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        router.push("/sign-in?callbackUrl=/dashboard");
        return null;
    }

    const isSeller = session.user.role === "SELLER" || session.user.role === "ADMIN";

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.06) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)' }} />
            <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(251, 191, 136, 0.05) 0%, transparent 60%)' }} />

            <Navbar />

            <main className="section-container py-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 ring-2 ring-neon/20">
                            <AvatarImage src={session.user.image || undefined} />
                            <AvatarFallback className="text-xl bg-gradient-to-br from-neon to-cool-indigo text-white">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold">
                                Welcome back, <span className="hero-gradient-text">{session.user.name?.split(" ")[0] || "there"}!</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="pill text-xs py-1 px-3">{session.user.role}</span>
                                <span className="text-sm text-muted-foreground">
                                    {profile?.createdAt
                                        ? `Member since ${formatMemberSince(profile.createdAt)}`
                                        : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="btn-ghost" asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Link>
                        </Button>
                        {isSeller ? (
                            <button className="btn-cta flex items-center gap-2">
                                <Link href="/sell" className="flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Create Prompt
                                </Link>
                            </button>
                        ) : (
                            <button className="btn-cta flex items-center gap-2">
                                <Link href="/studio" className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Go to Studio
                                </Link>
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {isLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : isSeller ? (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Earnings</p>
                                                <p className="text-2xl font-bold gradient-text">
                                                    {formatCurrency(sellerStats?.totalEarnings || 0)}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <DollarSign className="h-6 w-6 text-green-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                            <span>After 30% platform fee</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Sales</p>
                                                <p className="text-2xl font-bold">{sellerStats?.totalSales || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/sales"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            View all sales
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Active Prompts</p>
                                                <p className="text-2xl font-bold">{sellerStats?.approvedPrompts || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-cyan-500" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/sell"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            Create new prompt
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-2xl font-bold">
                                                        {sellerStats?.averageRating
                                                            ? sellerStats.averageRating.toFixed(1)
                                                            : "N/A"}
                                                    </p>
                                                    {sellerStats?.averageRating ? (
                                                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                <Star className="h-6 w-6 text-amber-500" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {sellerStats?.averageRating
                                                ? "Based on customer reviews"
                                                : "No reviews yet"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Purchased Prompts</p>
                                                <p className="text-2xl font-bold">{buyerStats?.totalPurchases || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <ShoppingBag className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/purchases"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            View all
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                                <p className="text-2xl font-bold gradient-text">
                                                    {formatCurrency(buyerStats?.totalSpent || 0)}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <DollarSign className="h-6 w-6 text-green-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Images Generated</p>
                                                <p className="text-2xl font-bold">{buyerStats?.totalGenerations || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-cyan-500" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/studio"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            Generate more
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="relative overflow-hidden">
                                    <div className="absolute inset-0 animated-gradient opacity-10" />
                                    <CardContent className="pt-6 relative">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Want to earn money?
                                            </p>
                                            <p className="font-semibold mb-3">Become a Seller</p>
                                            <Button size="sm" variant="secondary" asChild>
                                                <Link href="/dashboard/settings">
                                                    Upgrade Account
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recent Purchases/Sales */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">
                                {isSeller ? "Recent Sales" : "Recent Purchases"}
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={isSeller ? "/dashboard/sales" : "/dashboard/purchases"}>
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    <ActivityItemSkeleton />
                                    <ActivityItemSkeleton />
                                    <ActivityItemSkeleton />
                                </div>
                            ) : isSeller ? (
                                recentSales.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentSales.map((sale) => (
                                            <div
                                                key={sale.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg gradient-bg-subtle flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{sale.prompt.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Purchased by {sale.user.name || "Anonymous"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-500">
                                                        +{formatCurrency(sale.sellerEarnings)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatRelativeTime(sale.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No sales yet</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/sell">Create your first prompt</Link>
                                        </Button>
                                    </div>
                                )
                            ) : recentPurchases.length > 0 ? (
                                <div className="space-y-4">
                                    {recentPurchases.map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg gradient-bg-subtle flex items-center justify-center">
                                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{purchase.prompt.title}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatRelativeTime(purchase.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(purchase.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No purchases yet</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/marketplace">Browse marketplace</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link
                                    href="/marketplace"
                                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                >
                                    <Store className="h-8 w-8 text-primary mb-3" />
                                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                        Browse Marketplace
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Discover new prompts
                                    </p>
                                </Link>

                                <Link
                                    href="/studio"
                                    className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                >
                                    <ImageIcon className="h-8 w-8 text-primary mb-3" />
                                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                        Open Studio
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Generate new images
                                    </p>
                                </Link>

                                {isSeller ? (
                                    <>
                                        <Link
                                            href="/sell"
                                            className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                        >
                                            <Package className="h-8 w-8 text-primary mb-3" />
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                                Create Prompt
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Add a new product
                                            </p>
                                        </Link>

                                        <Link
                                            href="/dashboard/sales"
                                            className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                        >
                                            <TrendingUp className="h-8 w-8 text-primary mb-3" />
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                                View Analytics
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Track your performance
                                            </p>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/dashboard/purchases"
                                            className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                        >
                                            <ShoppingBag className="h-8 w-8 text-primary mb-3" />
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                                My Prompts
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                View purchased prompts
                                            </p>
                                        </Link>

                                        <Link
                                            href="/dashboard/settings"
                                            className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                                        >
                                            <Settings className="h-8 w-8 text-primary mb-3" />
                                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                                Settings
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your account
                                            </p>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
