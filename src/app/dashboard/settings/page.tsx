"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    User,
    Mail,
    FileText,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Shield,
    Store,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    bio: string | null;
    createdAt: string;
    _count: {
        prompts: number;
        purchases: number;
        reviews: number;
        images: number;
    };
}

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch("/api/user/profile");
                const data = await response.json();
                if (data.success && data.data) {
                    setProfile(data.data.user);
                    reset({
                        name: data.data.user.name || "",
                        bio: data.data.user.bio || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setErrorMessage("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        }

        if (session?.user) {
            fetchProfile();
        }
    }, [session, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        setIsSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage("Profile updated successfully");
                setProfile((prev) => prev ? { ...prev, ...result.data } : null);
                // Update the session
                await update({ name: data.name });
                reset(data);
            } else {
                setErrorMessage(result.error || "Failed to update profile");
            }
        } catch (err) {
            setErrorMessage("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        router.push("/sign-in?callbackUrl=/dashboard/settings");
        return null;
    }

    const isSeller = session.user.role === "SELLER" || session.user.role === "ADMIN";

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)' }} />

            <Navbar />

            <main className="section-container py-12 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Success/Error Messages */}
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                                    >
                                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                        <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                                    </motion.div>
                                )}

                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                                    >
                                        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                                        <p className="text-sm text-destructive">{errorMessage}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Avatar Preview */}
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={profile?.image || undefined} />
                                            <AvatarFallback className="text-2xl gradient-bg text-white">
                                                {profile?.name?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{profile?.name || "User"}</p>
                                            <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="Enter your name"
                                                className={cn(
                                                    "h-12 pl-10",
                                                    errors.name && "border-destructive"
                                                )}
                                                {...register("name")}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                value={profile?.email || ""}
                                                className="h-12 pl-10 bg-muted"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us about yourself..."
                                                className={cn(
                                                    "min-h-[120px] pl-10 pt-2",
                                                    errors.bio && "border-destructive"
                                                )}
                                                {...register("bio")}
                                                disabled={isSaving}
                                            />
                                        </div>
                                        {errors.bio && (
                                            <p className="text-sm text-destructive">{errors.bio.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="btn-premium"
                                        disabled={isSaving || !isDirty}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Type Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Type
                                </CardTitle>
                                <CardDescription>
                                    Your current account role and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                                    <div className="flex items-center gap-3">
                                        {isSeller ? (
                                            <Store className="h-8 w-8 text-primary" />
                                        ) : (
                                            <User className="h-8 w-8 text-primary" />
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {session.user.role === "ADMIN"
                                                    ? "Administrator"
                                                    : isSeller
                                                    ? "Seller Account"
                                                    : "Buyer Account"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {isSeller
                                                    ? "You can create and sell prompts"
                                                    : "You can purchase and use prompts"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={isSeller ? "default" : "secondary"}>
                                        {session.user.role}
                                    </Badge>
                                </div>

                                {!isSeller && (
                                    <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                                        <h4 className="font-medium mb-2">Want to sell prompts?</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Upgrade to a seller account and earn 70% on every sale.
                                        </p>
                                        <Button variant="outline" size="sm">
                                            <Store className="h-4 w-4 mr-2" />
                                            Become a Seller
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Account Stats */}
                    <div className="space-y-6">
                        {/* Account Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Purchases</span>
                                    <span className="font-semibold">{profile?._count?.purchases || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Reviews</span>
                                    <span className="font-semibold">{profile?._count?.reviews || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Images Generated</span>
                                    <span className="font-semibold">{profile?._count?.images || 0}</span>
                                </div>
                                {isSeller && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Prompts Created</span>
                                            <span className="font-semibold">{profile?._count?.prompts || 0}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Settings */}
                        {isSeller && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Connect your Stripe account to receive payouts from your sales.
                                    </p>
                                    <Button variant="outline" className="w-full">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Connect Stripe
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Member Since */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Member since</p>
                                <p className="font-medium">
                                    {profile?.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                                              month: "long",
                                              year: "numeric",
                                          })
                                        : "N/A"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
