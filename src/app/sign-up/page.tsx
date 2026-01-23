"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sparkles,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    User,
    Store,
    ShoppingBag,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signUpSchema, type SignUpSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { InteractiveHeroBackground } from "@/components/landing/interactive-hero-background";

export default function SignUpPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            role: "BUYER",
        },
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: SignUpSchema) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Failed to create account");
                return;
            }

            // Sign in the user
            const signInResult = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (signInResult?.error) {
                // Account created but sign in failed - redirect to sign in
                router.push("/sign-in?message=Account created. Please sign in.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <span className="text-2xl font-display font-bold gradient-text">ZeroLens</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Create an account</h1>
                        <p className="text-muted-foreground">
                            Join ZeroLens and start creating amazing product images
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                        >
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </motion.div>
                    )}

                    {/* Google Sign Up */}
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium"
                        onClick={handleGoogleSignUp}
                        disabled={isGoogleLoading || isLoading}
                    >
                        {isGoogleLoading ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <div className="relative my-6">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
                            or
                        </span>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label>I want to</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setValue("role", "BUYER")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all",
                                        selectedRole === "BUYER"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <ShoppingBag className={cn(
                                        "h-6 w-6 mb-2",
                                        selectedRole === "BUYER" ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <div className="font-medium">Buy Prompts</div>
                                    <div className="text-xs text-muted-foreground">
                                        Generate amazing product photos
                                    </div>
                                    {selectedRole === "BUYER" && (
                                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue("role", "SELLER")}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all relative",
                                        selectedRole === "SELLER"
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <Store className={cn(
                                        "h-6 w-6 mb-2",
                                        selectedRole === "SELLER" ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <div className="font-medium">Sell Prompts</div>
                                    <div className="text-xs text-muted-foreground">
                                        Earn 70% on every sale
                                    </div>
                                    {selectedRole === "SELLER" && (
                                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Enter your full name"
                                    className={cn(
                                        "h-12 pl-10",
                                        errors.name && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register("name")}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className={cn(
                                        "h-12 pl-10",
                                        errors.email && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register("email")}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className={cn(
                                        "h-12 pl-10 pr-10",
                                        errors.password && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register("password")}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className={cn(
                                        "h-12 pl-10 pr-10",
                                        errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register("confirmPassword")}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base btn-premium"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Interactive Hero Background */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <InteractiveHeroBackground />
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/20 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
                    <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
                        <Sparkles className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 hero-gradient-text">
                        Join Our Community
                    </h2>
                    <p className="text-white/80 max-w-md mb-8 text-lg">
                        Whether you&apos;re buying prompts to enhance your product photos or selling
                        your expertise to earn passive income, ZeroLens is your platform.
                    </p>

                    <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Check className="h-4 w-4" />
                            </div>
                            <span>Access to 2,500+ expert prompts</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Check className="h-4 w-4" />
                            </div>
                            <span>Generate images with Google Imagen 3</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Check className="h-4 w-4" />
                            </div>
                            <span>Earn 70% on every prompt sale</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
