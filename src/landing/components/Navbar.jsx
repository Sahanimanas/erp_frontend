import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, LogIn, Phone, Mail, ShieldCheck, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@site/ui/button";
import { useDemoLogin } from "@site/lib/useDemoLogin";
import { usePlatformStats, formatCount } from "@site/lib/usePlatformStats";
import { motion, AnimatePresence } from "@site/lib/motion";
import Logo from "@site/components/Logo";
import ThemeToggle from "@site/components/ThemeToggle";
import { navLinks, BRAND } from "@site/utils/data";
import { cn } from "@site/lib/utils";

/**
 * Fancy sticky navbar:
 *  · Top announcement strip with phone + email + secure badge
 *  · Glassmorphism main bar
 *  · Login (ghost) + Request Demo (solid) buttons
 *  · Animated underline for active nav
 *  · Full-screen mobile drawer with staggered animation
 */
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const location = useLocation();
    // One-click sign-in to the seeded demo tenant — drops the visitor straight
    // into the real dashboard rather than a form.
    const { startDemo, loading: demoLoading } = useDemoLogin();
    const schoolCount = formatCount(usePlatformStats().schools);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [location.pathname]);

    return (
        <header data-testid="site-navbar" className="fixed top-0 inset-x-0 z-50">
            {/* Top announcement strip */}
            <div
                data-testid="nav-topbar"
                className="hidden md:block bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 text-white text-[12px]"
            >
                <div className="container-eru h-9 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 hover:text-orange-200 transition-colors">
                            <Phone className="h-3 w-3" /> {BRAND.phone}
                        </a>
                        <a href={BRAND.emailHref} className="inline-flex items-center gap-1.5 hover:text-orange-200 transition-colors">
                            <Mail className="h-3 w-3" /> {BRAND.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-orange-200" />
                        <span className="font-semibold tracking-wide">{BRAND.trustBadge}</span>
                        <span className="text-white/40">·</span>
                        {schoolCount && <span>Trusted by {schoolCount} schools</span>}
                    </div>
                </div>
            </div>

            {/* Main bar */}
            <div
                className={cn(
                    "transition-all duration-300",
                    scrolled
                        ? "backdrop-blur-xl bg-background/85 border-b border-border/70 shadow-soft"
                        : "bg-background/60 backdrop-blur-md border-b border-transparent",
                )}
            >
                <nav className="container-eru h-[76px] flex items-center justify-between gap-4">
                    <Logo />

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <li key={link.to} className="relative">
                                <NavLink
                                    to={link.to}
                                    data-testid={`nav-link-${link.label.toLowerCase()}`}
                                    end={link.to === "/"}
                                    className={({ isActive }) =>
                                        cn(
                                            "relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-all",
                                            isActive
                                                ? "text-blue-800 dark:text-blue-300"
                                                : "text-foreground/75 hover:text-foreground",
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {link.label}
                                            {isActive && (
                                                <motion.span
                                                    layoutId="nav-active-underline"
                                                    className="absolute left-3 right-3 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-blue-700 to-orange-500"
                                                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Right cluster */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <Link to="/login" className="hidden sm:inline-flex">
                            <Button
                                data-testid="nav-cta-login"
                                variant="outline"
                                className="rounded-full h-10 px-4 border-blue-800/25 text-blue-800 dark:text-blue-300 dark:border-blue-300/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-semibold"
                            >
                                <LogIn className="mr-1.5 h-4 w-4" />
                                Login
                            </Button>
                        </Link>

                        {/* Live demo — signs into the seeded demo school instantly. */}
                        <Button
                            data-testid="nav-cta-live-demo"
                            onClick={startDemo}
                            disabled={demoLoading}
                            variant="ghost"
                            className="hidden lg:inline-flex rounded-full h-10 px-4 text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-semibold"
                        >
                            {demoLoading ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <PlayCircle className="mr-1.5 h-4 w-4" />
                            )}
                            {demoLoading ? "Starting…" : "Live Demo"}
                        </Button>

                        <Link to="/demo" className="hidden sm:inline-flex">
                            <Button
                                data-testid="nav-cta-demo"
                                className="group rounded-full h-10 px-5 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold shadow-[0_6px_20px_rgba(30,58,138,0.35)]"
                            >
                                Request Demo
                                <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>

                        <button
                            data-testid="mobile-menu-toggle"
                            className="md:hidden h-10 w-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        data-testid="mobile-nav-drawer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden overflow-hidden border-t border-border/70 bg-background/98 backdrop-blur-xl"
                    >
                        <ul className="container-eru py-4 flex flex-col gap-1">
                            {navLinks.map((link, i) => (
                                <motion.li
                                    key={link.to}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.04 * i }}
                                >
                                    <NavLink
                                        to={link.to}
                                        data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                                        end={link.to === "/"}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-50 to-orange-50 text-blue-800 dark:from-blue-500/15 dark:to-orange-500/10 dark:text-blue-300"
                                                    : "text-foreground hover:bg-muted",
                                            )
                                        }
                                    >
                                        {link.label}
                                        <ArrowRight className="h-4 w-4 opacity-40" />
                                    </NavLink>
                                </motion.li>
                            ))}
                            <li className="pt-3 grid grid-cols-2 gap-2">
                                <Link to="/login" data-testid="mobile-cta-login">
                                    <Button variant="outline" className="w-full rounded-full h-11 border-blue-800/25 text-blue-800 font-semibold">
                                        <LogIn className="mr-1.5 h-4 w-4" /> Login
                                    </Button>
                                </Link>
                                <Link to="/demo" data-testid="mobile-cta-demo">
                                    <Button className="w-full rounded-full h-11 bg-blue-800 hover:bg-blue-900 text-white font-semibold">
                                        Demo
                                    </Button>
                                </Link>
                            </li>
                            <li className="pt-3 mt-2 border-t border-border/70 text-[12px] text-muted-foreground flex flex-col gap-1.5 px-1">
                                <a href={BRAND.phoneHref} className="inline-flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-blue-800" /> {BRAND.phone}
                                </a>
                                <a href={BRAND.emailHref} className="inline-flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-blue-800" /> {BRAND.email}
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
