import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PromptCardData, LocalCartItem } from "@/types";

interface CartState {
    items: LocalCartItem[];
    isOpen: boolean;

    // Actions
    addItem: (prompt: PromptCardData) => void;
    removeItem: (promptId: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    isInCart: (promptId: string) => boolean;

    // Computed
    getItemCount: () => number;
    getSubtotal: () => number;
    getPlatformFee: () => number;
    getTotal: () => number;
}

const PLATFORM_FEE_RATE = 0; // Buyers don't pay platform fee, sellers do

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (prompt: PromptCardData) => {
                const { items } = get();
                const exists = items.some((item) => item.promptId === prompt.id);

                if (!exists) {
                    set({
                        items: [
                            ...items,
                            {
                                promptId: prompt.id,
                                prompt,
                                addedAt: new Date(),
                            },
                        ],
                    });
                }
            },

            removeItem: (promptId: string) => {
                set({
                    items: get().items.filter((item) => item.promptId !== promptId),
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            toggleCart: () => {
                set({ isOpen: !get().isOpen });
            },

            openCart: () => {
                set({ isOpen: true });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            isInCart: (promptId: string) => {
                return get().items.some((item) => item.promptId === promptId);
            },

            getItemCount: () => {
                return get().items.length;
            },

            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.prompt.price, 0);
            },

            getPlatformFee: () => {
                return Math.round(get().getSubtotal() * PLATFORM_FEE_RATE);
            },

            getTotal: () => {
                return get().getSubtotal() + get().getPlatformFee();
            },
        }),
        {
            name: "promptlens-cart",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }), // Only persist items
        }
    )
);

// Selector hooks for performance
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsOpen = () => useCartStore((state) => state.isOpen);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
