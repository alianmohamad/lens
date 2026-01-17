
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const record = await prisma.canvasSnapshot.findUnique({
            where: { userId: session.user.id },
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

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { snapshot } = body;

        if (!snapshot) {
            return new NextResponse("Snapshot missing", { status: 400 });
        }

        await prisma.canvasSnapshot.upsert({
            where: { userId: session.user.id },
            update: { snapshot },
            create: {
                userId: session.user.id,
                snapshot,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save canvas:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
