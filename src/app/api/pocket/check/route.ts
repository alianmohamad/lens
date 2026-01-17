import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/pocket/check?promptId=xxx - Check if a prompt is saved
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ isSaved: false });
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
            return NextResponse.json({ isSaved: false });
        }

        const savedPrompt = await prisma.savedPrompt.findUnique({
            where: {
                userId_promptId: {
                    userId: user.id,
                    promptId: promptId,
                },
            },
        });

        return NextResponse.json({
            isSaved: !!savedPrompt,
        });
    } catch (error) {
        console.error("Error checking pocket status:", error);
        return NextResponse.json(
            { error: "Failed to check pocket status" },
            { status: 500 }
        );
    }
}
