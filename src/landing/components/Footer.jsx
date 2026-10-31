/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Youtube, Facebook, Instagram, Mail, Phone, MapPin, Globe, ArrowRight, ArrowUpRight, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@site/ui/button";
import { Input } from "@site/ui/input";
import { toast } from "@site/lib/toast";
import Logo from "@site/components/Logo";
import { BRAND, moduleGroups } from "@site/utils/data";

const socials = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", hover: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", hover: "hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:border-[#dd2a7b]" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", hover: "hover:bg-[#0A66C2] hover:border-[#0A66C2]" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", hover: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube", hover: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
];

const productLinks = [
    { label: "Features", to: "/features" },
    { label: "Pricing", to: "/pricing" },
    { label: "Request Demo", to: "/demo" },
    { label: "Login", to: "/login" },
    { label: "Roadmap", to: "/features" },
];

const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Careers", to: "/about" },
    { label: "Blog", to: "/about" },
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
];

// The footer is always dark, whatever the site theme: these are the site's own
// dark-theme tokens, set on the footer so Logo and any token-based class inside
// it read correctly on the navy background.
const darkTokens = {
    "--foreground": "210 40% 98%",
    "--muted-foreground": "215 20% 70%",
    "--card": "222 47% 8%",
    "--border": "217 33% 17%",
};

function ColumnTitle({ children }) {
    return (
        <h4 className="mb-5 text-[13px] font-bold uppercase tracking-[0.18em] text-white">
            {children}
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-orange-500 to-blue-400" />
        </h4>
    );
}

function FooterLink({ to, label, testId }) {
    return (
        <Link
            to={to}
            data-testid={testId}
            className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
            <ChevronRight className="h-3.5 w-3.5 -ml-1 text-orange-400 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
            {label}
        </Link>
    );
}

