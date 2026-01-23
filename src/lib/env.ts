/**
 * Environment variable validation
 * Validates required environment variables at startup
 */

interface EnvConfig {
    // Required for core functionality
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;

    // Required for Google OAuth
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // Optional - AI Generation (graceful degradation)
    GEMINI_API_KEY?: string;

    // Optional - Payments (graceful degradation)
    STRIPE_SECRET_KEY?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Optional - File uploads
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
}

const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
] as const;

const optionalEnvVars = [
    "GEMINI_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
] as const;

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function validateEnv(): void {
    const missingVars: string[] = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    }

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missingVars.map((v) => `  - ${v}`).join("\n")}\n\n` +
            `Please check your .env file or environment configuration.`
        );
    }
}

/**
 * Returns the status of optional environment variables
 * Useful for feature flags based on available services
 */
export function getOptionalEnvStatus(): Record<string, boolean> {
    return {
        hasGeminiAPI: Boolean(process.env.GEMINI_API_KEY),
        hasStripe: Boolean(
            process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY
        ),
        hasSupabase: Boolean(
            process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
        ),
    };
}

/**
 * Gets a typed environment configuration object
 * Only call after validateEnv() has been run
 */
export function getEnvConfig(): EnvConfig {
    return {
        DATABASE_URL: process.env.DATABASE_URL!,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    };
}

// Feature flags based on environment
export const features = {
    get aiGeneration() {
        return Boolean(process.env.GEMINI_API_KEY);
    },
    get payments() {
        return Boolean(
            process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY
        );
    },
    get fileUploads() {
        return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
    },
};
