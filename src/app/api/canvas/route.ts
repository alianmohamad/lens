import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/canvas?projectId=xxx - Get canvas for a project
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) {
        return new NextResponse("Project ID required", { status: 400 });
    }

    try {
        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return new NextResponse("Project not found", { status: 404 });
        }

        if (project.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const record = await prisma.canvasSnapshot.findUnique({
            where: { projectId },
        });

        if (!record) {
            return NextResponse.json({ snapshot: null });
        }

        return NextResponse.json({ snapshot: record.snapshot });
    } catch (error) {
        console.error("Failed to load canvas:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT /api/canvas - Save canvas for a project
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectId, snapshot } = body;

        if (!projectId) {
            return new NextResponse("Project ID required", { status: 400 });
        }

        if (!snapshot) {
            return new NextResponse("Snapshot missing", { status: 400 });
        }

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return new NextResponse("Project not found", { status: 404 });
        }

        if (project.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.canvasSnapshot.upsert({
            where: { projectId },
            update: { snapshot },
            create: {
                projectId,
                snapshot,
            },
        });

        // Update project's updatedAt
        await prisma.project.update({
            where: { id: projectId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save canvas:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
