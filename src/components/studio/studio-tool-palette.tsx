
"use client";

import * as React from "react";
import { MousePointer2, Hand, Eraser, Maximize, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface StudioToolPaletteProps {
    activeTool: "select" | "hand";
    setActiveTool: (tool: "select" | "hand") => void;
    onFitToScreen?: () => void;
}

export function StudioToolPalette({ activeTool, setActiveTool, onFitToScreen }: StudioToolPaletteProps) {
    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex flex-col gap-2 p-2 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl pointer-events-auto">
                <ToolButton
                    active={activeTool === "select"}
                    onClick={() => setActiveTool("select")}
                    icon={<MousePointer2 className="h-5 w-5" />}
                    label="Select (V)"
                />
                <ToolButton
                    active={activeTool === "hand"}
                    onClick={() => setActiveTool("hand")}
                    icon={<Hand className="h-5 w-5" />}
                    label="Pan (H)"
                />

                <div className="h-px w-8 bg-zinc-800 mx-auto my-1" />

                <ToolButton
                    onClick={onFitToScreen}
                    icon={<Maximize className="h-5 w-5" />}
                    label="Fit to Screen"
                />
                {/* Placeholders for Undo/Redo */}
                <div className="h-px w-8 bg-zinc-800 mx-auto my-1" />
                <ToolButton
                    onClick={() => { }}
                    icon={<Undo2 className="h-5 w-5 text-zinc-600" />} // Disabled look
                    label="Undo (Coming Soon)"
                />
            </div>
        </TooltipProvider>
    );
}

function ToolButton({ active, onClick, icon, label }: { active?: boolean; onClick?: () => void; icon: React.ReactNode; label: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClick}
                    className={cn(
                        "rounded-full h-10 w-10 transition-all duration-200",
                        active
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50 hover:bg-purple-500"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800 text-xs">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}
