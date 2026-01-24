"use client";

import * as React from "react";
import { Upload, Wand2, Settings2, Sparkles, Layers, Ratio, Plus } from "lucide-react";
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
import { SettingsModal, type GenerationSettings } from "./settings-modal";
import { PocketPrompts } from "./pocket-prompts";

interface StudioBottomBarProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    uploadedImage: string | null;
    generationStage?: "idle" | "uploading" | "generating" | "processing";

    // State
    prompt: string;
    setPrompt: (v: string) => void;
    stylePreset: string;
    setStylePreset: (v: string) => void;
    aspectRatio: string;
    setAspectRatio: (v: string) => void;
    // New
    modelId: string;
    setModelId: (v: string) => void;
    // Advanced Settings
    advancedSettings?: GenerationSettings;
    onAdvancedSettingsChange?: (settings: GenerationSettings) => void;
}

export function StudioBottomBar({
    onUpload,
    onGenerate,
    isGenerating,
    uploadedImage,
    generationStage = "idle",
    prompt,
    setPrompt,
    stylePreset,
    setStylePreset,
    aspectRatio,
    setAspectRatio,
    modelId,
    setModelId,
    advancedSettings,
    onAdvancedSettingsChange
}: StudioBottomBarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showTools, setShowTools] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = '40px';
        // Set height based on content, with max limit
        const newHeight = Math.min(Math.max(40, textarea.scrollHeight), 120);
        textarea.style.height = `${newHeight}px`;
    }, [prompt]);

    // Default advanced settings
    const defaultSettings: GenerationSettings = {
        quality: "standard",
        negativePrompt: "",
        productStrength: 80,
        modelId: modelId,
    };
    const settings = advancedSettings || defaultSettings;

    // Style Presets
    const STYLES = [
        { id: "realistic", label: "Realistic" },
        { id: "studio", label: "Studio" },
        { id: "neon", label: "Neon" },
        { id: "moody", label: "Moody" },
        { id: "bw", label: "B&W" },
    ];

    // Models
    const MODELS = [
        { id: "gemini-3-pro", label: "Gemini 3 Pro" },
        { id: "imagen-3", label: "Imagen 3" },
        { id: "fast", label: "Fast (Turbo)" },
    ];

    // Ratio Presets
    const RATIOS = [
        { id: "1:1", label: "1:1" },
        { id: "4:5", label: "4:5" },
        { id: "16:9", label: "16:9" },
    ];

    return (
        <div className="pointer-events-auto w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-center gap-2 md:gap-3 px-1 md:px-0">

            {/* MOBILE: Unified Bar | DESKTOP: Split Pills */}

            {/* DESKTOP ONLY: Tool Pill */}
            <TooltipProvider>
                <motion.div
                    className="hidden md:flex items-center gap-1.5 p-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl h-[56px]"
                >
                    {/* Upload Action */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploadedImage ? (
                                    <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-700">
                                        <img src={uploadedImage} className="h-full w-full object-cover" alt="Uploaded" />
                                    </div>
                                ) : (
                                    <Upload className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs">Upload Image</TooltipContent>
                    </Tooltip>

                    <div className="h-6 w-px bg-slate-200 dark:bg-zinc-700/50 mx-0.5" />

                    {/* Model Select */}
                    <Select value={modelId} onValueChange={setModelId}>
                        <SelectTrigger className="w-[130px] h-9 bg-slate-100 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-700/50 text-xs text-slate-700 dark:text-zinc-300 focus:ring-0 rounded-lg px-2.5 gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                                <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
                                <SelectValue placeholder="Model" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                            {MODELS.map(m => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Style Select */}
                    <Select value={stylePreset} onValueChange={setStylePreset}>
                        <SelectTrigger className="w-[110px] h-9 bg-slate-100 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-700/50 text-xs text-slate-700 dark:text-zinc-300 focus:ring-0 rounded-lg px-2.5 gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                                <Layers className="h-3 w-3 text-zinc-500 shrink-0" />
                                <SelectValue placeholder="Style" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                            {STYLES.map(s => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Ratio Select */}
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="w-[75px] h-9 bg-slate-100 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-700/50 text-xs text-slate-700 dark:text-zinc-300 focus:ring-0 rounded-lg px-2.5 gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                                <Ratio className="h-3 w-3 text-zinc-500 shrink-0" />
                                <SelectValue placeholder="Ratio" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                            {RATIOS.map(s => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-slate-200 dark:bg-zinc-700/50 mx-0.5" />

                    {/* Advanced Settings Modal */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <SettingsModal
                                    settings={settings}
                                    onSettingsChange={(newSettings) => {
                                        onAdvancedSettingsChange?.(newSettings);
                                        if (newSettings.modelId !== modelId) {
                                            setModelId(newSettings.modelId);
                                        }
                                    }}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs">Advanced Settings</TooltipContent>
                    </Tooltip>
                </motion.div>
            </TooltipProvider>

            {/* CHAT PILL (Responsive) */}
            <motion.div
                layout
                className={cn(
                    "w-full md:flex-1 md:max-w-xl md:min-w-[280px] flex items-end gap-2 p-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl transition-all duration-300"
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
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold">Model</label>
                                    <Select value={modelId} onValueChange={setModelId}>
                                        <SelectTrigger className="w-full h-9 bg-zinc-950/50 border-zinc-800 text-xs text-zinc-300 focus:ring-0">
                                            <SelectValue placeholder="Model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            {MODELS.map(m => (
                                                <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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

                {/* Pocket Prompts Button */}
                <div className="shrink-0">
                    <PocketPrompts onSelect={setPrompt} />
                </div>

                {/* Textarea */}
                <div
                    className="flex-1 relative bg-slate-50 dark:bg-zinc-950/50 rounded-xl border border-slate-200 dark:border-zinc-800/50 focus-within:border-purple-500/50 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-colors"
                    onClick={() => textareaRef.current?.focus()}
                >
                    <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your vision..."
                        className="w-full bg-transparent border-none text-sm resize-none focus-visible:ring-0 px-3 py-2.5 custom-scrollbar text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 font-medium overflow-hidden"
                        style={{ height: '40px', minHeight: '40px', maxHeight: '120px' }}
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
