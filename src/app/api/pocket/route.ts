import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/pocket - Get all saved prompts for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const savedPrompts = await prisma.savedPrompt.findMany({
            where: { userId: user.id },
            include: {
                prompt: {
                    include: {
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
        });

        return NextResponse.json({
            savedPrompts: savedPrompts.map((sp) => ({
                id: sp.id,
                savedAt: sp.createdAt,
                prompt: sp.prompt,
            })),
        });
    } catch (error) {
        console.error("Error fetching pocket:", error);
        return NextResponse.json(
            { error: "Failed to fetch pocket" },
            { status: 500 }
        );
    }
}

// POST /api/pocket - Save a prompt to pocket
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { promptId } = body;

        if (!promptId) {
            return NextResponse.json(
                { error: "Prompt ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if prompt exists
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
        });

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check if already saved
        const existingSave = await prisma.savedPrompt.findUnique({
            where: {
                userId_promptId: {
                    userId: user.id,
                    promptId: promptId,
                },
            },
        });

        if (existingSave) {
            return NextResponse.json(
                { error: "Prompt already saved", alreadySaved: true },
                { status: 409 }
            );
        }

        // Save the prompt
        const savedPrompt = await prisma.savedPrompt.create({
            data: {
                userId: user.id,
                promptId: promptId,
            },
        });

        return NextResponse.json({
            message: "Prompt saved to pocket",
            savedPrompt,
        });
    } catch (error) {
        console.error("Error saving to pocket:", error);
        return NextResponse.json(
            { error: "Failed to save prompt" },
            { status: 500 }
        );
    }
}

// DELETE /api/pocket?promptId=xxx - Remove a prompt from pocket
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get("promptId");

        if (!promptId) {
            return NextResponse.json(
                { error: "Prompt ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Delete the saved prompt
        await prisma.savedPrompt.deleteMany({
            where: {
                userId: user.id,
                promptId: promptId,
            },
        });

        return NextResponse.json({
            message: "Prompt removed from pocket",
        });
    } catch (error) {
        console.error("Error removing from pocket:", error);
        return NextResponse.json(
            { error: "Failed to remove prompt" },
            { status: 500 }
        );
    }
}
