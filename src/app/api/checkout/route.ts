import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in to checkout" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { promptIds } = body as { promptIds: string[] };

        if (!promptIds || !Array.isArray(promptIds) || promptIds.length === 0) {
            return NextResponse.json(
                { success: false, error: "No items in cart" },
                { status: 400 }
            );
        }

        // Get prompts from database
        const prompts = await prisma.prompt.findMany({
            where: {
                id: { in: promptIds },
                status: "APPROVED",
            },
            include: {
                creator: {
                    select: {
                        stripeConnectId: true,
                    },
                },
            },
        });

        if (prompts.length === 0) {
            return NextResponse.json(
                { success: false, error: "No valid prompts found" },
                { status: 400 }
            );
        }

        // Check if user already purchased any of these prompts
        const existingPurchases = await prisma.purchase.findMany({
            where: {
                userId: session.user.id,
                promptId: { in: promptIds },
                status: "COMPLETED",
            },
        });

        if (existingPurchases.length > 0) {
            const purchasedIds = existingPurchases.map((p) => p.promptId);
            return NextResponse.json(
                {
                    success: false,
                    error: "You have already purchased some of these prompts",
                    purchasedIds,
                },
                { status: 400 }
            );
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        // Prepare checkout items
        const items = prompts.map((prompt) => ({
            promptId: prompt.id,
            title: prompt.title,
            price: prompt.price,
            creatorStripeConnectId: prompt.creator.stripeConnectId || undefined,
        }));

        // Create checkout session
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const checkoutSession = await createCheckoutSession({
            items,
            customerId: user?.stripeCustomerId || undefined,
            successUrl: `${baseUrl}/dashboard/purchases?success=true`,
            cancelUrl: `${baseUrl}/cart?canceled=true`,
        });

        return NextResponse.json({
            success: true,
            data: {
                sessionId: checkoutSession.id,
                url: checkoutSession.url,
            },
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
