"use client";

import { useState } from "react";
import { Settings2, X, Sparkles, Gauge, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface GenerationSettings {
    quality: "standard" | "hd";
    negativePrompt: string;
    productStrength: number;
    modelId: string;
    seed?: number;
}

interface SettingsModalProps {
    settings: GenerationSettings;
    onSettingsChange: (settings: GenerationSettings) => void;
    trigger?: React.ReactNode;
}

const MODELS = [
    { id: "gemini-3-pro", label: "Gemini 3 Pro", description: "Best quality, slower" },
    { id: "imagen-3", label: "Imagen 3", description: "Google's latest model" },
    { id: "fast", label: "Fast (Turbo)", description: "Quick generations" },
];

const QUALITY_OPTIONS = [
    { id: "standard", label: "Standard", description: "1024x1024" },
    { id: "hd", label: "HD", description: "2048x2048" },
];

export function SettingsModal({ settings, onSettingsChange, trigger }: SettingsModalProps) {
    const [open, setOpen] = useState(false);
    const [localSettings, setLocalSettings] = useState<GenerationSettings>(settings);

    const handleOpen = (isOpen: boolean) => {
        if (isOpen) {
            setLocalSettings(settings);
        }
        setOpen(isOpen);
    };

    const handleSave = () => {
        onSettingsChange(localSettings);
        setOpen(false);
    };

    const handleReset = () => {
        const defaultSettings: GenerationSettings = {
            quality: "standard",
            negativePrompt: "",
            productStrength: 80,
            modelId: "gemini-3-pro",
        };
        setLocalSettings(defaultSettings);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white rounded-lg">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Settings2 className="h-5 w-5 text-purple-400" />
                        Advanced Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Model Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm text-zinc-400">AI Model</Label>
                        <Select
                            value={localSettings.modelId}
                            onValueChange={(value) => setLocalSettings({ ...localSettings, modelId: value })}
                        >
                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-400" />
                                    <SelectValue placeholder="Select model" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {MODELS.map((model) => (
                                    <SelectItem key={model.id} value={model.id} className="text-zinc-200">
                                        <div className="flex flex-col">
                                            <span>{model.label}</span>
                                            <span className="text-xs text-zinc-500">{model.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quality Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm text-zinc-400">Output Quality</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {QUALITY_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setLocalSettings({ ...localSettings, quality: option.id as "standard" | "hd" })}
                                    className={cn(
                                        "p-3 rounded-lg border text-left transition-all",
                                        localSettings.quality === option.id
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="font-medium text-sm">{option.label}</div>
                                    <div className="text-xs text-zinc-500">{option.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Strength Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm text-zinc-400">Product Integrity</Label>
                            <span className="text-sm text-purple-400 font-medium">{localSettings.productStrength}%</span>
                        </div>
                        <Slider
                            value={[localSettings.productStrength]}
                            onValueChange={([value]) => setLocalSettings({ ...localSettings, productStrength: value })}
                            min={50}
                            max={100}
                            step={5}
                            className="[&_[role=slider]]:bg-purple-500"
                        />
                        <p className="text-xs text-zinc-500">
                            Higher values preserve more of the original product details
                        </p>
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Minus className="h-4 w-4 text-zinc-500" />
                            <Label className="text-sm text-zinc-400">Negative Prompt</Label>
                        </div>
                        <Textarea
                            value={localSettings.negativePrompt}
                            onChange={(e) => setLocalSettings({ ...localSettings, negativePrompt: e.target.value })}
                            placeholder="Elements to avoid in generation (e.g., blurry, distorted, watermark)"
                            className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 resize-none h-20"
                        />
                    </div>

                    {/* Optional Seed */}
                    <div className="space-y-2">
                        <Label className="text-sm text-zinc-400">Seed (Optional)</Label>
                        <Input
                            type="number"
                            value={localSettings.seed || ""}
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                seed: e.target.value ? parseInt(e.target.value) : undefined
                            })}
                            placeholder="Leave empty for random"
                            className="bg-zinc-950 border-zinc-800 text-zinc-200"
                        />
                        <p className="text-xs text-zinc-500">
                            Use the same seed for reproducible results
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-zinc-400 hover:text-zinc-200"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        Apply Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
