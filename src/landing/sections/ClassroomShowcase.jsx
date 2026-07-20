/* eslint-disable react/no-unescaped-entities */
import { motion } from "@site/lib/motion";
import { Link } from "react-router-dom";
import { LineChart, GraduationCap, HeartHandshake, ArrowUpRight, Sparkles } from "lucide-react";
import SectionHeading from "@site/components/SectionHeading";
import { Button } from "@site/ui/button";

/**
 * ClassroomShowcase — premium asymmetric bento of the 3 school lifestyle images.
 * One tall hero image on the left; two stacked cards on the right.
 * Each has a color-tinted overlay, floating badge, and hover reveal.
 */

const cards = [
    {
        img: "/brand/hero/slide-1.webp",
        icon: LineChart,
        eyebrow: "For School Leaders",
        title: "Data-driven decisions, every morning.",
        body: "Track admissions, attendance, fee collection and academic performance across your whole campus — in one live dashboard.",
        stat: "96.2% attendance",
        color: "from-blue-800 to-blue-900",
        accent: "bg-blue-600",
        span: "lg:col-span-7 lg:row-span-2",
        aspect: "aspect-[4/5] lg:aspect-auto lg:h-full",
    },
    {
        img: "/brand/hero/slide-2.webp",
        icon: GraduationCap,
        eyebrow: "For Teachers & Students",
        title: "Digital classrooms that just work.",
        body: "LMS, homework, assessments and study material — accessible on any device, in any Indian language.",
        stat: "8h/week saved",
        color: "from-orange-500 to-orange-600",
        accent: "bg-orange-500",
        span: "lg:col-span-5",
        aspect: "aspect-[16/10] lg:aspect-[16/9]",
    },
    {
        img: "/brand/hero/slide-3.webp",
        icon: HeartHandshake,
        eyebrow: "For Parents",
        title: "Parents stay in the loop, always.",
        body: "Real-time attendance alerts, fee receipts and progress reports on WhatsApp and our mobile app.",
        stat: "24/7 updates",
        color: "from-emerald-600 to-emerald-700",
        accent: "bg-emerald-600",
        span: "lg:col-span-5",
        aspect: "aspect-[16/10] lg:aspect-[16/9]",
    },
];

function ShowcaseCard({ card, index }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            data-testid={`showcase-card-${index}`}
            className={`group relative overflow-hidden rounded-[2rem] border border-border/70 shadow-soft-lg bg-card ${card.span} ${card.aspect}`}
        >
            {/* Image */}
            <img
                src={card.img}
                alt={card.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
            />

            {/* Gradient tint per card */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${card.color} opacity-20 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            {/* Top-right icon badge */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full ${card.accent} text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-lg`}>
                    <card.icon className="h-3.5 w-3.5" />
                    {card.eyebrow}
                </span>
            </div>

            {/* Stat pill top-left */}
            <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {card.stat}
            </div>

            {/* Copy block */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-[1.15] max-w-lg">
                    {card.title}
                </h3>
                <p className="mt-3 text-sm text-white/85 leading-relaxed max-w-md">{card.body}</p>

                {/* Hover-reveal CTA */}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <span>See it in action</span>
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </div>
        </motion.article>
    );
}

export default function ClassroomShowcase() {
    return (
        <section
            data-testid="classroom-showcase-section"
            className="relative py-24 sm:py-32 overflow-hidden"
        >
            {/* Ambient backdrop */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/8 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-orange-400/8 blur-[120px]" />
            </div>

            <div className="container-eru">
                <SectionHeading
                    eyebrow="In real schools"
                    title="One platform. Every person in your school."
                    subtitle="From the principal's dashboard to the parent's phone — Global School Mitra is built for how real schools actually work."
                />

                {/* Bento grid */}
                <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 lg:auto-rows-[280px] gap-5 lg:gap-6">
                    {cards.map((c, i) => (
                        <ShowcaseCard key={c.img} card={c} index={i} />
                    ))}
                </div>

                {/* Footer strip */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-800 to-orange-500 flex items-center justify-center text-white">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold tracking-tight text-foreground">
                                Ready to see it inside your school?
                            </p>
                            <p className="text-sm text-muted-foreground">
                                30-minute personalised demo · No credit card · Data migration included
                            </p>
                        </div>
                    </div>
                    <Link to="/demo">
                        <Button
                            data-testid="showcase-cta-demo"
                            className="rounded-full h-11 px-5 bg-blue-800 hover:bg-blue-900 text-white font-semibold shadow-soft"
                        >
                            Book my demo
                            <ArrowUpRight className="ml-1.5 h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
