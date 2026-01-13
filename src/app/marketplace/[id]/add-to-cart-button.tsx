"use client";

import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import type { PromptCardData } from "@/types";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    prompt: PromptCardData;
}

export function AddToCartButton({ prompt }: AddToCartButtonProps) {
    const { addItem, isInCart, openCart } = useCartStore();
    const inCart = isInCart(prompt.id);

    const handleClick = () => {
        if (inCart) {
            openCart();
        } else {
            addItem(prompt);
        }
    };

    return (
        <Button
            size="lg"
            className={cn(
                "w-full h-12",
                inCart ? "bg-green-500 hover:bg-green-600" : "btn-premium"
            )}
            onClick={handleClick}
        >
            {inCart ? (
                <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                </>
            )}
        </Button>
    );
}
