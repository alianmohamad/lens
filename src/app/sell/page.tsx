"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileText,
    DollarSign,
    Eye,
    Image as ImageIcon,
    Sparkles,
    Lock,
    AlertCircle,
    Plus,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createPromptSchema, type CreatePromptSchema } from "@/lib/validations";
import { CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const steps = [
    { id: 1, title: "Details", icon: FileText },
    { id: 2, title: "Prompt", icon: Sparkles },
    { id: 3, title: "Images", icon: ImageIcon },
    { id: 4, title: "Pricing", icon: DollarSign },
    { id: 5, title: "Preview", icon: Eye },
];

export default function SellPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<CreatePromptSchema>({
        resolver: zodResolver(createPromptSchema),
        defaultValues: {
            tags: [],
            exampleImages: [],
            price: 499,
        },
    });

    const watchedValues = watch();

    // Auth check
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="section-container py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Sign in Required</h1>
                        <p className="text-muted-foreground mb-6">
                            You need to be signed in to create and sell prompts.
                        </p>
                        <Button
                            size="lg"
                            className="btn-premium"
                            onClick={() => router.push("/sign-in?callbackUrl=/sell")}
                        >
                            Sign in to Continue
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="section-container py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Become a Seller</h1>
                        <p className="text-muted-foreground mb-6">
                            Upgrade your account to start selling prompts and earn 70% on every sale.
                        </p>
                        <Button
                            size="lg"
                            className="btn-premium"
                            onClick={() => router.push("/dashboard/settings")}
                        >
                            Upgrade Account
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const handleNext = async () => {
        let fieldsToValidate: (keyof CreatePromptSchema)[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = ["title", "description", "category"];
                break;
            case 2:
                fieldsToValidate = ["promptText"];
                break;
            case 3:
                fieldsToValidate = ["tags", "exampleImages"];
                break;
            case 4:
                fieldsToValidate = ["price"];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 5));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && watchedValues.tags.length < 10) {
            const newTags = [...watchedValues.tags, tagInput.trim().toLowerCase()];
            setValue("tags", newTags);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setValue(
            "tags",
            watchedValues.tags.filter((tag) => tag !== tagToRemove)
        );
    };

    const onSubmit = async (data: CreatePromptSchema) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create prompt");
            }

            router.push("/dashboard?created=true");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="section-container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-4">Create Prompt</Badge>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Sell Your <span className="gradient-text">Expertise</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Create a prompt and start earning 70% on every sale
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                                    disabled={step.id > currentStep}
                                    className={cn(
                                        "flex flex-col items-center gap-2 transition-all",
                                        step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                                            step.id === currentStep
                                                ? "gradient-bg text-white glow"
                                                : step.id < currentStep
                                                    ? "bg-green-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {step.id < currentStep ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs font-medium hidden sm:block",
                                            step.id === currentStep
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-8 sm:w-16 lg:w-24 h-0.5 mx-2",
                                            step.id < currentStep ? "bg-green-500" : "bg-muted"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 max-w-2xl mx-auto"
                    >
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                    </motion.div>
                )}

                {/* Form Steps */}
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
                    <Card className="min-h-[400px]">
                        <CardContent className="p-6">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Details */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Prompt Details</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Give your prompt a compelling title and description
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Luxury Product on Marble Surface"
                                                className={cn(
                                                    "h-12",
                                                    errors.title && "border-destructive"
                                                )}
                                                {...register("title")}
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-destructive">{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe what makes your prompt special and the results it produces..."
                                                className={cn(
                                                    "min-h-[120px] resize-none",
                                                    errors.description && "border-destructive"
                                                )}
                                                {...register("description")}
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-destructive">{errors.description.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={watchedValues.category}
                                                onValueChange={(value) => setValue("category", value as CreatePromptSchema["category"])}
                                            >
                                                <SelectTrigger
                                                    className={cn(
                                                        "h-12",
                                                        errors.category && "border-destructive"
                                                    )}
                                                >
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-destructive">{errors.category.message}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Prompt */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Your Prompt</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Enter the prompt text that will be used for AI generation
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="promptText">Prompt Text</Label>
                                            <Textarea
                                                id="promptText"
                                                placeholder="Enter your detailed prompt for generating product images. Include style, lighting, background, and any specific instructions..."
                                                className={cn(
                                                    "min-h-[240px] resize-none font-mono text-sm",
                                                    errors.promptText && "border-destructive"
                                                )}
                                                {...register("promptText")}
                                            />
                                            {errors.promptText && (
                                                <p className="text-sm text-destructive">{errors.promptText.message}</p>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                            <h4 className="font-medium text-sm mb-2">💡 Tips for Great Prompts</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Be specific about lighting conditions and style</li>
                                                <li>• Include camera angle and perspective details</li>
                                                <li>• Describe the background and environment</li>
                                                <li>• Add mood and aesthetic descriptors</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Images & Tags */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Tags & Examples</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Add tags and example images to showcase your prompt
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        <div className="space-y-2">
                                            <Label>Tags (up to 10)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add a tag..."
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddTag();
                                                        }
                                                    }}
                                                    className="h-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleAddTag}
                                                    disabled={watchedValues.tags.length >= 10}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {watchedValues.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTag(tag)}
                                                            className="ml-1 hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            {errors.tags && (
                                                <p className="text-sm text-destructive">{errors.tags.message}</p>
                                            )}
                                        </div>

                                        {/* Example Images */}
                                        <div className="space-y-2">
                                            <Label>Example Images</Label>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Upload up to 5 images showing results from your prompt
                                            </p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                                    >
                                                        <Plus className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.exampleImages && (
                                                <p className="text-sm text-destructive">{errors.exampleImages.message}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Note: Image upload will be functional once Uploadthing is configured
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 4: Pricing */}
                                {currentStep === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Set Your Price</h2>
                                            <p className="text-sm text-muted-foreground">
                                                You'll earn 70% of every sale
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (USD)</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    min={0.99}
                                                    max={99.99}
                                                    step={0.01}
                                                    className={cn(
                                                        "h-12 pl-10 text-lg font-semibold",
                                                        errors.price && "border-destructive"
                                                    )}
                                                    value={(watchedValues.price / 100).toFixed(2)}
                                                    onChange={(e) => setValue("price", Math.round(parseFloat(e.target.value) * 100))}
                                                />
                                            </div>
                                            {errors.price && (
                                                <p className="text-sm text-destructive">{errors.price.message}</p>
                                            )}
                                        </div>

                                        {/* Revenue Breakdown */}
                                        <Card className="bg-muted/50">
                                            <CardContent className="pt-6">
                                                <h4 className="font-medium mb-4">Revenue Breakdown</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Sale Price</span>
                                                        <span className="font-medium">
                                                            ${(watchedValues.price / 100).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Platform Fee (30%)</span>
                                                        <span className="text-muted-foreground">
                                                            -${((watchedValues.price * 0.3) / 100).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-border pt-3 flex justify-between">
                                                        <span className="font-semibold">Your Earnings</span>
                                                        <span className="font-bold text-lg text-green-500">
                                                            ${((watchedValues.price * 0.7) / 100).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Step 5: Preview */}
                                {currentStep === 5 && (
                                    <motion.div
                                        key="step5"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Review & Submit</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Review your prompt before submitting for approval
                                            </p>
                                        </div>

                                        <Card>
                                            <CardContent className="pt-6 space-y-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Title</p>
                                                    <p className="font-semibold">{watchedValues.title || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Category</p>
                                                    <Badge variant="outline">
                                                        {watchedValues.category ? CATEGORY_LABELS[watchedValues.category] : "-"}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Description</p>
                                                    <p className="text-sm">{watchedValues.description || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Tags</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {watchedValues.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Price</p>
                                                    <p className="font-bold text-lg gradient-text">
                                                        ${(watchedValues.price / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                                <strong>Note:</strong> Your prompt will be reviewed by our team before it becomes available in the marketplace. This usually takes 24-48 hours.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 5 ? (
                            <Button type="button" onClick={handleNext} className="btn-premium">
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="btn-premium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Submit for Review
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
