"use client";

import { useState } from "react";
import { PromptCard } from "@/components/marketplace/prompt-card";
import { PromptPreviewDialog } from "@/components/marketplace/prompt-preview-dialog";
import type { PromptCardData } from "@/types";

interface PromptGridProps {
    prompts: PromptCardData[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
    const [selectedPrompt, setSelectedPrompt] = useState<PromptCardData | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (prompt: PromptCardData) => {
        setSelectedPrompt(prompt);
        setIsPreviewOpen(true);
    };

    return (
        <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prompts.map((prompt) => (
                    <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onPreview={handlePreview}
                    />
                ))}
            </div>

            <PromptPreviewDialog
                prompt={selectedPrompt}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
            />
        </>
    );
}
