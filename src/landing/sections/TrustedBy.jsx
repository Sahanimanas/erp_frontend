import { useEffect, useState } from "react";
import apiClient from "../../services/axios";

/**
 * Editorial ribbon marquee of the schools actually onboarded on the platform.
 *
 * Names and the headline count both come from /public/schools, so the strip
 * updates itself as schools are added — no hardcoded list to maintain. The
 * whole section is hidden while loading and when no schools exist yet, rather
 * than falling back to invented names.
 */
export default function TrustedBy() {
    const [schools, setSchools] = useState(null); // null = still loading
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .get("/public/schools")
            .then((res) => {
                if (cancelled) return;
                const data = res.data?.data;
                setSchools(data?.schools ?? []);
                setTotal(data?.total ?? 0);
            })
            .catch(() => { if (!cancelled) setSchools([]); });
        return () => { cancelled = true; };
    }, []);

    // Nothing to show yet (loading, request failed, or no schools onboarded) —
    // render nothing rather than an empty ribbon or placeholder names.
    if (!schools?.length) return null;

    // The marquee translates -50%, so the list is duplicated for a seamless
    // loop. With only a handful of schools, repeat enough times to fill the bar.
    const REPEATS = Math.max(2, Math.ceil(12 / schools.length) * 2);
    const items = Array.from({ length: REPEATS }, () => schools).flat();

    const heading =
        total === 1
            ? "Trusted by 1 school"
            : `Trusted by ${total.toLocaleString("en-IN")} schools & colleges`;

    return (
        <section
            data-testid="trusted-by-section"
            aria-label="Trusted by schools"
            className="py-14 border-y border-border/60 bg-muted/30"
        >
            <div className="container-eru">
                <p className="text-center text-xs uppercase tracking-[0.24em] font-semibold text-muted-foreground">
                    {heading}
                </p>
            </div>
            <div className="mt-8 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                {/* aria-hidden: the duplicated names are decorative; the heading
                    above already conveys the meaning to assistive tech. */}
                <div aria-hidden className="marquee-track flex gap-14 whitespace-nowrap w-max">
                    {items.map((school, i) => (
                        <div
                            key={`${school.name}-${i}`}
                            className="flex items-center gap-2 text-lg sm:text-xl font-semibold tracking-tight text-foreground/40 hover:text-foreground/70 transition-colors"
                        >
                            {school.logo ? (
                                <img
                                    src={school.logo}
                                    alt=""
                                    className="h-6 w-6 rounded object-contain opacity-70"
                                />
                            ) : (
                                <span className="h-2 w-2 rounded-full bg-blue-700/40" />
                            )}
                            {school.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
