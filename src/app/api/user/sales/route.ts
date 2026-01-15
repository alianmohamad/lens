import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        // Check if user is a seller
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "SELLER" && user?.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "You must be a seller to view sales" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Get seller's sales
        const [sales, total, stats] = await Promise.all([
            prisma.purchase.findMany({
                where: {
                    prompt: { creatorId: session.user.id },
                    status: "COMPLETED",
                },
                include: {
                    prompt: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                            exampleImages: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.purchase.count({
                where: {
                    prompt: { creatorId: session.user.id },
                    status: "COMPLETED",
                },
            }),
            prisma.purchase.aggregate({
                where: {
                    prompt: { creatorId: session.user.id },
                    status: "COMPLETED",
                },
                _sum: {
                    sellerEarnings: true,
                    amount: true,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: sales,
            stats: {
                totalEarnings: stats._sum.sellerEarnings || 0,
                totalRevenue: stats._sum.amount || 0,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get sales error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch sales" },
            { status: 500 }
        );
    }
}
