"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    ShoppingCart,
    LogOut,
    Settings,
    LayoutDashboard,
    Sparkles,
    Store,
    PenTool,
    Sun,
    Moon,
    ChevronDown,
    Bookmark,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/studio", label: "Studio", icon: Sparkles },
    { href: "/pocket", label: "Pocket", icon: Bookmark },
    { href: "/sell", label: "Sell", icon: PenTool },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const { items, openCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const cartItemCount = items.length;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={cn(
                    "fixed z-50 transition-all duration-500",
                    isScrolled
                        ? "top-4 left-4 right-4 mx-auto max-w-6xl rounded-full glass-strong shadow-xl border border-neon/10"
                        : "top-0 left-0 right-0 bg-transparent"
                )}
            >
                <nav className={cn(
                    "transition-all duration-300",
                    isScrolled ? "px-4 sm:px-6" : "px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl"
                )}>
                    <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
                        {/* Logo */}
                        <Link href="/" className="shrink-0">
                            <span className="text-xl font-display font-bold gradient-text">
                                ZeroLens
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            {mounted && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </Button>
                            )}

                            {/* Cart Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={openCart}
                                className="relative rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemCount > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs badge-gradient"
                                    >
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* Auth Buttons / User Menu */}
                            {status === "loading" ? (
                                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                            ) : session?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="flex items-center gap-1 rounded-lg px-1 bg-transparent border-none cursor-pointer"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={session.user.image || undefined}
                                                    alt={session.user.name || "User"}
                                                />
                                                <AvatarFallback className="gradient-bg text-white text-sm">
                                                    {session.user.name?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="hidden sm:flex items-center justify-center h-6 w-6 rounded hover:bg-muted transition-colors">
                                                <ChevronDown className="h-4 w-4" />
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <div className="px-2 py-1.5">
                                            <p className="text-sm font-medium">{session.user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {session.user.role}
                                            </Badge>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="flex items-center gap-2">
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center gap-2"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button variant="ghost" className="hover:bg-neon/10 hover:text-neon" asChild>
                                        <Link href="/sign-in">Sign in</Link>
                                    </Button>
                                    <Button className="btn-premium" asChild>
                                        <Link href="/sign-up">Get started</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden rounded-lg"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </nav>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "fixed inset-x-0 z-40 md:hidden",
                            isScrolled ? "top-24" : "top-20"
                        )}
                    >
                        <div className="glass-strong border border-border mx-4 rounded-2xl p-4 shadow-xl">
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    const isActive = pathname.startsWith(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    );
                                })}

                                {!session && (
                                    <>
                                        <div className="my-2 border-t border-border" />
                                        <Link
                                            href="/sign-in"
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-all"
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/sign-up"
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium btn-premium"
                                        >
                                            Get started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer for fixed header */}
            <div className="h-16" />
        </>
    );
}
