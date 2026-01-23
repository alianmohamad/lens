import { describe, it, expect } from "vitest";
import {
    signUpSchema,
    signInSchema,
    createPromptSchema,
    updateProfileSchema,
    createReviewSchema,
    promptFiltersSchema,
    generateImageSchema,
} from "@/lib/validations";

describe("validations", () => {
    describe("signUpSchema", () => {
        it("should validate valid sign up data", () => {
            const validData = {
                name: "John Doe",
                email: "john@example.com",
                password: "Password123",
                confirmPassword: "Password123",
                role: "BUYER" as const,
            };

            const result = signUpSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject short name", () => {
            const data = {
                name: "J",
                email: "john@example.com",
                password: "Password123",
                confirmPassword: "Password123",
                role: "BUYER" as const,
            };

            const result = signUpSchema.safeParse(data);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain("name");
            }
        });

        it("should reject invalid email", () => {
            const data = {
                name: "John Doe",
                email: "not-an-email",
                password: "Password123",
                confirmPassword: "Password123",
                role: "BUYER" as const,
            };

            const result = signUpSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("should reject weak password", () => {
            const data = {
                name: "John Doe",
                email: "john@example.com",
                password: "password",
                confirmPassword: "password",
                role: "BUYER" as const,
            };

            const result = signUpSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("should reject mismatched passwords", () => {
            const data = {
                name: "John Doe",
                email: "john@example.com",
                password: "Password123",
                confirmPassword: "Password456",
                role: "BUYER" as const,
            };

            const result = signUpSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("should accept SELLER role", () => {
            const data = {
                name: "Jane Seller",
                email: "jane@example.com",
                password: "Password123",
                confirmPassword: "Password123",
                role: "SELLER" as const,
            };

            const result = signUpSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    describe("signInSchema", () => {
        it("should validate valid sign in data", () => {
            const result = signInSchema.safeParse({
                email: "john@example.com",
                password: "anypassword",
            });

            expect(result.success).toBe(true);
        });

        it("should reject invalid email", () => {
            const result = signInSchema.safeParse({
                email: "invalid",
                password: "password",
            });

            expect(result.success).toBe(false);
        });

        it("should reject empty password", () => {
            const result = signInSchema.safeParse({
                email: "john@example.com",
                password: "",
            });

            expect(result.success).toBe(false);
        });
    });

    describe("createPromptSchema", () => {
        const validPrompt = {
            title: "Beautiful Fashion Photography Prompt",
            description:
                "This prompt creates stunning fashion photography with professional lighting and composition that will elevate your product images.",
            promptText: "Create a professional fashion photography setup with soft lighting...",
            category: "FASHION" as const,
            price: 999,
            tags: ["fashion", "photography"],
            exampleImages: ["https://example.com/image1.jpg"],
        };

        it("should validate valid prompt data", () => {
            const result = createPromptSchema.safeParse(validPrompt);
            expect(result.success).toBe(true);
        });

        it("should reject short title", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                title: "Hi",
            });

            expect(result.success).toBe(false);
        });

        it("should reject short description", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                description: "Too short",
            });

            expect(result.success).toBe(false);
        });

        it("should reject invalid category", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                category: "INVALID",
            });

            expect(result.success).toBe(false);
        });

        it("should reject price below minimum", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                price: 50,
            });

            expect(result.success).toBe(false);
        });

        it("should reject empty tags array", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                tags: [],
            });

            expect(result.success).toBe(false);
        });

        it("should reject empty example images", () => {
            const result = createPromptSchema.safeParse({
                ...validPrompt,
                exampleImages: [],
            });

            expect(result.success).toBe(false);
        });

        it("should accept all valid categories", () => {
            const categories = [
                "FASHION",
                "ELECTRONICS",
                "FOOD",
                "JEWELRY",
                "FURNITURE",
                "BEAUTY",
                "SPORTS",
                "TOYS",
                "OTHER",
            ];

            categories.forEach((category) => {
                const result = createPromptSchema.safeParse({
                    ...validPrompt,
                    category,
                });
                expect(result.success).toBe(true);
            });
        });
    });

    describe("updateProfileSchema", () => {
        it("should validate partial update with name only", () => {
            const result = updateProfileSchema.safeParse({
                name: "New Name",
            });

            expect(result.success).toBe(true);
        });

        it("should validate with bio", () => {
            const result = updateProfileSchema.safeParse({
                bio: "I am a product photographer",
            });

            expect(result.success).toBe(true);
        });

        it("should reject too long bio", () => {
            const result = updateProfileSchema.safeParse({
                bio: "x".repeat(501),
            });

            expect(result.success).toBe(false);
        });

        it("should validate with image URL", () => {
            const result = updateProfileSchema.safeParse({
                image: "https://example.com/avatar.jpg",
            });

            expect(result.success).toBe(true);
        });
    });

    describe("createReviewSchema", () => {
        it("should validate valid review", () => {
            const result = createReviewSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                rating: 5,
                comment: "Great prompt!",
            });

            expect(result.success).toBe(true);
        });

        it("should allow review without comment", () => {
            const result = createReviewSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                rating: 4,
            });

            expect(result.success).toBe(true);
        });

        it("should reject rating below 1", () => {
            const result = createReviewSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                rating: 0,
            });

            expect(result.success).toBe(false);
        });

        it("should reject rating above 5", () => {
            const result = createReviewSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                rating: 6,
            });

            expect(result.success).toBe(false);
        });
    });

    describe("promptFiltersSchema", () => {
        it("should provide defaults for pagination", () => {
            const result = promptFiltersSchema.safeParse({});

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.page).toBe(1);
                expect(result.data.pageSize).toBe(12);
            }
        });

        it("should accept all valid sort options", () => {
            const sortOptions = ["newest", "popular", "rating", "price_low", "price_high"];

            sortOptions.forEach((sortBy) => {
                const result = promptFiltersSchema.safeParse({ sortBy });
                expect(result.success).toBe(true);
            });
        });

        it("should accept price range filters", () => {
            const result = promptFiltersSchema.safeParse({
                minPrice: 100,
                maxPrice: 5000,
            });

            expect(result.success).toBe(true);
        });

        it("should accept search query", () => {
            const result = promptFiltersSchema.safeParse({
                search: "fashion photography",
            });

            expect(result.success).toBe(true);
        });
    });

    describe("generateImageSchema", () => {
        it("should validate valid generation request", () => {
            const result = generateImageSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                originalImageUrl: "https://example.com/product.jpg",
            });

            expect(result.success).toBe(true);
        });

        it("should reject invalid URL", () => {
            const result = generateImageSchema.safeParse({
                promptId: "clxyz123456789abcdefghij",
                originalImageUrl: "not-a-url",
            });

            expect(result.success).toBe(false);
        });
    });
});
