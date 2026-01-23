/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    /** Maximum number of requests allowed */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    // If no entry exists or entry has expired, create new entry
    if (!entry || now > entry.resetTime) {
        const resetTime = now + config.windowMs;
        rateLimitStore.set(key, { count: 1, resetTime });
        return {
            success: true,
            remaining: config.limit - 1,
            resetTime,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.limit) {
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: config.limit - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Reset rate limit for a specific key
 * Useful for testing or manual overrides
 */
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

/**
 * Get rate limit status without incrementing counter
 */
export function getRateLimitStatus(
    key: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        return {
            success: true,
            remaining: config.limit,
            resetTime: now + config.windowMs,
        };
    }

    return {
        success: entry.count < config.limit,
        remaining: Math.max(0, config.limit - entry.count),
        resetTime: entry.resetTime,
        retryAfter: entry.count >= config.limit
            ? Math.ceil((entry.resetTime - now) / 1000)
            : undefined,
    };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
    /** 10 requests per minute for generation API */
    generation: (key: string) =>
        checkRateLimit(`gen:${key}`, { limit: 10, windowMs: 60 * 1000 }),

    /** 5 login attempts per minute */
    auth: (key: string) =>
        checkRateLimit(`auth:${key}`, { limit: 5, windowMs: 60 * 1000 }),

    /** 100 API requests per minute (general) */
    api: (key: string) =>
        checkRateLimit(`api:${key}`, { limit: 100, windowMs: 60 * 1000 }),

    /** 20 checkout attempts per hour */
    checkout: (key: string) =>
        checkRateLimit(`checkout:${key}`, { limit: 20, windowMs: 60 * 60 * 1000 }),
};

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetTime),
        ...(result.retryAfter && { "Retry-After": String(result.retryAfter) }),
    };
}
