// ==================== USER TYPES ====================
export type Role = "BUYER" | "SELLER" | "ADMIN";

export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: Role;
    bio?: string | null;
    stripeCustomerId?: string | null;
    stripeConnectId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile extends User {
    _count?: {
        prompts: number;
        purchases: number;
        reviews: number;
    };
}

// ==================== PROMPT TYPES ====================
export type Category =
    | "FASHION"
    | "ELECTRONICS"
    | "FOOD"
    | "JEWELRY"
    | "FURNITURE"
    | "BEAUTY"
    | "SPORTS"
    | "TOYS"
    | "OTHER";

export type PromptStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Prompt {
    id: string;
    title: string;
    description: string;
    promptText: string;
    category: Category;
    price: number; // In cents
    rating: number;
    reviewCount: number;
    salesCount: number;
    status: PromptStatus;
    tags: string[];
    exampleImages: string[];
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
    creator?: User;
}

export interface PromptWithCreator extends Prompt {
    creator: User;
}

export interface PromptCardData {
    id: string;
    title: string;
    description: string;
    category: Category;
    price: number;
    rating: number;
    reviewCount: number;
    tags: string[];
    exampleImages: string[];
    creator: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

// ==================== COMMERCE TYPES ====================
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Purchase {
    id: string;
    amount: number;
    platformFee: number;
    sellerEarnings: number;
    stripeSessionId?: string | null;
    stripePaymentId?: string | null;
    status: PaymentStatus;
    createdAt: Date;
    userId: string;
    promptId: string;
    user?: User;
    prompt?: Prompt;
}

export interface CartItem {
    id: string;
    promptId: string;
    userId: string;
    createdAt: Date;
    prompt?: Prompt;
}

// Local cart item (before sync to DB)
export interface LocalCartItem {
    promptId: string;
    prompt: PromptCardData;
    addedAt: Date;
}

// ==================== REVIEW TYPES ====================
export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    promptId: string;
    user?: User;
}

export interface ReviewWithUser extends Omit<Review, "user"> {
    user: Pick<User, "id" | "name" | "image">;
}

// ==================== IMAGE GENERATION TYPES ====================
export type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface GeneratedImage {
    id: string;
    originalUrl: string;
    generatedUrl: string | null;
    status: GenerationStatus;
    createdAt: Date;
    userId: string;
    promptId: string | null;
    prompt?: Prompt;
}

// ==================== API TYPES ====================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}

// ==================== FILTER TYPES ====================
export interface PromptFilters {
    category?: Category;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    sortBy?: "newest" | "popular" | "rating" | "price_low" | "price_high";
}

// ==================== FORM TYPES ====================
export interface CreatePromptInput {
    title: string;
    description: string;
    promptText: string;
    category: Category;
    price: number;
    tags: string[];
    exampleImages: string[];
}

export interface UpdatePromptInput extends Partial<CreatePromptInput> {
    id: string;
}

export interface SignUpInput {
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface SignInInput {
    email: string;
    password: string;
}

// ==================== DASHBOARD TYPES ====================
export interface SellerStats {
    totalEarnings: number;
    totalSales: number;
    totalPrompts: number;
    averageRating: number;
    recentSales: Purchase[];
}

export interface BuyerStats {
    totalPurchases: number;
    totalSpent: number;
    totalGenerations: number;
    purchasedPrompts: Prompt[];
}

// ==================== CATEGORY DATA ====================
export const CATEGORY_LABELS: Record<Category, string> = {
    FASHION: "Fashion & Apparel",
    ELECTRONICS: "Electronics",
    FOOD: "Food & Beverage",
    JEWELRY: "Jewelry & Accessories",
    FURNITURE: "Furniture & Home",
    BEAUTY: "Beauty & Cosmetics",
    SPORTS: "Sports & Outdoors",
    TOYS: "Toys & Games",
    OTHER: "Other",
};

export const CATEGORY_ICONS: Record<Category, string> = {
    FASHION: "shirt",
    ELECTRONICS: "smartphone",
    FOOD: "utensils",
    JEWELRY: "gem",
    FURNITURE: "sofa",
    BEAUTY: "sparkles",
    SPORTS: "dumbbell",
    TOYS: "gamepad-2",
    OTHER: "package",
};
