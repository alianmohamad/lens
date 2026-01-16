"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Sparkles,
    Mail,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // In a real implementation, this would call an API endpoint
            // that sends a password reset email
            // For now, we'll simulate a successful submission
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSubmitted(true);
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
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

                    {/* Back Link */}
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Sign In
                    </Link>

                    {isSubmitted ? (
                        /* Success State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                                Check your email
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                If an account exists with that email address, we&apos;ve sent you
                                instructions to reset your password.
                            </p>
                            <div className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/sign-in">Return to Sign In</Link>
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Didn&apos;t receive the email?{" "}
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-primary hover:underline"
                                    >
                                        Try again
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                                    Forgot your password?
                                </h1>
                                <p className="text-muted-foreground">
                                    Enter your email address and we&apos;ll send you instructions to
                                    reset your password.
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

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base btn-premium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Instructions"
                                    )}
                                </Button>
                            </form>

                            <p className="mt-8 text-center text-muted-foreground">
                                Remember your password?{" "}
                                <Link href="/sign-in" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
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
                        Secure Password Reset
                    </h2>
                    <p className="text-white/80 max-w-md">
                        We&apos;ll send you a secure link to reset your password. The link
                        will expire after 24 hours for your security.
                    </p>
                </div>
            </div>
        </div>
    );
}
