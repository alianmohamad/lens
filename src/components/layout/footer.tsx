import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
    product: [
        { label: "Marketplace", href: "/marketplace" },
        { label: "Studio", href: "/studio" },
        { label: "Pricing", href: "/pricing" },
        { label: "API", href: "/api-docs" },
    ],
    sellers: [
        { label: "Start Selling", href: "/sell" },
        { label: "Seller Dashboard", href: "/dashboard/sales" },
        { label: "Seller Guidelines", href: "/seller-guidelines" },
        { label: "Payout Info", href: "/payouts" },
    ],
    company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
    ],
    legal: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Licenses", href: "/licenses" },
    ],
};

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/zerolens", label: "Twitter" },
    { icon: Github, href: "https://github.com/zerolens", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/zerolens", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@zerolens.ai", label: "Email" },
];

export function Footer() {
    return (
        <footer className="border-t border-border bg-card/50">
            <div className="section-container py-12 md:py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-xl font-display font-bold gradient-text">ZeroLens</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            The premium marketplace for AI-powered product photography prompts.
                            Transform your e-commerce images with expert-crafted prompts.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sellers Links */}
                    <div>
                        <h3 className="font-semibold mb-4">For Sellers</h3>
                        <ul className="space-y-3">
                            {footerLinks.sellers.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ZeroLens. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            All systems operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
