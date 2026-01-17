
"use client";

import * as React from "react";
import { Upload, Wand2, Settings2, Image as ImageIcon, Sparkles, Send, ChevronUp, Layers, Ratio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface StudioBottomBarProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    uploadedImage: string | null;

    // State
    prompt: string;
    setPrompt: (v: string) => void;
    stylePreset: string;
    setStylePreset: (v: string) => void;
    aspectRatio: string;
    setAspectRatio: (v: string) => void;
}

export function StudioBottomBar({
    onUpload,
    onGenerate,
    isGenerating,
    uploadedImage,
    prompt,
    setPrompt,
    stylePreset,
    setStylePreset,
    aspectRatio,
    setAspectRatio
}: StudioBottomBarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Style Presets
    const STYLES = [
        { id: "realistic", label: "Realistic" },
        { id: "studio", label: "Studio" },
        { id: "neon", label: "Neon" },
        { id: "moody", label: "Moody" },
        { id: "bw", label: "B&W" },
    ];

    // Ratio Presets
    const RATIOS = [
        { id: "1:1", label: "Square (1:1)" },
        { id: "4:5", label: "Portrait (4:5)" },
        { id: "16:9", label: "Landscape (16:9)" },
    ];

    return (
        <div className="pointer-events-auto w-full max-w-5xl mx-auto flex items-end justify-center gap-4">

            {/* PILL 1: TOOLS & CONFIGURATION */}
            <TooltipProvider>
                <motion.div
                    className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl h-[60px]"
                >
                    {/* Upload Action */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploadedImage ? (
                                    <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-zinc-700">
                                        <img src={uploadedImage} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <Upload className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-xs">Upload Image</TooltipContent>
                    </Tooltip>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onUpload} />

                    <div className="h-6 w-px bg-zinc-800" />

                    {/* Style Select */}
                    <Select value={stylePreset} onValueChange={setStylePreset}>
                        <SelectTrigger className="w-[110px] h-10 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Layers className="h-3 w-3 text-zinc-500" />
                                <SelectValue placeholder="Style" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            {STYLES.map(s => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Ratio Select */}
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="w-[110px] h-10 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Ratio className="h-3 w-3 text-zinc-500" />
                                <SelectValue placeholder="Ratio" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            {RATIOS.map(s => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-zinc-800" />

                    {/* Advanced Toggle (Placeholder) */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white rounded-lg">
                                <Settings2 className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-xs">Advanced Settings</TooltipContent>
                    </Tooltip>

                </motion.div>
            </TooltipProvider>

            {/* PILL 2: CHAT & GENERATE */}
            <motion.div
                layout
                className={cn(
                    "flex-1 max-w-xl min-w-[300px] flex items-end gap-2 p-2 rounded-[1.5rem] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl transition-all duration-300",
                    isFocused ? "rounded-3xl" : ""
                )}
            >
                <div
                    className="flex-1 relative bg-zinc-950/50 rounded-2xl border border-zinc-800/50 focus-within:border-purple-500/50 focus-within:bg-zinc-950 transition-colors"
                    onClick={() => textareaRef.current?.focus()}
                >
                    <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask AI to change something..."
                        className={cn(
                            "w-full bg-transparent border-none text-sm resize-none focus-visible:ring-0 px-4 py-3.5 custom-scrollbar placeholder:text-zinc-600 font-medium",
                            isFocused ? "h-24" : "h-[44px]" // Height matches button
                        )}
                        style={{ minHeight: "44px" }}
                    />
                </div>

                <Button
                    size="icon"
                    className={cn(
                        "h-[44px] w-[44px] rounded-xl shadow-lg shadow-purple-900/20 transition-all shrink-0 mb-[1px]", // mb to align with input
                        isGenerating ? "bg-zinc-800 cursor-wait" : "bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95"
                    )}
                    onClick={onGenerate}
                    disabled={isGenerating || !uploadedImage}
                    title="Generate (Ctrl+Enter)"
                >
                    {isGenerating ? (
                        <Wand2 className="h-5 w-5 animate-spin text-purple-500" />
                    ) : (
                        <Send className="h-5 w-5 ml-0.5" />
                    )}
                </Button>
            </motion.div>

        </div>
    );
}
