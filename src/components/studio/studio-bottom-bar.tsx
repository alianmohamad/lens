
"use client";

import * as React from "react";
import { Upload, Wand2, Settings2, Sparkles, Send, Layers, Ratio, Plus } from "lucide-react";
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
    const [showTools, setShowTools] = React.useState(false);
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
        { id: "1:1", label: "1:1" },
        { id: "4:5", label: "4:5" },
        { id: "16:9", label: "16:9" },
    ];

    return (
        <div className="pointer-events-auto w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-center gap-2 md:gap-3">

            {/* MOBILE: Unified Bar | DESKTOP: Split Pills */}

            {/* DESKTOP ONLY: Tool Pill */}
            <TooltipProvider>
                <motion.div
                    className="hidden md:flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl h-[56px]"
                >
                    {/* Upload Action */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploadedImage ? (
                                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-zinc-700">
                                        <img src={uploadedImage} className="h-full w-full object-cover" alt="Uploaded" />
                                    </div>
                                ) : (
                                    <Upload className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-xs">Upload Image</TooltipContent>
                    </Tooltip>

                    <div className="h-5 w-px bg-zinc-800" />

                    {/* Style Select */}
                    <Select value={stylePreset} onValueChange={setStylePreset}>
                        <SelectTrigger className="w-[100px] h-9 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0 rounded-lg">
                            <div className="flex items-center gap-1.5">
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
                        <SelectTrigger className="w-[80px] h-9 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0 rounded-lg">
                            <div className="flex items-center gap-1.5">
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

                    <div className="h-5 w-px bg-zinc-800" />

                    {/* Advanced Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white rounded-lg">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-xs">Advanced Settings</TooltipContent>
                    </Tooltip>
                </motion.div>
            </TooltipProvider>

            {/* CHAT PILL (Responsive) */}
            <motion.div
                layout
                className={cn(
                    "w-full md:flex-1 md:max-w-xl md:min-w-[280px] flex items-end gap-2 p-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl transition-all duration-300"
                )}
            >
                {/* MOBILE ONLY: Embedded Upload Button */}
                <div className="md:hidden shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploadedImage ? (
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-zinc-700">
                                <img src={uploadedImage} className="h-full w-full object-cover" alt="Uploaded" />
                            </div>
                        ) : (
                            <Plus className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* MOBILE ONLY: Tools Popover */}
                <div className="md:hidden shrink-0">
                    <Popover open={showTools} onOpenChange={setShowTools}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            >
                                <Settings2 className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="top"
                            align="start"
                            className="w-56 bg-zinc-900 border-zinc-800 p-3 rounded-xl"
                        >
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Style</label>
                                    <Select value={stylePreset} onValueChange={setStylePreset}>
                                        <SelectTrigger className="w-full h-9 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0">
                                            <SelectValue placeholder="Style" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            {STYLES.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Aspect Ratio</label>
                                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                        <SelectTrigger className="w-full h-9 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0">
                                            <SelectValue placeholder="Ratio" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            {RATIOS.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Textarea */}
                <div
                    className="flex-1 relative bg-zinc-950/50 rounded-xl border border-zinc-800/50 focus-within:border-purple-500/50 focus-within:bg-zinc-950 transition-colors"
                    onClick={() => textareaRef.current?.focus()}
                >
                    <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Describe your vision..."
                        className={cn(
                            "w-full bg-transparent border-none text-sm resize-none focus-visible:ring-0 px-3 py-2.5 custom-scrollbar placeholder:text-zinc-600 font-medium",
                            isFocused ? "h-20" : "h-10"
                        )}
                        style={{ minHeight: "40px" }}
                    />
                </div>

                {/* Generate Button */}
                <Button
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-xl shadow-lg shadow-purple-900/20 transition-all shrink-0",
                        isGenerating ? "bg-zinc-800 cursor-wait" : "bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95"
                    )}
                    onClick={onGenerate}
                    disabled={isGenerating || !uploadedImage}
                    title="Generate"
                >
                    {isGenerating ? (
                        <Wand2 className="h-4 w-4 animate-spin text-purple-500" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}
                </Button>
            </motion.div>

            {/* Hidden File Input */}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={onUpload} />
        </div>
    );
}
