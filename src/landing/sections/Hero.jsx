/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { motion } from "@site/lib/motion";
import {
    ArrowRight,
    PlayCircle,
    ShieldCheck,
    Loader2,
    GraduationCap,
    Sparkles,
    BookOpen,
    Trophy,
} from "lucide-react";
import { Button } from "@site/ui/button";
import DashboardMockup from "@site/components/DashboardMockup";
import { BRAND } from "@site/utils/data";
import { useDemoLogin } from "@site/lib/useDemoLogin";
import { usePlatformStats, formatCount } from "@site/lib/usePlatformStats";

/**
 * Hero — premium marketing hero for Global School Mitra.
 * Layered composition:
 *   · Animated grid + blur orbs backdrop
 *   · Floating decorative icons
 *   · Announcement pill
 *   · Big gradient headline with word-by-word reveal
 *   · Sub-tagline
 *   · Description
 *   · Dual CTA
 *   · Social-proof strip (avatars + star rating + counters)
 *   · Product mockup below
 */

const proofAvatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=70&auto=format",
    "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?w=96&q=70&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=70&auto=format",
    "https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&h=96&w=96",
];

// small helper for staggered word-by-word title
const headlineWords = [
    { text: "Global", cls: "text-blue-800 dark:text-blue-300" },
    { text: "School", cls: "text-blue-800 dark:text-blue-300" },
    { text: "Mitra", cls: "text-orange-600 dark:text-orange-400" },
];

/**
 * Decorative icon badge drifting in the hero margins.
 *
 * The upstream file called <FloatingIcon> in four places but its definition had
 * been deleted, so the hero threw on render. Reinstated here; `delay` staggers
 * the entrance and `size` picks the small variant used lower down the page.
 * Purely ornamental — hidden from assistive tech and on small screens.
 */
function FloatingIcon({ Icon, className = "", delay = 0, size = "md" }) {
    const box = size === "sm" ? "h-10 w-10" : "h-12 w-12";
    const glyph = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    return (
        <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className={`absolute z-10 items-center justify-center rounded-2xl shadow-soft ring-1 ring-black/[0.04] dark:ring-white/10 backdrop-blur-sm ${box} ${className}`}
        >
            <Icon className={glyph} strokeWidth={2.2} />
        </motion.div>
    );
}

