import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id] - Get a specific project
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                canvas: true,
            },
        });

        if (!project) {
            return new NextResponse("Project not found", { status: 404 });
        }

        if (project.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify ownership
        const existing = await prisma.project.findUnique({
            where: { id },
        });

        if (!existing) {
            return new NextResponse("Project not found", { status: 404 });
        }

        if (existing.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const body = await req.json();
        const { name, thumbnail } = body;

        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(thumbnail !== undefined && { thumbnail }),
            },
        });

        return NextResponse.json({ project });
    } catch (error) {
        console.error("Failed to update project:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify ownership
        const existing = await prisma.project.findUnique({
            where: { id },
        });

        if (!existing) {
            return new NextResponse("Project not found", { status: 404 });
        }

        if (existing.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete project:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
