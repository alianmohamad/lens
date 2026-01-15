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
        // NEW PROMPTS
        {
            title: "Vintage Denim Jacket",
            description: "Capture the rugged texture and timeless style of vintage denim. Perfect for fashion marketplaces and thrift stores.",
            promptText: "Product photography of a vintage denim jacket hanging on a rustic wooden wall, natural daylight, texture focus, detailed stitching, moody atmosphere, 8k resolution, commercial fashion photography",
            category: "FASHION" as const,
            price: 499,
            rating: 4.6,
            reviewCount: 32,
            salesCount: 88,
            tags: ["fashion", "denim", "vintage", "clothing", "rustic"],
            exampleImages: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800", "https://images.unsplash.com/photo-1544652433-1ec0a1845187?w=800"],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Artisanal Coffee Beans",
            description: "Warm and inviting photography for coffee products. Highlights the richness and aroma of freshly roasted beans.",
            promptText: "Close-up product photography of roasted coffee beans spilling from a burlap sack, warm moody lighting, steam rising from a cup in background, depth of field, rich brown tones, cinematic lighting, 8k",
            category: "FOOD" as const,
            price: 299,
            rating: 4.8,
            reviewCount: 45,
            salesCount: 120,
            tags: ["coffee", "food", "drink", "warm", "cinematic"],
            exampleImages: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Modern Smartwatch",
            description: "Sleek and futuristic presentation for wearable tech. Emphasizes screen quality and build materials.",
            promptText: "Product shot of a smartwatch floating in zero gravity, neon rim lighting, tech background, clean glass reflections, futuristic interface visible on screen, 8k resolution, ultra-detailed",
            category: "ELECTRONICS" as const,
            price: 699,
            rating: 4.7,
            reviewCount: 56,
            salesCount: 210,
            tags: ["electronics", "smartwatch", "tech", "futuristic", "gadget"],
            exampleImages: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800", "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Camping Adventure Gear",
            description: "Outdoor lifestyle photography for camping equipment. Places the product in its natural environment.",
            promptText: "Outdoor product photography of a camping backpack on a rock near a mountain lake, golden hour lighting, pine trees in background, adventure atmosphere, sharp focus on product, 8k resolution",
            category: "SPORTS" as const,
            price: 549,
            rating: 4.5,
            reviewCount: 28,
            salesCount: 75,
            tags: ["sports", "camping", "outdoor", "adventure", "nature"],
            exampleImages: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", "https://images.unsplash.com/photo-1627885315848-132d752dd35a?w=800"],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Diamond Engagement Ring",
            description: "Sparkling and luxurious jewelry photography. Maximizes the brilliance and fire of diamonds.",
            promptText: "Macro product photography of a diamond ring on black velvet, starburst light reflections on the diamond, elegant and luxurious, extremely shallow depth of field, award winning photography, 8k",
            category: "JEWELRY" as const,
            price: 899,
            rating: 4.9,
            reviewCount: 62,
            salesCount: 95,
            tags: ["jewelry", "diamond", "luxury", "wedding", "glamour"],
            exampleImages: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", "https://images.unsplash.com/photo-1615592398451-9f93922d0be4?w=800"],
            creatorId: seller1.id,
            status: "APPROVED" as const,
            featured: true,
        },
        {
            title: "Minimalist Modern Sofa",
            description: "Clean and architectural furniture photography. Perfect for modern home decor catalogs.",
            promptText: "Product photography of a grey mid-century modern sofa in a white minimalist room, harsh sunlight casting geometric shadows, vase with dried flowers, interior design magazine style, 8k resolution",
            category: "FURNITURE" as const,
            price: 749,
            rating: 4.3,
            reviewCount: 21,
            salesCount: 48,
            tags: ["furniture", "sofa", "minimalist", "interior", "home"],
            exampleImages: ["https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Luxury Lipstick Collection",
            description: "High-gloss, vibrant beauty photography. Emphasizes color saturation and texture.",
            promptText: "Close-up beauty product shot of open lipstick tube, creamy texture, vibrant red color, mirrored surface reflection, high-key lighting, fashion magazine aesthetic, 8k resolution",
            category: "BEAUTY" as const,
            price: 349,
            rating: 4.8,
            reviewCount: 88,
            salesCount: 300,
            tags: ["beauty", "makeup", "lipstick", "cosmetics", "fashion"],
            exampleImages: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800", "https://images.unsplash.com/photo-1625093742435-09869601f8fb?w=800"],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Superhero Action Figure",
            description: "Dramatic and cinematic toy photography. Makes small figures look larger than life.",
            promptText: "Cinematic toy photography of an action figure in a rainy city street diorama, dramatic backlighting, rain droplets, neon sign reflections, macro lens, realistic texture, 8k resolution",
            category: "TOYS" as const,
            price: 449,
            rating: 4.6,
            reviewCount: 34,
            salesCount: 80,
            tags: ["toys", "action figure", "cinematic", "macro", "hero"],
            exampleImages: ["https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800", "https://images.unsplash.com/photo-1563823293808-45d0644e5977?w=800"],
            creatorId: seller2.id,
            status: "APPROVED" as const,
        },
        {
            title: "Ceramic Art Vase",
            description: "Artistic and textural photography for handmade home decor items.",
            promptText: "Still life photography of a textured ceramic vase with wild flowers, soft window light, linen tablecloth, earthy tones, wabi-sabi aesthetic, calm and peaceful mood, 8k resolution",
            category: "OTHER" as const,
            price: 399,
            rating: 4.7,
            reviewCount: 19,
            salesCount: 40,
            tags: ["decor", "vase", "ceramic", "art", "home"],
            exampleImages: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800", "https://images.unsplash.com/photo-1616486338812-3aeee77437fa?w=800"],
            creatorId: seller1.id,
            status: "APPROVED" as const,
        },
        {
            title: "Running Sneakers",
            description: "Clean, floating product shot for footwear. Highlights design and performance features.",
            promptText: "Product photography of colorful running sneakers floating in mid-air, deconstructed elements, dynamic composition, studio lighting, clean white background, commercial footwear advertisement style, 8k",
            category: "FASHION" as const,
            price: 599,
            rating: 4.8,
            reviewCount: 156,
            salesCount: 420,
            tags: ["fashion", "sneakers", "shoes", "sport", "running"],
            exampleImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"],
            creatorId: seller2.id,
            status: "APPROVED" as const,
            featured: true,
        }
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
