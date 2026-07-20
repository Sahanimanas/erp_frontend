/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { motion, AnimatePresence } from "@site/lib/motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "@site/components/SectionHeading";
import { testimonials } from "@site/utils/data";
import { Button } from "@site/ui/button";

export default function Testimonials() {
    const [i, setI] = useState(0);
    const total = testimonials.length;
    const t = testimonials[i];

    const go = (dir) => setI((prev) => (prev + dir + total) % total);

    return (
        <section data-testid="testimonials-section" className="py-24 sm:py-32">
            <div className="container-eru">
                <SectionHeading
                    eyebrow="Testimonials"
                    title="Loved by principals, teachers & parents"
                    subtitle="Every story below is from a real customer running Global School Mitra in production."
                />

                <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Main testimonial card */}
                    <div className="lg:col-span-3 relative">
                        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-blue-700/10 blur-2xl" />
                        <AnimatePresence mode="wait">
                            <motion.blockquote
                                key={t.name}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                data-testid="active-testimonial"
                                className="relative rounded-3xl border border-border/70 bg-card p-8 sm:p-10 shadow-soft-lg"
                            >
                                <Quote className="h-10 w-10 text-blue-800/20 mb-4" />
                                <p className="text-xl sm:text-2xl font-medium tracking-tight text-foreground leading-snug">
                                    "{t.quote}"
                                </p>
                                <div className="mt-6 flex items-center gap-4">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-700/20"
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">{t.name}</p>
                                        <p className="text-sm text-muted-foreground">{t.role}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-0.5">
                                        {Array.from({ length: t.rating }).map((_, idx) => (
                                            <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                            </motion.blockquote>
                        </AnimatePresence>

                        <div className="mt-6 flex items-center gap-3">
                            <Button
                                data-testid="testimonial-prev"
                                variant="outline"
                                size="icon"
                                onClick={() => go(-1)}
                                className="rounded-full h-10 w-10 border-border/80"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                data-testid="testimonial-next"
                                variant="outline"
                                size="icon"
                                onClick={() => go(1)}
                                className="rounded-full h-10 w-10 border-border/80"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <div className="ml-2 flex items-center gap-1.5">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        aria-label={`Go to testimonial ${idx + 1}`}
                                        onClick={() => setI(idx)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            idx === i ? "w-8 bg-blue-800" : "w-2 bg-border"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side small cards */}
                    <div className="lg:col-span-2 grid gap-4">
                        {testimonials
                            .filter((_, idx) => idx !== i)
                            .slice(0, 3)
                            .map((tt) => (
                                <div
                                    key={tt.name}
                                    className="rounded-2xl border border-border/70 bg-card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
                                >
                                    <img
                                        src={tt.avatar}
                                        alt={tt.name}
                                        className="h-11 w-11 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{tt.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{tt.role}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-0.5">
                                        {Array.from({ length: tt.rating }).map((_, idx) => (
                                            <Star
                                                key={idx}
                                                className="h-3 w-3 fill-amber-400 text-amber-400"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
