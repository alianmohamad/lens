"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingBag,
    TrendingUp,
    Settings,
    Image,
    Store,
    DollarSign,
    Star,
    Package,
    ArrowRight,
    ArrowUpRight,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Mock data - would come from API
const buyerStats = {
    totalPurchases: 12,
    totalSpent: 8995, // cents
    totalGenerations: 47,
    recentPurchases: [
        {
            id: "1",
            title: "Luxury Product Showcase",
            date: "2 hours ago",
            price: 499,
        },
        {
            id: "2",
            title: "Minimalist White Background",
            date: "Yesterday",
            price: 299,
        },
    ],
};

const sellerStats = {
    totalEarnings: 345000, // cents
    totalSales: 156,
    activePrompts: 12,
    averageRating: 4.8,
    recentSales: [
        {
            id: "1",
            title: "Pro Product Studio",
            buyer: "John D.",
            amount: 699,
            date: "1 hour ago",
        },
        {
            id: "2",
            title: "Fashion Lifestyle",
            buyer: "Sarah M.",
            amount: 599,
            date: "3 hours ago",
        },
    ],
};

function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={session.user.image || undefined} />
                            <AvatarFallback className="text-xl gradient-bg text-white">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Welcome back, {session.user.name?.split(" ")[0] || "there"}!
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{session.user.role}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Member since Jan 2024
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Link>
                        </Button>
                        {isSeller ? (
                            <Button className="btn-premium" asChild>
                                <Link href="/sell">
                                    <Store className="h-4 w-4 mr-2" />
                                    Create Prompt
                                </Link>
                            </Button>
                        ) : (
                            <Button className="btn-premium" asChild>
                                <Link href="/studio">
                                    <Image className="h-4 w-4 mr-2" />
                                    Go to Studio
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {isSeller ? (
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
                                                    {formatCurrency(sellerStats.totalEarnings)}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <DollarSign className="h-6 w-6 text-green-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>12% from last month</span>
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
                                                <p className="text-2xl font-bold">{sellerStats.totalSales}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>8 sales this week</span>
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
                                                <p className="text-sm text-muted-foreground">Active Prompts</p>
                                                <p className="text-2xl font-bold">{sellerStats.activePrompts}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-cyan-500" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/prompts"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            Manage prompts
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
                                                    <p className="text-2xl font-bold">{sellerStats.averageRating}</p>
                                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                </div>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                <Star className="h-6 w-6 text-amber-500" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Based on 89 reviews
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
                                                <p className="text-2xl font-bold">{buyerStats.totalPurchases}</p>
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
                                                    {formatCurrency(buyerStats.totalSpent)}
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
                                                <p className="text-2xl font-bold">{buyerStats.totalGenerations}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                                <Image className="h-6 w-6 text-cyan-500" />
                                            </div>
                                        </div>
                                        <Link
                                            href="/dashboard/history"
                                            className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                                        >
                                            View history
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
                            {isSeller ? (
                                <div className="space-y-4">
                                    {sellerStats.recentSales.map((sale) => (
                                        <div
                                            key={sale.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg gradient-bg-subtle flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{sale.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Purchased by {sale.buyer}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-500">
                                                    +{formatCurrency(sale.amount * 0.7)}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {sale.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {buyerStats.recentPurchases.map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg gradient-bg-subtle flex items-center justify-center">
                                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{purchase.title}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {purchase.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(purchase.price)}</p>
                                        </div>
                                    ))}
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
                                    <Image className="h-8 w-8 text-primary mb-3" />
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
