import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import type { Role } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = signUpSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                },
                { status: 400 }
            );
        }

        const { name, email, password, role } = validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "An account with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Account created successfully",
                data: user,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Sign up error:", error);
        return NextResponse.json(
            { success: false, error: "An error occurred while creating your account" },
            { status: 500 }
        );
    }
}
