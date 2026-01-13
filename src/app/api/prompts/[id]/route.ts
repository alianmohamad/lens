import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePromptSchema } from "@/lib/validations";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/prompts/[id] - Get a single prompt
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const prompt = await prisma.prompt.findUnique({
            where: { id },
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
                    take: 10,
                },
                _count: {
                    select: {
                        reviews: true,
                        purchases: true,
                    },
                },
            },
        });

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check if prompt is approved or user is the creator/admin
        const session = await getServerSession(authOptions);
        const isOwner = session?.user?.id === prompt.creatorId;
        const isAdmin = session?.user?.role === "ADMIN";

        if (prompt.status !== "APPROVED" && !isOwner && !isAdmin) {
            return NextResponse.json(
                { success: false, error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check if user has purchased this prompt
        let hasPurchased = false;
        if (session?.user?.id) {
            const purchase = await prisma.purchase.findFirst({
                where: {
                    userId: session.user.id,
                    promptId: id,
                    status: "COMPLETED",
                },
            });
            hasPurchased = !!purchase;
        }

        return NextResponse.json({
            success: true,
            data: {
                ...prompt,
                hasPurchased,
                isOwner,
            },
        });
    } catch (error) {
        console.error("Error fetching prompt:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch prompt" },
            { status: 500 }
        );
    }
}

// PATCH /api/prompts/[id] - Update a prompt
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        const prompt = await prisma.prompt.findUnique({
            where: { id },
        });

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check ownership or admin
        if (prompt.creatorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "You don't have permission to update this prompt" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validationResult = updatePromptSchema.safeParse({ ...body, id });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                },
                { status: 400 }
            );
        }

        const { id: _, ...updateData } = validationResult.data;

        // If prompt was approved and is being edited, set back to pending
        const needsReview =
            prompt.status === "APPROVED" &&
            (updateData.promptText || updateData.title || updateData.description);

        const updatedPrompt = await prisma.prompt.update({
            where: { id },
            data: {
                ...updateData,
                ...(needsReview && { status: "PENDING" }),
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: needsReview
                ? "Prompt updated and pending review"
                : "Prompt updated successfully",
            data: updatedPrompt,
        });
    } catch (error) {
        console.error("Error updating prompt:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update prompt" },
            { status: 500 }
        );
    }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        const prompt = await prisma.prompt.findUnique({
            where: { id },
        });

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check ownership or admin
        if (prompt.creatorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "You don't have permission to delete this prompt" },
                { status: 403 }
            );
        }

        await prisma.prompt.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Prompt deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting prompt:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete prompt" },
            { status: 500 }
        );
    }
}
