import { z } from "zod";
import type { Category } from "@/types";

// ==================== PROMPT SCHEMAS ====================
export const createPromptSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .min(20, "Description must be at least 20 characters")
        .max(2000, "Description must be less than 2000 characters"),
    promptText: z
        .string()
        .min(10, "Prompt must be at least 10 characters")
        .max(5000, "Prompt must be less than 5000 characters"),
    category: z.enum([
        "FASHION",
        "ELECTRONICS",
        "FOOD",
        "JEWELRY",
        "FURNITURE",
        "BEAUTY",
        "SPORTS",
        "TOYS",
        "OTHER",
    ] as const),
    price: z
        .number()
        .min(99, "Price must be at least $0.99")
        .max(9999, "Price must be less than $99.99"),
    tags: z
        .array(z.string().min(2).max(20))
        .min(1, "Add at least one tag")
        .max(10, "Maximum 10 tags allowed"),
    exampleImages: z
        .array(z.string().url())
        .min(1, "Add at least one example image")
        .max(5, "Maximum 5 example images"),
});

export const updatePromptSchema = createPromptSchema.partial().extend({
    id: z.string().cuid(),
});

export type CreatePromptSchema = z.infer<typeof createPromptSchema>;
export type UpdatePromptSchema = z.infer<typeof updatePromptSchema>;

// ==================== USER SCHEMAS ====================
export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be less than 50 characters"),
        email: z.string().email("Please enter a valid email"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
        role: z.enum(["BUYER", "SELLER"] as const),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const signInSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    image: z.string().url().optional(),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

// ==================== REVIEW SCHEMAS ====================
export const createReviewSchema = z.object({
    promptId: z.string().cuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

// ==================== FILTER SCHEMAS ====================
export const promptFiltersSchema = z.object({
    category: z
        .enum([
            "FASHION",
            "ELECTRONICS",
            "FOOD",
            "JEWELRY",
            "FURNITURE",
            "BEAUTY",
            "SPORTS",
            "TOYS",
            "OTHER",
        ] as const)
        .optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().max(10000).optional(),
    minRating: z.number().min(0).max(5).optional(),
    search: z.string().max(100).optional(),
    sortBy: z
        .enum(["newest", "popular", "rating", "price_low", "price_high"] as const)
        .optional(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(50).default(12),
});

export type PromptFiltersSchema = z.infer<typeof promptFiltersSchema>;

// ==================== GENERATION SCHEMAS ====================
export const generateImageSchema = z.object({
    promptId: z.string().cuid(),
    originalImageUrl: z.string().url(),
});

export type GenerateImageSchema = z.infer<typeof generateImageSchema>;
