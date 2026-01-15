import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="section-container py-8 flex-1">
                {/* Header Skeleton */}
                <div className="mb-8 space-y-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-10 w-96 max-w-full" />
                    <Skeleton className="h-5 w-full max-w-xl" />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Input Area */}
                    <div className="space-y-6">
                        {/* Upload Card Skeleton */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center p-8">
                                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                                        <Skeleton className="h-16 w-16 rounded-2xl bg-muted-foreground/10" />
                                        <Skeleton className="h-4 w-48 bg-muted/60" />
                                        <Skeleton className="h-4 w-32 bg-muted/60" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prompt Selection Skeleton */}
                        <Card>
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-40 bg-muted/60" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Skeleton className="h-9 w-24" />
                                    <Skeleton className="h-9 w-32" />
                                </div>
                                <Skeleton className="h-12 w-full" />
                            </CardContent>
                        </Card>

                        {/* Generate Button Skeleton */}
                        <Skeleton className="h-14 w-full rounded-md bg-muted/60" />

                        {/* Progress Bar Placeholder */}
                        <Skeleton className="h-4 w-full bg-muted/60 opacity-0" />
                    </div>

                    {/* Right Column - Result Area */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-40 bg-muted/60" />
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center p-8">
                                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                                        <Skeleton className="h-16 w-16 rounded-2xl bg-muted-foreground/10" />
                                        <Skeleton className="h-4 w-56 bg-muted/60" />
                                        <Skeleton className="h-4 w-40 bg-muted/60" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* How It Works Skeleton */}
                <div className="mt-16 space-y-6">
                    <Skeleton className="h-8 w-48 bg-muted/60" />
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
