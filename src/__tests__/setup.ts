import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
    useSession: () => ({
        data: {
            user: {
                id: "test-user-id",
                name: "Test User",
                email: "test@example.com",
                role: "BUYER",
            },
        },
        status: "authenticated",
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
    vi.clearAllMocks();
});