function ContactTile({ href, icon: Icon, tint, label, value, testId }) {
    const Tag = href ? "a" : "div";
    return (
        <Tag
            href={href}
            data-testid={testId}
            className="group relative flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
        >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg shadow-black/20 transition-transform duration-300 group-hover:scale-105`}>
                <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-0.5 break-all text-[15px] font-semibold text-white">{value}</p>
            </div>
            {href && (
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-500 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-orange-400" />
            )}
        </Tag>
    );
}

export default function Footer() {
    const [email, setEmail] = useState("");

    const subscribe = (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email");
            return;
        }
        toast.success("Subscribed! Look out for our monthly newsletter.");
        setEmail("");
    };

    return (
        <footer data-testid="site-footer" className="relative mt-24 overflow-hidden">
            {/* ============ NEWSLETTER BANNER ============ */}
            <div className="container-eru relative z-10">
                <div
                    data-testid="footer-newsletter"
                    className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 p-8 sm:p-12 text-white shadow-soft-lg"
                >
                    {/* Ambient decor */}
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_left,white,transparent_55%)]" />
                    <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-orange-400/40 blur-3xl" />
                    <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-300 animate-pulse" />
                                Monthly Newsletter
                            </span>
                            <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                                Smart Schools deserve smart updates.
                            </h3>
                            <p className="mt-3 text-white/80 max-w-lg">
                                Product updates, education technology tips and case-studies from schools like
                                yours. No spam — one email a month.
                            </p>
                        </div>
                        <form onSubmit={subscribe} className="lg:col-span-2 flex flex-col sm:flex-row gap-2" data-testid="newsletter-form">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                                <Input
                                    data-testid="newsletter-email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@school.edu"
                                    className="h-12 pl-11 rounded-full bg-white/10 border-white/20 placeholder:text-white/50 text-white focus-visible:ring-orange-300 focus-visible:ring-2"
                                />
                            </div>
                            <Button
                                type="submit"
                                data-testid="newsletter-submit-btn"
                                className="h-12 rounded-full bg-white text-blue-900 hover:bg-orange-100 font-semibold px-6"
                            >
                                Subscribe <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ============ MAIN FOOTER ============ */}
            <div
                className="dark relative -mt-24 overflow-hidden bg-[#060c22] pt-24 text-slate-300"
                style={darkTokens}
                data-testid="footer-main"
            >
                {/* Backdrop: brand glows, a faint grid, and a hairline along the top */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_10%_0%,rgba(37,99,235,0.28),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_95%_100%,rgba(234,88,12,0.22),transparent_70%)]" />
                    <div className="absolute inset-0 bg-grid mask-radial-fade opacity-60" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
                </div>

                <div className="container-eru relative pt-14 pb-10 lg:pt-16">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                        {/* Brand block */}
                        <div className="lg:col-span-4">
                            <div className="inline-flex rounded-2xl bg-white/[0.04] p-2 pr-4 ring-1 ring-white/10">
                                <Logo />
                            </div>
                            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
                                {BRAND.tagline} — the trusted school operating system for ERP, LMS and
                                assessments, proudly built in India for Indian schools.
                            </p>

                            <div className="mt-7 space-y-3 max-w-md">
                                <ContactTile href={BRAND.phoneHref} icon={Phone} tint="from-blue-500 to-indigo-600"
                                    label="Call us" value={BRAND.phone} testId="footer-phone" />
                                <ContactTile href={BRAND.emailHref} icon={Mail} tint="from-orange-500 to-amber-500"
                                    label="Email" value={BRAND.email} testId="footer-email" />
                                <ContactTile icon={MapPin} tint="from-emerald-500 to-teal-600"
                                    label="Head office" value={BRAND.address} testId="footer-address" />
                            </div>
                        </div>

                        {/* Product */}
                        <div className="lg:col-span-2 lg:pl-4">
                            <ColumnTitle>Product</ColumnTitle>
                            <ul className="space-y-3.5">
                                {productLinks.map((l) => (
                                    <li key={l.label}>
                                        <FooterLink to={l.to} label={l.label}
                                            testId={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Modules */}
                        <div className="lg:col-span-3">
                            <ColumnTitle>Modules</ColumnTitle>
                            <ul className="space-y-2">
                                {moduleGroups.slice(0, 8).map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            to="/features"
                                            className="group flex items-center gap-3 rounded-xl px-2 py-1.5 -mx-2 text-sm text-slate-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
                                        >
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${m.color} text-white shadow-md shadow-black/30 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                                            >
                                                <m.icon className="h-4 w-4" strokeWidth={2.2} />
                                            </span>
                                            <span className="flex-1">{m.title}</span>
                                            <ArrowRight className="h-3.5 w-3.5 text-orange-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company + Socials */}
                        <div className="lg:col-span-3">
                            <ColumnTitle>Company</ColumnTitle>
                            <ul className="space-y-3.5">
                                {companyLinks.map((l) => (
                                    <li key={l.label}>
                                        <FooterLink to={l.to} label={l.label} />
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                <ColumnTitle>Follow Us</ColumnTitle>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {socials.map(({ icon: Icon, href, label, hover }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={label}
                                            data-testid={`social-${label.toLowerCase()}`}
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-white hover:shadow-lg hover:shadow-black/40 ${hover}`}
                                        >
                                            <Icon className="h-[18px] w-[18px]" />
                                        </a>
                                    ))}
                                </div>

                                <a
                                    href={`https://${BRAND.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-orange-400/40 hover:text-white"
                                    data-testid="footer-website"
                                >
                                    <Globe className="h-3.5 w-3.5 text-orange-400" />
                                    {BRAND.website}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Oversized wordmark, a quiet signature behind the bottom bar */}
                    <p
                        aria-hidden
                        className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/[0.10] to-white/0 text-[7.4vw]"
                    >
                        GLOBAL SCHOOL MITRA
                    </p>

                    {/* Bottom bar */}
                    <div className="-mt-[1.6vw] relative flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()}{" "}
                            <span className="font-semibold text-white">{BRAND.name}</span> · All rights
                            reserved.
                        </p>
                        <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                            Built with <Heart className="h-3 w-3 animate-pulse fill-orange-500 text-orange-500" /> in{" "}
                            <span className="font-semibold text-white">Patna, Bihar</span>
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            All systems operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
