import { describe, it, expect, beforeEach } from "vitest";
import {
    checkRateLimit,
    resetRateLimit,
    getRateLimitStatus,
    rateLimiters,
    createRateLimitHeaders,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
    beforeEach(() => {
        // Reset all rate limits before each test
        resetRateLimit("test:user1");
        resetRateLimit("gen:user1");
        resetRateLimit("auth:user1");
    });

    describe("checkRateLimit", () => {
        it("should allow requests under the limit", () => {
            const result = checkRateLimit("test:user1", { limit: 5, windowMs: 60000 });

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it("should track requests correctly", () => {
            const config = { limit: 3, windowMs: 60000 };

            const result1 = checkRateLimit("test:user1", config);
            expect(result1.remaining).toBe(2);

            const result2 = checkRateLimit("test:user1", config);
            expect(result2.remaining).toBe(1);

            const result3 = checkRateLimit("test:user1", config);
            expect(result3.remaining).toBe(0);
        });

        it("should block requests when limit is exceeded", () => {
            const config = { limit: 2, windowMs: 60000 };

            checkRateLimit("test:user1", config);
            checkRateLimit("test:user1", config);
            const result = checkRateLimit("test:user1", config);

            expect(result.success).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it("should track different keys independently", () => {
            const config = { limit: 1, windowMs: 60000 };

            checkRateLimit("test:user1", config);
            const result1 = checkRateLimit("test:user1", config);
            const result2 = checkRateLimit("test:user2", config);

            expect(result1.success).toBe(false);
            expect(result2.success).toBe(true);
        });
    });

    describe("getRateLimitStatus", () => {
        it("should return status without incrementing counter", () => {
            const config = { limit: 3, windowMs: 60000 };

            checkRateLimit("test:user1", config);

            const status1 = getRateLimitStatus("test:user1", config);
            const status2 = getRateLimitStatus("test:user1", config);

            expect(status1.remaining).toBe(2);
            expect(status2.remaining).toBe(2);
        });
    });

    describe("rateLimiters", () => {
        it("should provide pre-configured generation rate limiter", () => {
            const result = rateLimiters.generation("user1");

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(9); // 10 limit - 1
        });

        it("should provide pre-configured auth rate limiter", () => {
            const result = rateLimiters.auth("user1");

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(4); // 5 limit - 1
        });
    });

    describe("createRateLimitHeaders", () => {
        it("should create correct headers for allowed request", () => {
            const result = {
                success: true,
                remaining: 5,
                resetTime: 1234567890,
            };

            const headers = createRateLimitHeaders(result);

            expect(headers["X-RateLimit-Remaining"]).toBe("5");
            expect(headers["X-RateLimit-Reset"]).toBe("1234567890");
            expect(headers["Retry-After"]).toBeUndefined();
        });

        it("should include Retry-After for blocked request", () => {
            const result = {
                success: false,
                remaining: 0,
                resetTime: 1234567890,
                retryAfter: 30,
            };

            const headers = createRateLimitHeaders(result);

            expect(headers["Retry-After"]).toBe("30");
        });
    });
});
