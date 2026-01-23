import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimiters, createRateLimitHeaders } from "@/lib/rate-limit";
import type { GenerateRequest, ApiResponse, GenerateResponse } from "@/types/api";

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GenerateImageRequest {
    productImageUrl: string;
    promptId: string;
    customPrompt?: string;
    // New Params
    aspectRatio?: "1:1" | "16:9" | "4:5" | "9:16";
    stylePreset?: string;
    productStrength?: number;
    quality?: "standard" | "hd";
    negativePrompt?: string;
    numImages?: number;
    demoMode?: boolean; // Force demo mode for testing
    modelId?: string; // New: Model selection
}

// Sample demo images for testing (high-quality product photography)
const DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", // Watch on marble
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", // Headphones
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80", // Sunglasses
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80", // Camera
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80", // Perfume
    "https://images.unsplash.com/photo-1491553895911-0055uj89a?w=800&q=80", // Cosmetics
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80", // Sneaker
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", // Red Nike shoe
];

// ...

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in to generate images" },
                { status: 401 }
            );
        }

        // Rate limiting - 10 requests per minute per user
        const rateLimitResult = rateLimiters.generation(session.user.id);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please wait before generating more images." },
                {
                    status: 429,
                    headers: createRateLimitHeaders(rateLimitResult)
                }
            );
        }

        const body: GenerateImageRequest = await request.json();
        const {
            productImageUrl,
            promptId,
            customPrompt,
            aspectRatio = "1:1",
            stylePreset,
            productStrength = 80,
            quality = "standard",
            negativePrompt,
            numImages = 1,
            demoMode = false,
            modelId = "gemini-3-pro"
        } = body;

        if (!productImageUrl) {
            return NextResponse.json(
                { success: false, error: "Product image URL is required" },
                { status: 400 }
            );
        }

        // Get the prompt from database
        let promptText = customPrompt || "";

        if (promptId) {
            // Check if user has purchased this prompt
            const purchase = await prisma.purchase.findFirst({
                where: {
                    userId: session.user.id,
                    promptId,
                    status: "COMPLETED",
                },
                include: {
                    prompt: true,
                },
            });

            if (!purchase) {
                return NextResponse.json(
                    { success: false, error: "You must purchase this prompt to use it" },
                    { status: 403 }
                );
            }

            promptText = purchase.prompt?.promptText || "";
        }

        if (!promptText) {
            return NextResponse.json(
                { success: false, error: "Prompt text is required" },
                { status: 400 }
            );
        }

        // --- Apply Advanced Prompt Logic ---

        // 1. Style Preset Injection
        let styleInstruction = "";
        if (stylePreset) {
            switch (stylePreset) {
                case "Studio": styleInstruction = " in a clean, professional studio setting with neutral lighting"; break;
                case "Luxury": styleInstruction = " in a high-end luxury setting with dramatic mood lighting, dark elegance, premium aesthetic"; break;
                case "Nature": styleInstruction = " in a natural outdoor setting, soft sunlight, organic elements, bokeh background"; break;
                case "Neon": styleInstruction = " in a cyberpunk futuristic setting, neon rim lighting, tech aesthetic, vibrant colors"; break;
                case "Minimal": styleInstruction = " in a minimal setting, plenty of negative space, soft shadows, clean lines"; break;
            }
        }

        // 2. Aspect Ratio Instruction (Gemini handles this better via prompt than config for some models)
        const ratioMap = {
            "1:1": "square aspect ratio",
            "16:9": "cinematic wide 16:9 aspect ratio",
            "4:5": "portrait 4:5 aspect ratio",
            "9:16": "tall vertical 9:16 aspect ratio"
        };
        const ratioInstruction = ratioMap[aspectRatio] || "square aspect ratio";

        // 3. Product Strength (Integrity)
        // We simulate this by adjusting the system instruction emphasis
        const integrityInstruction = productStrength > 85
            ? "Keep the product EXTREMELY accurate to the original image. Do not change its shape, label, or details at all."
            : productStrength > 50
                ? "Keep the product accurate to the original image."
                : "The product should be recognizable but you can creatively adapt it to the scene.";

        // 4. Negative Prompt
        const negativeInstruction = negativePrompt ? ` Avoid these elements: ${negativePrompt}.` : "";

        // Combine for Final Prompt
        const finalPrompt = `${promptText}${styleInstruction}. ${ratioInstruction}. ${negativeInstruction}`.replace(/\[product\]/gi, "the product in the image");

        // Check if demo mode is requested or API not configured
        if (demoMode || !GEMINI_API_KEY) {
            // Return mock response for development/testing

            // Simulate realistic generation delay (2-4 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

            // Pick a random demo image
            const randomDemoImage = DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];

            // Create a record in the database
            const generatedImage = await prisma.generatedImage.create({
                data: {
                    userId: session.user.id,
                    promptId: promptId || null,
                    originalUrl: productImageUrl,
                    generatedUrl: randomDemoImage,
                    status: "COMPLETED",
                },
            });

            return NextResponse.json({
                success: true,
                message: demoMode ? "Demo mode enabled - using sample images" : "Demo mode - configure GEMINI_API_KEY for actual generation",
                data: {
                    id: generatedImage.id,
                    originalUrl: productImageUrl,
                    generatedUrl: randomDemoImage,
                    status: "COMPLETED",
                },
            });
        }

        // Create a pending record
        const generatedImage = await prisma.generatedImage.create({
            data: {
                userId: session.user.id,
                promptId: promptId || null,
                originalUrl: productImageUrl,
                status: "PROCESSING",
            },
        });

        try {
            // Initialize Gemini API client
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

            // Select Model
            let targetModel = "gemini-3-pro-image-preview"; // Default
            if (modelId === "imagen-3") {
                targetModel = "imagen-3.0-generate-001";
            } else if (modelId === "fast") {
                // Use same model but maybe different config, or Flash if available
                targetModel = "gemini-3-pro-image-preview";
            }

            const model = genAI.getGenerativeModel({
                model: targetModel,
            });

            // Parse the product image data URL to extract base64 and mime type
            const imageDataMatch = productImageUrl.match(/^data:(.+);base64,(.+)$/);
            if (!imageDataMatch) {
                throw new Error("Invalid image data format. Expected base64 data URL.");
            }
            const [, imageMimeType, imageBase64] = imageDataMatch;

            // Generate image with Gemini 3 Pro Image (Nano Banana Pro)
            // Include the product image so the AI can see and use it
            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: imageMimeType,
                                data: imageBase64,
                            }
                        },
                        { text: finalPrompt }
                    ]
                }],
                generationConfig: {
                    // map aspect ratio to closest supported if possible, otherwise rely on prompt
                    responseModalities: ["IMAGE"],
                    temperature: productStrength < 50 ? 1.2 : 0.8, // More creative if strength is low
                },
                // For image generation with specific params
                systemInstruction: {
                    parts: [{
                        text: `You are a professional product photographer AI. ${integrityInstruction} Generate a high-quality product photograph based on the provided product image, applying the styling, background, lighting, and composition described in the prompt. The output should be suitable for e-commerce use. Output resolution: ${quality === 'hd' ? 'high definition' : 'standard'}.`
                    }]
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const response = await result.response;

            // Extract image data from response
            if (!response.candidates || response.candidates.length === 0) {
                throw new Error("No image generated from Gemini API");
            }

            const candidate = response.candidates[0];
            if (!candidate.content || !candidate.content.parts) {
                throw new Error("No content parts in response");
            }

            // Find the image part
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
            if (!imagePart || !imagePart.inlineData) {
                throw new Error("No image data in response");
            }

            // Extract base64 image data
            const mimeType = imagePart.inlineData.mimeType || "image/png";
            const imageData = imagePart.inlineData.data;

            // Convert to data URL
            const generatedUrl = `data:${mimeType};base64,${imageData}`;

            // Update database with generated image
            await prisma.generatedImage.update({
                where: { id: generatedImage.id },
                data: {
                    generatedUrl,
                    status: "COMPLETED",
                },
            });

            return NextResponse.json({
                success: true,
                data: {
                    id: generatedImage.id,
                    originalUrl: productImageUrl,
                    generatedUrl,
                    status: "COMPLETED",
                },
            });
        } catch (error) {
            // Update database to mark as failed
            await prisma.generatedImage.update({
                where: { id: generatedImage.id },
                data: { status: "FAILED" },
            });

            return NextResponse.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to generate image with Gemini 3 Pro Image"
                },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to generate image" },
            { status: 500 }
        );
    }
}

// Check generation status
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get("imageId");

        if (!imageId) {
            // Return user's generation history
            const images = await prisma.generatedImage.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                take: 20,
                include: {
                    prompt: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                success: true,
                data: images,
            });
        }

        // Get specific image status
        const image = await prisma.generatedImage.findUnique({
            where: { id: imageId },
            include: {
                prompt: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!image || image.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: image,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to check status" },
            { status: 500 }
        );
    }
}
