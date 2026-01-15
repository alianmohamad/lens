import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 section-container py-8">
                {/* Header Skeleton - Matches page title area */}
                <div className="mb-8">
                    <Skeleton className="h-6 w-24 rounded-full mb-4" />
                    <Skeleton className="h-10 w-64 sm:w-96 mb-2" />
                    <Skeleton className="h-5 w-full max-w-lg text-muted-foreground" />
                </div>

                {/* Filter Bar Skeleton - Matches MarketplaceFilters layout */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Skeleton className="h-11 flex-1 rounded-md" />
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Skeleton className="h-11 w-full sm:w-[180px] rounded-md" />
                        <Skeleton className="h-11 w-24 rounded-md" />
                    </div>
                </div>

                {/* Results Grid - Matches page grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <MarketplaceCardSkeleton key={i} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function MarketplaceCardSkeleton() {
    return (
        <Card className="overflow-hidden border-2 border-transparent h-full bg-card/50 p-0 gap-0">
            {/* Image Container - Matches PromptCard aspect ratio */}
            <div className="relative aspect-4/3 bg-primary/5">
                <Skeleton className="h-full w-full" />
            </div>

            <CardContent className="p-4">
                {/* Category Badge */}
                <Skeleton className="h-5 w-20 mb-3 rounded-md" />

                {/* Title */}
                <Skeleton className="h-6 w-4/5 mb-2" />

                {/* Description Lines */}
                <div className="space-y-1.5 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 mb-4">
                    <Skeleton className="h-5 w-14 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                </div>

                {/* Footer (Creator + Rating) */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                </div>
            </CardContent>
        </Card>
    );
}