export default function Hero() {
    const { startDemo, loading: demoLoading, error: demoError } = useDemoLogin();
    // Live platform counts — the headline figures below are never hardcoded.
    const stats = usePlatformStats();
    const schoolCount = formatCount(stats.schools);
    const studentCount = formatCount(stats.students);

    return (
        <section
            data-testid="hero-section"
            className="relative overflow-hidden pt-6 sm:pt-14 pb-16 sm:pb-24"
        >
            {/* ============ Backdrops ============ */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-grid mask-radial-fade opacity-70" />
                {/* Animated glowing orbs */}
                <motion.div
                    initial={{ opacity: 0.4, scale: 0.9 }}
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.05, 0.9] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-8%] left-1/2 -translate-x-1/2 h-[440px] w-[860px] rounded-full bg-blue-500/15 blur-[130px]"
                />
                <motion.div
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.55, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-orange-400/25 blur-[110px]"
                />
                <div className="absolute top-1/3 left-[6%] h-56 w-56 rounded-full bg-emerald-400/15 blur-[100px]" />
            </div>

            {/* ============ Floating icons ============ */}
            <FloatingIcon
                className="hidden sm:flex top-24 left-[6%] text-blue-800 bg-blue-50"
                Icon={GraduationCap}
                delay={0.3}
            />
            <FloatingIcon
                className="hidden sm:flex top-40 right-[8%] text-orange-600 bg-orange-50"
                Icon={Sparkles}
                delay={0.6}
            />
            <FloatingIcon
                className="hidden lg:flex bottom-[42%] left-[4%] text-emerald-600 bg-emerald-50"
                Icon={BookOpen}
                delay={0.9}
                size="sm"
            />
            <FloatingIcon
                className="hidden lg:flex bottom-[38%] right-[5%] text-amber-600 bg-amber-50"
                Icon={Trophy}
                delay={1.1}
                size="sm"
            />

            <div className="container-eru relative">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Announcement pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        data-testid="hero-secure-badge"
                        className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 backdrop-blur-md px-4 py-1.5 text-[12px] font-semibold shadow-soft"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-foreground/90">{BRAND.trustBadge}</span>
                        <span className="hidden sm:inline text-muted-foreground/50">·</span>
                        <span className="hidden sm:inline text-blue-800/90 dark:text-blue-300/90">
                            ERP · LMS · Assessment
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </motion.div>

                    {/* Big headline */}
                    <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02]">
                        <span className="block">
                            {headlineWords.map((w, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                    className={`inline-block ${w.cls} ${i > 0 ? "ml-[0.2em]" : ""}`}
                                >
                                    {w.text}
                                </motion.span>
                            ))}
                        </span>

                        <motion.span
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.55 }}
                            className="relative block mt-3 text-3xl sm:text-5xl lg:text-6xl text-foreground/90 font-bold"
                        >
                            Smart Schools.{" "}
                            <span className="relative inline-block">
                                Smart Future.
                                {/* Animated underline */}
                                <motion.svg
                                    viewBox="0 0 300 12"
                                    preserveAspectRatio="none"
                                    className="absolute -bottom-2 left-0 w-full h-3 pointer-events-none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.4, delay: 1, ease: "easeOut" }}
                                >
                                    <motion.path
                                        d="M2 8 Q 75 -2, 150 6 T 298 5"
                                        fill="none"
                                        stroke="url(#hero-underline-grad)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="hero-underline-grad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#1E3A8A" />
                                            <stop offset="100%" stopColor="#EA580C" />
                                        </linearGradient>
                                    </defs>
                                </motion.svg>
                            </span>
                        </motion.span>
                    </h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.85 }}
                        className="mt-8 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        The complete school operating system — attendance, fees, exams, parent app,
                        LMS, transport &amp; payroll. Built in India
                        {schoolCount && `, trusted by ${schoolCount} schools`}.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center"
                    >
                        <Link to="/demo">
                            <Button
                                data-testid="hero-cta-demo"
                                size="lg"
                                className="group rounded-full h-12 px-6 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white text-[15px] font-semibold shadow-[0_10px_30px_rgba(30,58,138,0.35)] hover:shadow-[0_14px_40px_rgba(30,58,138,0.5)] transition-all"
                            >
                                Request Demo{" "}
                                <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                        {/* Signs into the seeded demo school and lands the visitor
                            in the real dashboard — no form, no sign-up. */}
                        <Button
                            data-testid="hero-cta-live-demo"
                            onClick={startDemo}
                            disabled={demoLoading}
                            size="lg"
                            variant="outline"
                            className="rounded-full h-12 px-6 border-orange-500/40 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:border-orange-500/40 dark:hover:bg-orange-500/10 text-[15px] font-semibold group"
                        >
                            {demoLoading ? (
                                <Loader2 className="mr-1.5 h-5 w-5 animate-spin" />
                            ) : (
                                <PlayCircle className="mr-1.5 h-5 w-5 group-hover:scale-110 transition-transform" />
                            )}
                            {demoLoading ? "Starting demo…" : "Try Live Demo"}
                        </Button>
                    </motion.div>

                    {demoError && (
                        <p data-testid="hero-demo-error" className="mt-4 text-sm text-red-600 dark:text-red-400">
                            {demoError}
                        </p>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        No sign-up needed — the demo opens a fully seeded school with sample students, fees &amp; staff.
                    </p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.15 }}
                        className="mt-5 text-xs text-muted-foreground"
                    >
                        No credit card required · 30-day free trial · Data migration included
                    </motion.p>

                    {/* ============ Social proof strip ============ */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.3 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm"
                    >
                        {/* Avatar stack */}
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {proofAvatars.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt=""
                                        loading="lazy"
                                        className="h-9 w-9 rounded-full object-cover ring-2 ring-background shadow-sm"
                                    />
                                ))}
                                <span className="h-9 w-9 rounded-full bg-blue-800 text-white ring-2 ring-background flex items-center justify-center text-[11px] font-bold">
                                    +1K
                                </span>
                            </div>
                            <p className="text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    {schoolCount ?? "—"} schools
                                </span>{" "}
                                trust us
                            </p>
                        </div>

                        {/* A "4.9/5 average rating" claim sat here in the source.
                            There is no ratings data behind it, so it was removed
                            rather than shown as fact next to the live counts. */}

                        <span className="hidden sm:block h-4 w-px bg-border" />

                        {/* Live counter */}
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <p className="text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                    {studentCount ?? "—"} students
                                </span>{" "}
                                registered
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ============ Dashboard mockup ============ */}
                <motion.div
                    initial={{ opacity: 0, y: 32, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-16 sm:mt-20 max-w-6xl mx-auto"
                >
                    <DashboardMockup />
                </motion.div>
            </div>
        </section>
    );
}
