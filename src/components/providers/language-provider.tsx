"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/stores/language-store";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const language = useLanguageStore((state) => state.language);

    useEffect(() => {
        // Update HTML attributes when language changes
        const html = document.documentElement;
        html.setAttribute("lang", language);
        html.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
    }, [language]);

    return <>{children}</>;
}
