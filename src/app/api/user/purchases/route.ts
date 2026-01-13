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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Get user's purchases with prompts
        const [purchases, total] = await Promise.all([
            prisma.purchase.findMany({
                where: {
                    userId: session.user.id,
                    status: "COMPLETED",
                },
                include: {
                    prompt: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            category: true,
                            exampleImages: true,
                            creator: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.purchase.count({
                where: {
                    userId: session.user.id,
                    status: "COMPLETED",
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: purchases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get purchases error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch purchases" },
            { status: 500 }
        );
    }
}
