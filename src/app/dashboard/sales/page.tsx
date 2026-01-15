"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    Calendar,
    Image as ImageIcon,
    User,
    Search,
    Package,
    ArrowUpRight,
    Lock,
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

interface Sale {
    id: string;
    amount: number;
    sellerEarnings: number;
    platformFee: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
        category: Category;
        exampleImages: string[];
    };
    user: {
        id: string;
        name: string | null;
        image: string | null;
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

function SaleSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function SalesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        async function fetchSales() {
            try {
                const response = await fetch("/api/user/sales");
                const data = await response.json();
                if (data.success) {
                    setSales(data.data || []);
                    setTotalEarnings(data.stats?.totalEarnings || 0);
                    setTotalRevenue(data.stats?.totalRevenue || 0);
                }
            } catch (err) {
                console.error("Failed to fetch sales:", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (session?.user) {
            fetchSales();
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
        router.push("/sign-in?callbackUrl=/dashboard/sales");
        return null;
    }

    const isSeller = session.user.role === "SELLER" || session.user.role === "ADMIN";

    if (!isSeller) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="section-container py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Seller Access Required</h1>
                        <p className="text-muted-foreground mb-6">
                            You need a seller account to view sales. Upgrade your account to start
                            selling prompts and earning money.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/settings">Upgrade to Seller</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const filteredSales = sales.filter((sale) =>
        sale.prompt.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                                My Sales
                            </h1>
                            <p className="text-muted-foreground">
                                Track your earnings and sales performance
                            </p>
                        </div>
                        <Button className="btn-premium" asChild>
                            <Link href="/sell">
                                <Package className="h-4 w-4 mr-2" />
                                Create New Prompt
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                                    <p className="text-2xl font-bold text-green-500">
                                        {formatCurrency(totalEarnings)}
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
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Sales</p>
                                    <p className="text-2xl font-bold">{sales.length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>All time</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Gross Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-cyan-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                <span>Before platform fee</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search sales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>
                </div>

                {/* Sales List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SaleSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredSales.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery ? "No matching sales" : "No sales yet"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery
                                    ? "Try adjusting your search terms"
                                    : "Create and publish prompts to start earning"}
                            </p>
                            {!searchQuery && (
                                <Button asChild>
                                    <Link href="/sell">Create Your First Prompt</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredSales.map((sale, index) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                {sale.prompt.exampleImages?.[0] ? (
                                                    <img
                                                        src={sale.prompt.exampleImages[0]}
                                                        alt={sale.prompt.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <Badge variant="outline" className="mb-1">
                                                    {CATEGORY_LABELS[sale.prompt.category]}
                                                </Badge>
                                                <h3 className="font-semibold truncate">
                                                    {sale.prompt.title}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {sale.user.name || "Anonymous"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(sale.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Earnings */}
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold text-green-500">
                                                    +{formatCurrency(sale.sellerEarnings)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    of {formatCurrency(sale.amount)}
                                                </p>
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
