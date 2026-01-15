"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SaveButtonProps {
    promptId: string;
    variant?: "icon" | "full";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function SaveButton({
    promptId,
    variant = "icon",
    size = "md",
    className,
}: SaveButtonProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Check if prompt is saved on mount
    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user) {
            setIsChecking(false);
            return;
        }

        const checkSaved = async () => {
            try {
                const res = await fetch(`/api/pocket/check?promptId=${promptId}`);
                const data = await res.json();
                setIsSaved(data.isSaved);
            } catch (error) {
                console.error("Error checking saved status:", error);
            } finally {
                setIsChecking(false);
            }
        };

        checkSaved();
    }, [promptId, session, status]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.user) {
            toast.info("Sign in to save prompts", {
                description: "Create an account to start building your Pocket",
                action: {
                    label: "Sign in",
                    onClick: () => router.push("/sign-in"),
                },
            });
            return;
        }

        setIsLoading(true);

        try {
            if (isSaved) {
                // Remove from pocket
                const res = await fetch(`/api/pocket?promptId=${promptId}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    setIsSaved(false);
                    toast.success("Removed from Pocket");
                } else {
                    throw new Error("Failed to remove");
                }
            } else {
                // Add to pocket
                const res = await fetch("/api/pocket", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promptId }),
                });

                if (res.ok) {
                    setIsSaved(true);
                    toast.success("Saved to Pocket", {
                        description: "View your saved prompts anytime",
                        action: {
                            label: "View Pocket",
                            onClick: () => router.push("/pocket"),
                        },
                    });
                } else {
                    const data = await res.json();
                    if (data.alreadySaved) {
                        setIsSaved(true);
                        toast.info("Already in your Pocket");
                    } else {
                        throw new Error(data.error || "Failed to save");
                    }
                }
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-10 w-10",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-5 w-5",
    };

    if (variant === "icon") {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSave}
                disabled={isLoading || isChecking}
                className={cn(
                    sizeClasses[size],
                    "rounded-full transition-all duration-200",
                    isSaved
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "hover:bg-muted",
                    className
                )}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isSaved ? "saved" : "unsaved"}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Bookmark
                            className={cn(
                                iconSizes[size],
                                isSaved && "fill-current"
                            )}
                        />
                    </motion.div>
                </AnimatePresence>
            </Button>
        );
    }

    return (
        <Button
            variant={isSaved ? "default" : "outline"}
            onClick={handleToggleSave}
            disabled={isLoading || isChecking}
            className={cn(
                "transition-all duration-200",
                isSaved && "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
                className
            )}
        >
            <Bookmark
                className={cn("h-4 w-4 mr-2", isSaved && "fill-current")}
            />
            {isLoading ? "Saving..." : isSaved ? "Saved" : "Save to Pocket"}
        </Button>
    );
}
