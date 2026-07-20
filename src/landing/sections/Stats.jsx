import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "@site/lib/motion";
import { School, Users, UserCog, HeartHandshake } from "lucide-react";
import { usePlatformStats } from "@site/lib/usePlatformStats";

// Live platform counts come from the public (unauthenticated, aggregate-only)
// /public/stats endpoint — the same source the previous landing page used. The
// four cards below mirror the fields that endpoint actually returns.
const items = [
    { key: "schools",   label: "Schools onboarded",   icon: School },
    { key: "students",  label: "Students registered", icon: Users },
    { key: "employees", label: "Staff & teachers",    icon: UserCog },
    { key: "parents",   label: "Parents connected",   icon: HeartHandshake },
];

function formatNumber(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
}

// These are exact counts, so "+" is only honest once the number has been
// rounded down for display (1,221 → "1.2K+"). An exact 10 shows as "10", and a
// genuine zero shows as "0" rather than a nonsensical "0+".
const isAbbreviated = (n) => n >= 1_000;

/** Simple counter that eases to target once in view. */
function Counter({ value }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const start = performance.now();
        const dur = 1400;
        const from = 0;
        const to = value;
        let raf;
        const step = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.floor(from + (to - from) * eased));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, value]);
    return (
        <span ref={ref} className="tabular-nums">
            {formatNumber(display)}
        </span>
    );
}

export default function Stats() {
    // Shared with the Hero and Navbar — one request, identical numbers.
    const stats = usePlatformStats();

    return (
        <section
            data-testid="stats-section"
            className="relative py-24 sm:py-28 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600" />
            <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(circle_at_top_left,white,transparent_60%)]" />

            <div className="container-eru">
                <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-white/70">
                        Real numbers, real schools
                    </p>
                    <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.05]">
                        Powering a new generation of educational institutions.
                    </h2>
                </div>
                <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((it, i) => (
                        <motion.div
                            key={it.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 sm:p-6"
                            data-testid={`stat-card-${it.key}`}
                        >
                            <it.icon className="h-5 w-5 text-white/80" strokeWidth={2.2} />
                            <div className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                                {stats[it.key] == null ? (
                                    // Stats not loaded (or endpoint unreachable) — show a dash
                                    // rather than an authoritative-looking "0+".
                                    <span className="text-white/40">—</span>
                                ) : (
                                    <>
                                        <Counter value={stats[it.key]} />
                                        {isAbbreviated(stats[it.key]) && "+"}
                                    </>
                                )}
                            </div>
                            <p className="mt-1 text-xs sm:text-sm text-white/70">{it.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
