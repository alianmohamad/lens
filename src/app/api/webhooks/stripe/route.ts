import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent, calculateFees } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("stripe-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing stripe-signature header" },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = constructWebhookEvent(body, signature);
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log("Payment succeeded:", paymentIntent.id);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentFailed(paymentIntent);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const promptIds = session.metadata?.promptIds?.split(",") || [];
    const customerId = session.customer as string | null;

    if (promptIds.length === 0) {
        console.error("No prompt IDs in checkout session metadata");
        return;
    }

    // Get user by customer ID or email
    let user = customerId
        ? await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
        })
        : null;

    if (!user && session.customer_email) {
        user = await prisma.user.findUnique({
            where: { email: session.customer_email },
        });

        // Update user with Stripe customer ID if found
        if (user && customerId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }
    }

    if (!user) {
        console.error("User not found for checkout session");
        return;
    }

    // Get prompts
    const prompts = await prisma.prompt.findMany({
        where: { id: { in: promptIds } },
    });

    // Create purchases
    for (const prompt of prompts) {
        const { platformFee, sellerEarnings } = calculateFees(prompt.price);

        // Check if purchase already exists
        const existingPurchase = await prisma.purchase.findFirst({
            where: {
                userId: user.id,
                promptId: prompt.id,
                stripeSessionId: session.id,
            },
        });

        if (existingPurchase) {
            // Update to completed if pending
            if (existingPurchase.status === "PENDING") {
                await prisma.purchase.update({
                    where: { id: existingPurchase.id },
                    data: {
                        status: "COMPLETED",
                        stripePaymentId: session.payment_intent as string,
                    },
                });
            }
            continue;
        }

        // Create new purchase
        await prisma.purchase.create({
            data: {
                userId: user.id,
                promptId: prompt.id,
                amount: prompt.price,
                platformFee,
                sellerEarnings,
                stripeSessionId: session.id,
                stripePaymentId: session.payment_intent as string,
                status: "COMPLETED",
            },
        });

        // Increment sales count
        await prisma.prompt.update({
            where: { id: prompt.id },
            data: { salesCount: { increment: 1 } },
        });
    }

    console.log(`Created ${prompts.length} purchases for user ${user.id}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const promptIds = paymentIntent.metadata?.promptIds?.split(",") || [];

    if (promptIds.length === 0) return;

    // Update any pending purchases to failed
    await prisma.purchase.updateMany({
        where: {
            promptId: { in: promptIds },
            status: "PENDING",
        },
        data: { status: "FAILED" },
    });

    console.log(`Marked purchases as failed for: ${promptIds.join(", ")}`);
}
