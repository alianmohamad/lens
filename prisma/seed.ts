import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // Clean existing data
    await prisma.review.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.generatedImage.deleteMany();
    await prisma.prompt.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash("Password123", 12);

    const admin = await prisma.user.create({
        data: {
            email: "admin@promptlens.ai",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });

    const seller1 = await prisma.user.create({
        data: {
            email: "sarah@example.com",
            name: "Sarah Chen",
            password: hashedPassword,
            role: "SELLER",
            bio: "Professional product photographer with 10+ years of experience. Specializing in luxury goods and fashion.",
            emailVerified: new Date(),
        },
    });

    const seller2 = await prisma.user.create({
        data: {
            email: "marcus@example.com",
            name: "Marcus Johnson",
            password: hashedPassword,
            role: "SELLER",
            bio: "AI prompt engineer and e-commerce specialist. Creating prompts that sell.",
            emailVerified: new Date(),
        },
    });

    const buyer = await prisma.user.create({
        data: {
            email: "buyer@example.com",
            name: "Test Buyer",
            password: hashedPassword,
            role: "BUYER",
            emailVerified: new Date(),
        },
    });

    console.log("✅ Created users");

    // Create prompts
    const prompts = [
        {
            title: "Luxury Product on Marble Surface",
            description:
                "Transform your product photos with this elegant marble surface prompt. Perfect for jewelry, watches, and premium accessories. Creates a sophisticated, high-end look with natural lighting and subtle reflections.",
            promptText:
                "Professional product photography of [product] on a polished white marble surface with soft natural lighting from the left, shallow depth of field, subtle reflections, minimalist composition, high-end luxury aesthetic, 8K resolution, commercial photography style",
            category: "JEWELRY" as const,
            price: 599,
            rating: 4.8,
            reviewCount: 42,
            salesCount: 156,
            tags: ["luxury", "marble", "minimalist", "jewelry", "watches"],
            exampleImages: [
                "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
            ],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Fashion Lifestyle Studio Shot",
            description:
                "Create stunning fashion lifestyle photos with natural studio lighting. Perfect for clothing, bags, and accessories. Emphasizes fabric textures and color accuracy.",
            promptText:
                "Fashion photography of [product] in a modern studio setting with soft diffused lighting, neutral gray backdrop, professional model pose reference, emphasis on fabric texture and details, color accurate, editorial style, high fashion aesthetic",
            category: "FASHION" as const,
            price: 799,
            rating: 4.9,
            reviewCount: 89,
            salesCount: 234,
            tags: ["fashion", "lifestyle", "studio", "clothing", "premium"],
            exampleImages: [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
            ],
            creatorId: seller1.id,
            status: "APPROVED" as const,
            featured: true,
        },
        {
            title: "Electronics on Dark Background",
            description:
                "Showcase tech products with this sleek dark background prompt. Creates dramatic lighting that highlights product details and creates a premium tech feel.",
            promptText:
                "Product photography of [product] on pure black background with dramatic rim lighting, highlight product details and textures, reflective surface, tech product aesthetic, clean and modern, ultra sharp focus, commercial quality",
            category: "ELECTRONICS" as const,
            price: 499,
            rating: 4.7,
            reviewCount: 65,
            salesCount: 178,
            tags: ["electronics", "dark", "tech", "dramatic", "modern"],
            exampleImages: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
            ],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Food Photography Natural Light",
            description:
                "Beautiful natural light food photography prompt. Perfect for restaurants, food brands, and culinary products. Creates appetizing, Instagram-worthy images.",
            promptText:
                "Food photography of [product] with natural window light from the side, rustic wooden table surface, shallow depth of field, appetizing and vibrant colors, food styling props, overhead angle, editorial food photography style",
            category: "FOOD" as const,
            price: 399,
            rating: 4.6,
            reviewCount: 38,
            salesCount: 92,
            tags: ["food", "natural light", "rustic", "appetizing", "instagram"],
            exampleImages: [
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
                "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800",
            ],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Beauty Product Soft Glow",
            description:
                "Elegant beauty and cosmetics photography with soft, flattering lighting. Perfect for skincare, makeup, and wellness products.",
            promptText:
                "Beauty product photography of [product] with soft pink gradient background, ethereal glow lighting, floating elements, clean and feminine aesthetic, subtle shadows, luxury cosmetics style, high-end beauty campaign look",
            category: "BEAUTY" as const,
            price: 699,
            rating: 4.9,
            reviewCount: 56,
            salesCount: 145,
            tags: ["beauty", "cosmetics", "soft", "feminine", "luxury"],
            exampleImages: [
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
                "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800",
            ],
            creatorId: seller1.id,
            status: "APPROVED" as const,
            featured: true,
        },
        {
            title: "Furniture in Modern Interior",
            description:
                "Showcase furniture in a contemporary interior setting. Creates realistic room scenes that help customers visualize products in their space.",
            promptText:
                "Interior design photography of [product] in a modern minimalist living room, natural daylight from large windows, Scandinavian interior style, neutral color palette, architectural photography, lifestyle context",
            category: "FURNITURE" as const,
            price: 899,
            rating: 4.7,
            reviewCount: 29,
            salesCount: 67,
            tags: ["furniture", "interior", "modern", "scandinavian", "lifestyle"],
            exampleImages: [
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
                "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
            ],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Sports Equipment Action Shot",
            description:
                "Dynamic action-style photography for sports and fitness products. Creates energetic, motivational imagery that resonates with athletes.",
            promptText:
                "Dynamic sports product photography of [product] with motion blur effect, energetic composition, high contrast lighting, athletic aesthetic, inspirational mood, action photography style, gym/outdoor environment suggestion",
            category: "SPORTS" as const,
            price: 549,
            rating: 4.5,
            reviewCount: 23,
            salesCount: 54,
            tags: ["sports", "fitness", "action", "dynamic", "athletic"],
            exampleImages: [
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
            ],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Toy Product Colorful Background",
            description:
                "Playful and colorful product photography perfect for toys and kids products. Creates fun, engaging imagery that appeals to parents and children.",
            promptText:
                "Toy product photography of [product] on vibrant colorful gradient background, playful lighting, confetti and party elements, fun and energetic mood, kids-friendly aesthetic, bright and cheerful colors, commercial toy photography",
            category: "TOYS" as const,
            price: 399,
            rating: 4.4,
            reviewCount: 17,
            salesCount: 43,
            tags: ["toys", "colorful", "playful", "kids", "fun"],
            exampleImages: [
                "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800",
                "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800",
            ],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
    ];

    for (const promptData of prompts) {
        await prisma.prompt.create({ data: promptData });
    }

    console.log("✅ Created prompts");

    // Create some reviews
    const createdPrompts = await prisma.prompt.findMany();

    for (const prompt of createdPrompts.slice(0, 4)) {
        await prisma.review.create({
            data: {
                promptId: prompt.id,
                userId: buyer.id,
                rating: 5,
                comment:
                    "Excellent prompt! The results exceeded my expectations. Highly recommended for anyone looking to improve their product photos.",
            },
        });
    }

    console.log("✅ Created reviews");
    console.log("🎉 Seed completed successfully!");

    console.log("\n📧 Test accounts created:");
    console.log("   Admin: admin@promptlens.ai / Password123");
    console.log("   Seller 1: sarah@example.com / Password123");
    console.log("   Seller 2: marcus@example.com / Password123");
    console.log("   Buyer: buyer@example.com / Password123");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
