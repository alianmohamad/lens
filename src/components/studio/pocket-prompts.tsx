"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface PocketPromptsProps {
    onSelect: (prompt: string) => void;
}

interface SavedPrompt {
    id: string;
    savedAt: string;
    prompt: {
        id: string;
        promptText: string; // Assuming 'content' or 'text' exists, need to verify API response
        title?: string;
    };
}

export function PocketPrompts({ onSelect }: PocketPromptsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchPrompts();
        }
    }, [isOpen]);

    const fetchPrompts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/pocket");
            if (res.ok) {
                const data = await res.json();
                setPrompts(data.savedPrompts || []);
            }
        } catch (error) {
            console.error("Failed to fetch pocket prompts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPrompts = prompts.filter(p =>
        (p.prompt.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.prompt.promptText || "").toLowerCase().includes(search.toLowerCase()) // Adjust based on actual field
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    <Bookmark className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden"
                align="start"
                sideOffset={8}
            >
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search saved prompts..."
                        className="h-8 border-none bg-transparent focus-visible:ring-0 px-0 placeholder:text-zinc-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-20 text-zinc-400">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Loading...
                            </div>
                        ) : filteredPrompts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-20 text-zinc-500 text-sm">
                                <p>No saved prompts found</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {filteredPrompts.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onSelect(item.prompt.promptText || item.prompt.title || ""); // Fallback
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-200 line-clamp-1 group-hover:text-purple-500 transition-colors">
                                                {item.prompt.title || "Untitled Prompt"}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 shrink-0">
                                                {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                            {item.prompt.promptText || "No content"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
