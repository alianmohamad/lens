import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Language = "en" | "ar";

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: "en",
            setLanguage: (language: Language) => set({ language }),
        }),
        {
            name: "zerolens-language",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Selector hook for performance
export const useLanguage = () => useLanguageStore((state) => state.language);
