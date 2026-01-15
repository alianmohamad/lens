"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Marketplace Error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                We couldn't load the marketplace. This might be a temporary connection issue.
            </p>
            {error.digest && (
                <p className="text-xs font-mono text-muted-foreground/50 mb-8 p-2 bg-muted rounded">
                    Error ID: {error.digest}
                </p>
            )}
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Refresh Page
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
        </div>
    );
}
