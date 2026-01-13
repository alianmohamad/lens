import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET user profile and stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                bio: true,
                stripeConnectId: true,
                createdAt: true,
                _count: {
                    select: {
                        prompts: true,
                        purchases: true,
                        reviews: true,
                        images: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Get role-specific stats
        let stats = {};

        if (user.role === "SELLER" || user.role === "ADMIN") {
            // Seller stats
            const [totalEarnings, totalSales, approvedPrompts, averageRating] =
                await Promise.all([
                    prisma.purchase.aggregate({
                        where: {
                            prompt: { creatorId: session.user.id },
                            status: "COMPLETED",
                        },
                        _sum: { sellerEarnings: true },
                    }),
                    prisma.purchase.count({
                        where: {
                            prompt: { creatorId: session.user.id },
                            status: "COMPLETED",
                        },
                    }),
                    prisma.prompt.count({
                        where: {
                            creatorId: session.user.id,
                            status: "APPROVED",
                        },
                    }),
                    prisma.review.aggregate({
                        where: {
                            prompt: { creatorId: session.user.id },
                        },
                        _avg: { rating: true },
                    }),
                ]);

            stats = {
                totalEarnings: totalEarnings._sum.sellerEarnings || 0,
                totalSales,
                approvedPrompts,
                averageRating: averageRating._avg.rating || 0,
            };
        } else {
            // Buyer stats
            const [totalSpent, totalPurchases, totalGenerations] = await Promise.all([
                prisma.purchase.aggregate({
                    where: {
                        userId: session.user.id,
                        status: "COMPLETED",
                    },
                    _sum: { amount: true },
                }),
                prisma.purchase.count({
                    where: {
                        userId: session.user.id,
                        status: "COMPLETED",
                    },
                }),
                prisma.generatedImage.count({
                    where: { userId: session.user.id },
                }),
            ]);

            stats = {
                totalSpent: totalSpent._sum.amount || 0,
                totalPurchases,
                totalGenerations,
            };
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
                stats,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, bio, image } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(image !== undefined && { image }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                bio: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
