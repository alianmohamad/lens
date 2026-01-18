"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { useTheme, THEMES, Theme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Theme</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-56 p-2"
                align="end"
                sideOffset={8}
            >
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                        Theme
                    </p>
                    {THEMES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id);
                                setOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors",
                                theme === t.id
                                    ? "bg-accent/20 text-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {/* Color Swatch */}
                            <div
                                className="w-8 h-5 rounded-md border border-border/50 flex overflow-hidden"
                                style={{ background: t.colors.bg }}
                            >
                                <div
                                    className="w-1/2 h-full"
                                    style={{ background: t.colors.bg }}
                                />
                                <div
                                    className="w-1/2 h-full"
                                    style={{ background: t.colors.accent }}
                                />
                            </div>

                            {/* Theme Name */}
                            <span className="flex-1 text-left font-medium">
                                {t.name}
                            </span>

                            {/* Selected Indicator */}
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 transition-colors",
                                theme === t.id
                                    ? "border-accent bg-accent"
                                    : "border-muted-foreground/30"
                            )}>
                                {theme === t.id && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
