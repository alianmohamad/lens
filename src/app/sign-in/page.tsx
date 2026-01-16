"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInSchema, type SignInSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const errorParam = searchParams.get("error");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        errorParam === "OAuthAccountNotLinked"
            ? "This email is already registered with a different sign-in method"
            : null
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInSchema) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        await signIn("google", { callbackUrl });
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
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Sign in to your account to continue
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

                    {/* Google Sign In */}
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium"
                        onClick={handleGoogleSignIn}
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
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
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
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
                                    Sign in
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Decorative */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <div className="absolute inset-0 animated-gradient" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 grid-pattern opacity-20" />

                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
                    <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
                        <Sparkles className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-4">
                        Transform Your Product Photography
                    </h2>
                    <p className="text-white/80 max-w-md">
                        Access thousands of expert-crafted AI prompts and generate stunning
                        product images in seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SignInLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInLoading />}>
            <SignInForm />
        </Suspense>
    );
}
