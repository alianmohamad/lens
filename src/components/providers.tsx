"use client";

import { useState, type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ThemeProvider as AppThemeProvider } from "@/contexts/theme-context";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <NextThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppThemeProvider>
                        <LanguageProvider>
                            {children}
                        </LanguageProvider>
                        <Toaster
                            position="bottom-right"
                            richColors
                            toastOptions={{
                                style: {
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    color: "var(--foreground)",
                                },
                            }}
                        />
                    </AppThemeProvider>
                </NextThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
