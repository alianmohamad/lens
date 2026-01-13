import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPromptSchema, promptFiltersSchema } from "@/lib/validations";

// GET /api/prompts - List prompts with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse and validate filters
        const filters = promptFiltersSchema.parse({
            category: searchParams.get("category") || undefined,
            minPrice: searchParams.get("minPrice")
                ? parseInt(searchParams.get("minPrice")!)
                : undefined,
            maxPrice: searchParams.get("maxPrice")
                ? parseInt(searchParams.get("maxPrice")!)
                : undefined,
            minRating: searchParams.get("minRating")
                ? parseFloat(searchParams.get("minRating")!)
                : undefined,
            search: searchParams.get("search") || undefined,
            sortBy: searchParams.get("sortBy") || undefined,
            page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
            pageSize: searchParams.get("pageSize")
                ? parseInt(searchParams.get("pageSize")!)
                : 12,
        });

        // Build where clause
        const where: Record<string, unknown> = {
            status: "APPROVED",
        };

        if (filters.category) {
            where.category = filters.category;
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) {
                (where.price as Record<string, number>).gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                (where.price as Record<string, number>).lte = filters.maxPrice;
            }
        }

        if (filters.minRating !== undefined) {
            where.rating = { gte: filters.minRating };
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { tags: { has: filters.search.toLowerCase() } },
            ];
        }

        // Build orderBy
        let orderBy: Record<string, string> = { createdAt: "desc" };
        switch (filters.sortBy) {
            case "popular":
                orderBy = { salesCount: "desc" };
                break;
            case "rating":
                orderBy = { rating: "desc" };
                break;
            case "price_low":
                orderBy = { price: "asc" };
                break;
            case "price_high":
                orderBy = { price: "desc" };
                break;
        }

        // Get total count
        const total = await prisma.prompt.count({ where });

        // Get prompts
        const prompts = await prisma.prompt.findMany({
            where,
            orderBy,
            skip: (filters.page - 1) * filters.pageSize,
            take: filters.pageSize,
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

        const totalPages = Math.ceil(total / filters.pageSize);

        return NextResponse.json({
            success: true,
            data: {
                items: prompts,
                total,
                page: filters.page,
                pageSize: filters.pageSize,
                totalPages,
                hasMore: filters.page < totalPages,
            },
        });
    } catch (error) {
        console.error("Error fetching prompts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch prompts" },
            { status: 500 }
        );
    }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in to create a prompt" },
                { status: 401 }
            );
        }

        if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "Only sellers can create prompts" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate input
        const validationResult = createPromptSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                },
                { status: 400 }
            );
        }

        const { title, description, promptText, category, price, tags, exampleImages } =
            validationResult.data;

        // Create prompt
        const prompt = await prisma.prompt.create({
            data: {
                title,
                description,
                promptText,
                category,
                price,
                tags,
                exampleImages,
                creatorId: session.user.id,
                status: "PENDING", // Requires admin approval
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

        return NextResponse.json(
            {
                success: true,
                message: "Prompt created successfully and is pending review",
                data: prompt,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating prompt:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create prompt" },
            { status: 500 }
        );
    }
}
