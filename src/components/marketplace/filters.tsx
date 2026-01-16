"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Search,
    SlidersHorizontal,
    X,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/types";
import type { Category } from "@/types";

const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
];

interface FiltersState {
    search: string;
    category: Category | "";
    minPrice: number;
    maxPrice: number;
    minRating: number;
    sortBy: string;
}

export function MarketplaceFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const [filters, setFilters] = useState<FiltersState>({
        search: searchParams.get("search") || "",
        category: (searchParams.get("category") as Category) || "",
        minPrice: parseInt(searchParams.get("minPrice") || "0"),
        maxPrice: parseInt(searchParams.get("maxPrice") || "5000"),
        minRating: parseFloat(searchParams.get("minRating") || "0"),
        sortBy: searchParams.get("sortBy") || "newest",
    });

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice < 5000) params.set("maxPrice", filters.maxPrice.toString());
        if (filters.minRating > 0) params.set("minRating", filters.minRating.toString());
        if (filters.sortBy !== "newest") params.set("sortBy", filters.sortBy);

        router.push(`/marketplace?${params.toString()}`);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            category: "",
            minPrice: 0,
            maxPrice: 5000,
            minRating: 0,
            sortBy: "newest",
        });
        router.push("/marketplace");
        setIsOpen(false);
    };

    const activeFilterCount = [
        filters.category,
        filters.minPrice > 0,
        filters.maxPrice < 5000,
        filters.minRating > 0,
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search prompts..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                        className="pl-10 h-11"
                    />
                </div>

                {/* Sort Select */}
                <Select
                    value={filters.sortBy}
                    onValueChange={(value) => {
                        setFilters({ ...filters, sortBy: value });
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("sortBy", value);
                        router.push(`/marketplace?${params.toString()}`);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[180px] h-11">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Filters Button */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="h-11 gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center badge-gradient">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>Filter Prompts</SheetTitle>
                        </SheetHeader>

                        <div className="py-6 space-y-6">
                            {/* Category Filter */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Category</Label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, category: value as Category })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Categories</SelectItem>
                                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Price Range */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Price Range</Label>
                                    <span className="text-sm text-muted-foreground">
                                        ${(filters.minPrice / 100).toFixed(0)} - $
                                        {(filters.maxPrice / 100).toFixed(0)}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.minPrice, filters.maxPrice]}
                                    onValueChange={([min, max]) =>
                                        setFilters({ ...filters, minPrice: min, maxPrice: max })
                                    }
                                    min={0}
                                    max={5000}
                                    step={100}
                                    className="py-4"
                                />
                            </div>

                            <Separator />

                            {/* Minimum Rating */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Minimum Rating</Label>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="text-sm text-muted-foreground">
                                            {filters.minRating.toFixed(1)}+
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                                        <Button
                                            key={rating}
                                            variant={filters.minRating === rating ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setFilters({ ...filters, minRating: rating })}
                                        >
                                            {rating === 0 ? "Any" : `${rating}+`}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" className="flex-1" onClick={clearFilters}>
                                Clear All
                            </Button>
                            <Button className="flex-1 btn-premium" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                >
                    {filters.category && (
                        <Badge variant="secondary" className="gap-1 pl-2">
                            {CATEGORY_LABELS[filters.category as Category]}
                            <button
                                onClick={() => {
                                    setFilters({ ...filters, category: "" });
                                    applyFilters();
                                }}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
                        <Badge variant="secondary" className="gap-1 pl-2">
                            ${(filters.minPrice / 100).toFixed(0)} - $
                            {(filters.maxPrice / 100).toFixed(0)}
                            <button
                                onClick={() => {
                                    setFilters({ ...filters, minPrice: 0, maxPrice: 5000 });
                                    applyFilters();
                                }}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {filters.minRating > 0 && (
                        <Badge variant="secondary" className="gap-1 pl-2">
                            {filters.minRating}+ Stars
                            <button
                                onClick={() => {
                                    setFilters({ ...filters, minRating: 0 });
                                    applyFilters();
                                }}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={clearFilters}
                    >
                        Clear all
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
