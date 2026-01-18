"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "midnight" | "damascus" | "arctic" | "cyber" | "royal";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: Theme; name: string; colors: { bg: string; accent: string } }[] = [
    { id: "midnight", name: "Midnight", colors: { bg: "#020617", accent: "#a855f7" } },
    { id: "damascus", name: "Damascus", colors: { bg: "#1a1a0f", accent: "#d4a574" } },
    { id: "arctic", name: "Arctic", colors: { bg: "#f8fafc", accent: "#3b82f6" } },
    { id: "cyber", name: "Cyber", colors: { bg: "#0a0a0f", accent: "#00ffff" } },
    { id: "royal", name: "Royal", colors: { bg: "#0f172a", accent: "#eab308" } },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("midnight");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("promptlens-theme") as Theme | null;
        if (stored && THEMES.find(t => t.id === stored)) {
            setThemeState(stored);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("promptlens-theme", theme);
        }
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
