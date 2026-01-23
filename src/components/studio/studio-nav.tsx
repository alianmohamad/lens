"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Download, Check, Pencil, Image, FileImage, Loader2, Cloud, CloudOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import * as fabric from "fabric";

interface StudioNavProps {
    userImage?: string | null;
    canvas?: fabric.Canvas | null;
    projectName?: string;
    onProjectNameChange?: (name: string) => void;
    saveStatus?: "idle" | "saving" | "saved" | "error";
    lastSaved?: Date | null;
}

export function StudioNav({
    userImage,
    canvas,
    projectName = "Untitled Project",
    onProjectNameChange,
    saveStatus = "idle",
    lastSaved
}: StudioNavProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(projectName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditedName(projectName);
    }, [projectName]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleNameSubmit = useCallback(() => {
        const trimmedName = editedName.trim();
        if (trimmedName && trimmedName !== projectName) {
            onProjectNameChange?.(trimmedName);
        } else {
            setEditedName(projectName);
        }
        setIsEditing(false);
    }, [editedName, projectName, onProjectNameChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleNameSubmit();
        } else if (e.key === "Escape") {
            setEditedName(projectName);
            setIsEditing(false);
        }
    }, [handleNameSubmit, projectName]);

    const handleExport = useCallback((format: "png" | "jpeg", withBackground: boolean = true) => {
        if (!canvas) {
            toast.error("Canvas not ready");
            return;
        }

        try {
            // Get canvas dimensions
            const width = canvas.getWidth();
            const height = canvas.getHeight();

            // Create temporary canvas to capture full viewport
            const dataURL = canvas.toDataURL({
                format: format,
                quality: format === "jpeg" ? 0.95 : 1,
                multiplier: 2, // 2x resolution for better quality
                enableRetinaScaling: true,
            });

            // Create download link
            const link = document.createElement("a");
            link.download = `${projectName.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${format}`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to export image");
        }
    }, [canvas, projectName]);

    const formatLastSaved = useCallback(() => {
        if (!lastSaved) return null;
        const now = new Date();
        const diff = now.getTime() - lastSaved.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);

        if (seconds < 10) return "Just now";
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        return lastSaved.toLocaleTimeString();
    }, [lastSaved]);

    return (
        <header className="flex items-center justify-between px-6 py-4 pointer-events-auto w-full">
            {/* Left: Back & Branding */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/50">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide font-display">ZeroLens Studio</span>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <Input
                                ref={inputRef}
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleNameSubmit}
                                onKeyDown={handleKeyDown}
                                className="h-5 text-[10px] px-1 py-0 bg-slate-800 border-slate-600 text-slate-200 w-32"
                                maxLength={50}
                            />
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 group max-w-[120px] md:max-w-[200px]"
                            >
                                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors truncate">
                                    {projectName}
                                </span>
                                <Pencil className="h-2.5 w-2.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                        )}
                        <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Beta</span>
                    </div>
                </div>
            </div>

            {/* Center: Save Status */}
            <div className="hidden md:flex items-center gap-2 text-xs">
                {saveStatus === "saving" && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Saving...</span>
                    </div>
                )}
                {saveStatus === "saved" && lastSaved && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Cloud className="h-3 w-3" />
                        <span>Saved {formatLastSaved()}</span>
                    </div>
                )}
                {saveStatus === "error" && (
                    <div className="flex items-center gap-1.5 text-red-400">
                        <CloudOff className="h-3 w-3" />
                        <span>Save failed</span>
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Export</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 w-48">
                        <DropdownMenuItem
                            onClick={() => handleExport("png", true)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
                        >
                            <Image className="h-4 w-4" />
                            <span>PNG (with background)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleExport("png", false)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
                        >
                            <Image className="h-4 w-4" />
                            <span>PNG (transparent)</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem
                            onClick={() => handleExport("jpeg", true)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
                        >
                            <FileImage className="h-4 w-4" />
                            <span>JPEG (high quality)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="hidden sm:block h-4 w-px bg-slate-800" />

                {/* Theme Switcher - Hidden on mobile */}
                <div className="hidden sm:block">
                    <ThemeSwitcher />
                </div>

                <div className="h-4 w-px bg-slate-800" />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8 border border-slate-700">
                        <AvatarImage src={userImage || undefined} />
                        <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">U</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
        </header>
    )
}
