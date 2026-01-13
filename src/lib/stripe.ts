import Stripe from "stripe";

// Stripe is optional during development - only throw on actual use without key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: "2025-12-15.clover",
        typescript: true,
    })
    : (null as unknown as Stripe);

// Platform fee percentage (30%)
export const PLATFORM_FEE_PERCENTAGE = parseFloat(
    process.env.PLATFORM_FEE_PERCENTAGE || "0.30"
);

// Calculate platform fee and seller earnings
export function calculateFees(amount: number): {
    platformFee: number;
    sellerEarnings: number;
} {
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE);
    const sellerEarnings = amount - platformFee;

    return { platformFee, sellerEarnings };
}

// Format amount from cents to display string
export function formatPrice(cents: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(cents / 100);
}

// Create checkout session for cart items
export async function createCheckoutSession({
    items,
    customerId,
    successUrl,
    cancelUrl,
}: {
    items: Array<{
        promptId: string;
        title: string;
        price: number; // in cents
        creatorStripeConnectId?: string;
    }>;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
        (item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                    metadata: {
                        promptId: item.promptId,
                    },
                },
                unit_amount: item.price,
            },
            quantity: 1,
        })
    );

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId || undefined,
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            promptIds: items.map((i) => i.promptId).join(","),
        },
        payment_intent_data: {
            metadata: {
                promptIds: items.map((i) => i.promptId).join(","),
            },
        },
    });

    return session;
}

// Create Stripe Connect account for sellers
export async function createConnectAccount(email: string, userId: string) {
    const account = await stripe.accounts.create({
        type: "express",
        email,
        metadata: {
            userId,
        },
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    return account;
}

// Create Connect account onboarding link
export async function createConnectOnboardingLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
) {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
    });

    return accountLink;
}

// Create transfer to connected account (seller payout)
export async function createTransfer({
    amount,
    destinationAccountId,
    sourceTransaction,
}: {
    amount: number;
    destinationAccountId: string;
    sourceTransaction?: string;
}) {
    const transfer = await stripe.transfers.create({
        amount,
        currency: "usd",
        destination: destinationAccountId,
        source_transaction: sourceTransaction,
    });

    return transfer;
}

// Verify webhook signature
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
    );
}
