import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Import after mocking localStorage
import { useCartStore } from "@/stores/cart-store";
import type { PromptCardData } from "@/types";

// Sample prompt data for testing
const createMockPrompt = (id: string, price: number): PromptCardData => ({
    id,
    title: `Test Prompt ${id}`,
    description: "A test prompt description",
    category: "FASHION",
    price,
    rating: 4.5,
    reviewCount: 10,
    tags: ["test", "mock"],
    exampleImages: ["https://example.com/image.jpg"],
    creator: {
        id: "creator-1",
        name: "Test Creator",
        image: null,
    },
});

describe("cart-store", () => {
    beforeEach(() => {
        // Reset store state before each test
        localStorageMock.clear();
        useCartStore.setState({ items: [], isOpen: false });
    });

    describe("addItem", () => {
        it("should add a new item to the cart", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt = createMockPrompt("prompt-1", 999);

            act(() => {
                result.current.addItem(prompt);
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].promptId).toBe("prompt-1");
            expect(result.current.items[0].prompt).toEqual(prompt);
        });

        it("should not add duplicate items", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt = createMockPrompt("prompt-1", 999);

            act(() => {
                result.current.addItem(prompt);
                result.current.addItem(prompt);
            });

            expect(result.current.items).toHaveLength(1);
        });

        it("should add multiple unique items", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            act(() => {
                result.current.addItem(prompt1);
                result.current.addItem(prompt2);
            });

            expect(result.current.items).toHaveLength(2);
        });
    });

    describe("removeItem", () => {
        it("should remove an item from the cart", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt = createMockPrompt("prompt-1", 999);

            act(() => {
                result.current.addItem(prompt);
                result.current.removeItem("prompt-1");
            });

            expect(result.current.items).toHaveLength(0);
        });

        it("should only remove the specified item", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            act(() => {
                result.current.addItem(prompt1);
                result.current.addItem(prompt2);
                result.current.removeItem("prompt-1");
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0].promptId).toBe("prompt-2");
        });
    });

    describe("clearCart", () => {
        it("should remove all items from the cart", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            act(() => {
                result.current.addItem(prompt1);
                result.current.addItem(prompt2);
                result.current.clearCart();
            });

            expect(result.current.items).toHaveLength(0);
        });
    });

    describe("cart visibility", () => {
        it("should toggle cart open state", () => {
            const { result } = renderHook(() => useCartStore());

            expect(result.current.isOpen).toBe(false);

            act(() => {
                result.current.toggleCart();
            });

            expect(result.current.isOpen).toBe(true);

            act(() => {
                result.current.toggleCart();
            });

            expect(result.current.isOpen).toBe(false);
        });

        it("should open cart", () => {
            const { result } = renderHook(() => useCartStore());

            act(() => {
                result.current.openCart();
            });

            expect(result.current.isOpen).toBe(true);
        });

        it("should close cart", () => {
            const { result } = renderHook(() => useCartStore());

            act(() => {
                result.current.openCart();
                result.current.closeCart();
            });

            expect(result.current.isOpen).toBe(false);
        });
    });

    describe("isInCart", () => {
        it("should return true if item is in cart", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt = createMockPrompt("prompt-1", 999);

            act(() => {
                result.current.addItem(prompt);
            });

            expect(result.current.isInCart("prompt-1")).toBe(true);
        });

        it("should return false if item is not in cart", () => {
            const { result } = renderHook(() => useCartStore());

            expect(result.current.isInCart("prompt-1")).toBe(false);
        });
    });

    describe("computed values", () => {
        it("should calculate correct item count", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            expect(result.current.getItemCount()).toBe(0);

            act(() => {
                result.current.addItem(prompt1);
            });

            expect(result.current.getItemCount()).toBe(1);

            act(() => {
                result.current.addItem(prompt2);
            });

            expect(result.current.getItemCount()).toBe(2);
        });

        it("should calculate correct subtotal", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            act(() => {
                result.current.addItem(prompt1);
                result.current.addItem(prompt2);
            });

            expect(result.current.getSubtotal()).toBe(2998);
        });

        it("should calculate platform fee as 0 (buyers don't pay fee)", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt = createMockPrompt("prompt-1", 1000);

            act(() => {
                result.current.addItem(prompt);
            });

            expect(result.current.getPlatformFee()).toBe(0);
        });

        it("should calculate correct total", () => {
            const { result } = renderHook(() => useCartStore());
            const prompt1 = createMockPrompt("prompt-1", 999);
            const prompt2 = createMockPrompt("prompt-2", 1999);

            act(() => {
                result.current.addItem(prompt1);
                result.current.addItem(prompt2);
            });

            // Total = subtotal + platform fee (0)
            expect(result.current.getTotal()).toBe(2998);
        });
    });
});
