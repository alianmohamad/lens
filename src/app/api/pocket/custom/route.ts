import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pocket/custom - Get all custom prompts for the user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                customPrompts: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json({ customPrompts: user.customPrompts });
    } catch (error) {
        console.error("[CUSTOM_POCKET_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/pocket/custom - Create a new custom prompt
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.error("[CUSTOM_POCKET_POST] Unauthorized: No session");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error("[CUSTOM_POCKET_POST] JSON Parse Error:", e);
            return new NextResponse("Invalid JSON body", { status: 400 });
        }

        const { title, promptText, image, isPublic } = body;

        // Log the received data size for debugging
        console.log(`[CUSTOM_POCKET_POST] Received request. Title: ${title}, Image Size: ${image ? image.length : 0}`);

        if (!title || !promptText) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            console.error("[CUSTOM_POCKET_POST] User not found for email:", session.user.email);
            return new NextResponse("User not found", { status: 404 });
        }

        console.log("[CUSTOM_POCKET_POST] Creating prompt in DB...");
        const customPrompt = await prisma.customPrompt.create({
            data: {
                title,
                promptText,
                image: image || null,
                isPublic: isPublic || false,
                userId: user.id,
            },
        });
        console.log("[CUSTOM_POCKET_POST] Success! ID:", customPrompt.id);

        return NextResponse.json(customPrompt);
    } catch (error) {
        // Log the FULL error
        console.error("[CUSTOM_POCKET_POST] CRITICAL ERROR:", error);

        // Return the specific error message to the client for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE /api/pocket/custom - Delete a custom prompt
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const promptId = searchParams.get("promptId");

        if (!promptId) {
            return new NextResponse("Prompt ID required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Verify ownership before deleting
        const prompt = await prisma.customPrompt.findUnique({
            where: { id: promptId },
        });

        if (!prompt || prompt.userId !== user.id) {
            return new NextResponse("Prompt not found or unauthorized", { status: 404 });
        }

        await prisma.customPrompt.delete({
            where: { id: promptId },
        });

        return new NextResponse("OK");
    } catch (error) {
        console.error("[CUSTOM_POCKET_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
