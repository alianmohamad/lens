// API Response types

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Generation API types
export interface GenerateRequest {
    productImageUrl: string;
    promptId?: string;
    customPrompt?: string;
    aspectRatio?: string;
    stylePreset?: string;
    productStrength?: number;
    demoMode?: boolean;
    modelId?: string;
    negativePrompt?: string;
    quality?: "standard" | "hd";
    seed?: number;
}

export interface GenerateResponse {
    generatedUrl: string;
    promptUsed?: string;
    modelUsed?: string;
    processingTime?: number;
}

// Checkout API types
export interface CheckoutRequest {
    items: CheckoutItem[];
    successUrl?: string;
    cancelUrl?: string;
}

export interface CheckoutItem {
    promptId: string;
    price: number;
}

export interface CheckoutResponse {
    sessionId: string;
    url: string;
}

// User purchases types
export interface UserPurchase {
    id: string;
    amount: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
        description: string;
        category: string;
        exampleImages: string[];
        creator: {
            id: string;
            name: string | null;
            image: string | null;
        };
    };
}

// User sales types
export interface UserSale {
    id: string;
    amount: number;
    createdAt: string;
    prompt: {
        id: string;
        title: string;
        category: string;
    };
    buyer: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

// Auth types
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: "BUYER" | "SELLER";
}

export interface RegisterResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

// Prompt creation types
export interface CreatePromptRequest {
    title: string;
    description: string;
    promptTemplate: string;
    category: string;
    price: number;
    tags: string[];
    exampleImages: string[];
}

export interface PromptResponse {
    id: string;
    title: string;
    description: string;
    promptTemplate: string;
    category: string;
    price: number;
    tags: string[];
    exampleImages: string[];
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

// Error types
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

// Pagination types
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Gemini/Google AI types
export interface GeminiGenerateRequest {
    prompt: string;
    image?: string;
    aspectRatio?: string;
    negativePrompt?: string;
}

export interface GeminiGenerateResponse {
    images: Array<{
        url: string;
        mimeType: string;
    }>;
}
