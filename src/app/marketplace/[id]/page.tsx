import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Star,
    ShoppingCart,
    ArrowLeft,
    Check,
    Shield,
    Zap,
    Download,
} from "lucide-react";
import { formatPrice } from "@/lib/stripe";
import { CATEGORY_LABELS } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";

interface PromptDetailPageProps {
    params: Promise<{ id: string }>;
}

async function getPrompt(id: string) {
    const prompt = await prisma.prompt.findUnique({
        where: { id, status: "APPROVED" },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true,
                    _count: {
                        select: {
                            prompts: {
                                where: { status: "APPROVED" },
                            },
                        },
                    },
                },
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            },
            _count: {
                select: {
                    reviews: true,
                    purchases: true,
                },
            },
        },
    });

    return prompt;
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
    const { id } = await params;
    const prompt = await getPrompt(id);

    if (!prompt) {
        notFound();
    }

    // Rating distribution mock
    const ratingDistribution = [
        { stars: 5, count: Math.floor(prompt._count.reviews * 0.6) },
        { stars: 4, count: Math.floor(prompt._count.reviews * 0.25) },
        { stars: 3, count: Math.floor(prompt._count.reviews * 0.1) },
        { stars: 2, count: Math.floor(prompt._count.reviews * 0.03) },
        { stars: 1, count: Math.floor(prompt._count.reviews * 0.02) },
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/marketplace"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Marketplace
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Image */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                            {prompt.exampleImages[0] ? (
                                <Image
                                    src={prompt.exampleImages[0]}
                                    alt={prompt.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <div className="h-24 w-24 rounded-2xl gradient-bg-subtle flex items-center justify-center">
                                        <ShoppingCart className="h-12 w-12 text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {prompt.exampleImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {prompt.exampleImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0"
                                    >
                                        <Image
                                            src={image}
                                            alt={`Example ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-line">
                                    {prompt.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* What's Included */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What's Included</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>Full prompt text for AI generation</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>Commercial usage rights</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>Unlimited generations</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>Lifetime access</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Reviews</CardTitle>
                                <Badge variant="outline">
                                    {prompt._count.reviews} reviews
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                {/* Rating Summary */}
                                <div className="flex gap-8 mb-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold gradient-text">
                                            {prompt.rating.toFixed(1)}
                                        </div>
                                        <div className="flex justify-center my-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.round(prompt.rating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-muted"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {prompt._count.reviews} reviews
                                        </p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {ratingDistribution.map((item) => (
                                            <div key={item.stars} className="flex items-center gap-2">
                                                <span className="text-sm w-4">{item.stars}</span>
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full gradient-bg"
                                                        style={{
                                                            width: `${prompt._count.reviews > 0
                                                                    ? (item.count / prompt._count.reviews) * 100
                                                                    : 0
                                                                }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-muted-foreground w-8">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Review List */}
                                {prompt.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {prompt.reviews.map((review) => (
                                            <div key={review.id}>
                                                <div className="flex items-start gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={review.user.image || undefined} />
                                                        <AvatarFallback>
                                                            {review.user.name?.[0]?.toUpperCase() || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">
                                                                {review.user.name || "Anonymous"}
                                                            </span>
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-3 w-3 ${i < review.rating
                                                                                ? "fill-amber-400 text-amber-400"
                                                                                : "text-muted"
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No reviews yet. Be the first to review!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Purchase Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Purchase Card */}
                            <Card>
                                <CardContent className="pt-6">
                                    {/* Category & Title */}
                                    <Badge variant="outline" className="mb-3">
                                        {CATEGORY_LABELS[prompt.category]}
                                    </Badge>
                                    <h1 className="text-2xl font-display font-bold mb-2">{prompt.title}</h1>

                                    {/* Rating & Sales */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span className="font-medium">{prompt.rating.toFixed(1)}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ({prompt.reviewCount})
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {prompt.salesCount} sales
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {prompt.tags.slice(0, 5).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Price */}
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-muted-foreground">Price</span>
                                        <span className="text-3xl font-bold gradient-text">
                                            {formatPrice(prompt.price)}
                                        </span>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <AddToCartButton
                                        prompt={{
                                            id: prompt.id,
                                            title: prompt.title,
                                            description: prompt.description,
                                            category: prompt.category,
                                            price: prompt.price,
                                            rating: prompt.rating,
                                            reviewCount: prompt.reviewCount,
                                            tags: prompt.tags,
                                            exampleImages: prompt.exampleImages,
                                            creator: {
                                                id: prompt.creator.id,
                                                name: prompt.creator.name,
                                                image: prompt.creator.image,
                                            },
                                        }}
                                    />

                                    {/* Trust Badges */}
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span>Secure payment</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Zap className="h-5 w-5 text-green-500" />
                                            <span>Instant access after purchase</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Download className="h-5 w-5 text-green-500" />
                                            <span>Use in AI Studio immediately</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Creator Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Created by</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={prompt.creator.image || undefined} />
                                            <AvatarFallback className="gradient-bg text-white">
                                                {prompt.creator.name?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">
                                                {prompt.creator.name || "Anonymous"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {prompt.creator._count.prompts} prompts
                                            </p>
                                        </div>
                                    </div>
                                    {prompt.creator.bio && (
                                        <p className="text-sm text-muted-foreground mt-4">
                                            {prompt.creator.bio}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
