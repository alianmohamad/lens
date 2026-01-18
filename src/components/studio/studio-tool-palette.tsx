
"use client";

import * as React from "react";
import { MousePointer2, Maximize, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface StudioToolPaletteProps {
    activeTool: "select" | "hand";
    setActiveTool: (tool: "select" | "hand") => void;
    onFitToScreen?: () => void;
}

// Custom Hand SVG icon (simpler than lucide's broken one)
function HandIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16a2 2 0 0 1 0-2.6 2 2 0 0 1 2.8 0L8 15" />
        </svg>
    );
}

export function StudioToolPalette({ activeTool, setActiveTool, onFitToScreen }: StudioToolPaletteProps) {
    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-col gap-2 p-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl pointer-events-auto">
                <ToolButton
                    active={activeTool === "select"}
                    onClick={() => setActiveTool("select")}
                    icon={<MousePointer2 className="h-5 w-5" />}
                    label="Select"
                    shortcut="V"
                />
                <ToolButton
                    active={activeTool === "hand"}
                    onClick={() => setActiveTool("hand")}
                    icon={<HandIcon className="h-5 w-5" />}
                    label="Hand tool"
                    shortcut="H"
                />

                <div className="h-px w-8 bg-zinc-800 mx-auto my-1" />

                <ToolButton
                    onClick={onFitToScreen}
                    icon={<Maximize className="h-4 w-4" />}
                    label="Fit to Screen"
                />

                <div className="h-px w-8 bg-zinc-800 mx-auto my-1" />

                <ToolButton
                    onClick={() => { }}
                    icon={<Undo2 className="h-4 w-4 opacity-40" />}
                    label="Undo (Soon)"
                    disabled
                />
            </div>
        </TooltipProvider>
    );
}

function ToolButton({
    active,
    onClick,
    icon,
    label,
    shortcut,
    disabled
}: {
    active?: boolean;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    disabled?: boolean;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClick}
                    disabled={disabled}
                    className={cn(
                        "rounded-xl h-10 w-10 transition-all duration-200",
                        active
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50 hover:bg-purple-500"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-zinc-900 border-zinc-800 text-xs px-3 py-1.5 flex items-center gap-2"
            >
                <span className="text-white font-medium">{label}</span>
                {shortcut && (
                    <span className="text-zinc-500 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{shortcut}</span>
                )}
            </TooltipContent>
        </Tooltip>
    );
}
