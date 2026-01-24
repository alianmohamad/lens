import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects - List all projects for the current user
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        const projects = await prisma.project.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                thumbnail: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized - please sign in again" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        // Ensure user exists in database (might have been deleted after DB reset)
        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!userExists) {
            return NextResponse.json({
                error: "User not found. Please sign out and sign in again."
            }, { status: 401 });
        }

        const project = await prisma.project.create({
            data: {
                name: name || "Untitled Project",
                userId: session.user.id,
            },
        });

        return NextResponse.json({ project });
    } catch (error) {
        console.error("Failed to create project:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: `Failed to create project: ${message}` }, { status: 500 });
    }
}
