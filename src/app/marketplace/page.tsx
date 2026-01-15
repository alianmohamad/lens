import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { PromptGrid } from "@/components/marketplace/prompt-grid";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PromptCardData } from "@/types";

interface MarketplacePageProps {
    searchParams: Promise<{
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
        search?: string;
        sortBy?: string;
        page?: string;
    }>;
}

async function getPrompts(searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    search?: string;
    sortBy?: string;
    page?: string;
}) {
    const page = parseInt(searchParams.page || "1");
    const pageSize = 12;

    // Build where clause
    const where: Record<string, unknown> = {
        status: "APPROVED",
    };

    if (searchParams.category) {
        where.category = searchParams.category;
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
        where.price = {};
        if (searchParams.minPrice) {
            (where.price as Record<string, number>).gte = parseInt(searchParams.minPrice);
        }
        if (searchParams.maxPrice) {
            (where.price as Record<string, number>).lte = parseInt(searchParams.maxPrice);
        }
    }

    if (searchParams.minRating) {
        where.rating = { gte: parseFloat(searchParams.minRating) };
    }

    if (searchParams.search) {
        where.OR = [
            { title: { contains: searchParams.search, mode: "insensitive" } },
            { description: { contains: searchParams.search, mode: "insensitive" } },
        ];
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (searchParams.sortBy) {
        case "popular":
            orderBy = { salesCount: "desc" };
            break;
        case "rating":
            orderBy = { rating: "desc" };
            break;
        case "price_low":
            orderBy = { price: "asc" };
            break;
        case "price_high":
            orderBy = { price: "desc" };
            break;
    }

    const [prompts, total] = await Promise.all([
        prisma.prompt.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        }),
        prisma.prompt.count({ where }),
    ]);

    return {
        prompts: prompts as unknown as PromptCardData[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PromptGridSkeleton() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="aspect-4/3 rounded-xl" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between pt-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
    const resolvedParams = await searchParams;

    let prompts: PromptCardData[] = [];
    let total: number = 0;

    try {
        const data = await getPrompts(resolvedParams);
        prompts = data.prompts;
        total = data.total;
    } catch (error) {
        console.error("Failed to fetch prompts:", error);
        // Fallback to empty state
        prompts = [];
        total = 0;
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-4">Marketplace</Badge>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Discover <span className="gradient-text">Expert Prompts</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Browse {total.toLocaleString()} prompts from professional photographers and AI specialists
                    </p>
                </div>

                {/* Filters */}
                <Suspense fallback={<Skeleton className="h-11 w-full" />}>
                    <MarketplaceFilters />
                </Suspense>

                {/* Results */}
                <div className="mt-8">
                    {prompts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="h-10 w-10 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your filters or search terms
                            </p>
                        </div>
                    ) : (
                        <div className="grid-cols-1">
                            <PromptGrid prompts={prompts} />
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
