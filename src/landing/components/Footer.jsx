/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Youtube, Facebook, Instagram, Mail, Phone, MapPin, Globe, ArrowRight, Send, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@site/ui/button";
import { Input } from "@site/ui/input";
import { toast } from "@site/lib/toast";
import Logo from "@site/components/Logo";
import { BRAND, moduleGroups } from "@site/utils/data";

const socials = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-[#1877F2]" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-[#E4405F]" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-[#0A66C2]" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hover:text-[#FF0000]" },
];

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
            <div className="container-eru">
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

            {/* ============ MAIN FOOTER GRID ============ */}
            <div className="mt-16 border-t border-border/70 bg-gradient-to-b from-background via-blue-50/30 to-slate-50/40 dark:from-background dark:via-blue-950/20 dark:to-slate-950/50">
                <div className="container-eru py-16 lg:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
                        {/* Brand block */}
                        <div className="lg:col-span-4">
                            <Logo />
                            <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm">
                                {BRAND.tagline} — the trusted school operating system for ERP, LMS and
                                assessments, proudly built in India for Indian schools.
                            </p>

                            {/* Contact card */}
                            <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-soft space-y-3">
                                <a href={BRAND.phoneHref} className="flex items-center gap-3 group" data-testid="footer-phone">
                                    <span className="h-9 w-9 rounded-lg bg-blue-800 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                            Call us
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">{BRAND.phone}</p>
                                    </div>
                                </a>
                                <a href={BRAND.emailHref} className="flex items-center gap-3 group" data-testid="footer-email">
                                    <span className="h-9 w-9 rounded-lg bg-orange-500 text-white flex items-center justify-center group-hover:bg-blue-800 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                            Email
                                        </p>
                                        <p className="text-sm font-semibold text-foreground break-all">
                                            {BRAND.email}
                                        </p>
                                    </div>
                                </a>
                                <div className="flex items-start gap-3" data-testid="footer-address">
                                    <span className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                        <MapPin className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                            Head office
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">{BRAND.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product */}
                        <div className="lg:col-span-2">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-blue-800 dark:text-blue-300 mb-4">
                                Product
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    { label: "Features", to: "/features" },
                                    { label: "Pricing", to: "/pricing" },
                                    { label: "Request Demo", to: "/demo" },
                                    { label: "Login", to: "/login" },
                                    { label: "Roadmap", to: "/features" },
                                ].map((l) => (
                                    <li key={l.label}>
                                        <Link
                                            to={l.to}
                                            className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1 group"
                                            data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                                        >
                                            <span className="h-1 w-1 rounded-full bg-orange-500 group-hover:w-3 transition-all" />
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Modules */}
                        <div className="lg:col-span-3">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-blue-800 dark:text-blue-300 mb-4">
                                Modules
                            </h4>
                            <ul className="grid grid-cols-1 gap-3">
                                {moduleGroups.slice(0, 8).map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            to="/features"
                                            className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-2 group"
                                        >
                                            <span
                                                className={`h-6 w-6 shrink-0 rounded-md bg-gradient-to-br ${m.color} flex items-center justify-center text-white`}
                                            >
                                                <m.icon className="h-3 w-3" strokeWidth={2.4} />
                                            </span>
                                            {m.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company + Socials */}
                        <div className="lg:col-span-3">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-blue-800 dark:text-blue-300 mb-4">
                                Company
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    { label: "About Us", to: "/about" },
                                    { label: "Contact", to: "/contact" },
                                    { label: "Careers", to: "/about" },
                                    { label: "Blog", to: "/about" },
                                    { label: "Privacy Policy", to: "#" },
                                    { label: "Terms of Service", to: "#" },
                                ].map((l) => (
                                    <li key={l.label}>
                                        <Link
                                            to={l.to}
                                            className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <h5 className="text-xs uppercase tracking-[0.2em] font-bold text-blue-800 dark:text-blue-300 mb-4">
                                    Follow Us
                                </h5>
                                <div className="flex flex-wrap items-center gap-2">
                                    {socials.map(({ icon: Icon, href, label, color }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={label}
                                            data-testid={`social-${label.toLowerCase()}`}
                                            className={`h-10 w-10 rounded-xl border border-border/70 bg-card flex items-center justify-center text-muted-foreground ${color} hover:border-current hover:-translate-y-1 hover:shadow-soft transition-all duration-300`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>

                                <a
                                    href={`https://${BRAND.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 flex items-center gap-2 text-xs text-muted-foreground hover:text-blue-800 transition-colors"
                                    data-testid="footer-website"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    {BRAND.website}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-16 pt-8 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()}{" "}
                            <span className="font-semibold text-foreground">{BRAND.name}</span> · All rights
                            reserved.
                        </p>
                        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                            Built with <Heart className="h-3 w-3 fill-orange-500 text-orange-500" /> in{" "}
                            <span className="font-semibold text-foreground">Patna, Bihar</span>
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            All systems operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
