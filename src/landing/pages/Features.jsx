/* eslint-disable react/no-unescaped-entities */
import { motion } from "@site/lib/motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@site/components/SectionHeading";
import { featureCategories, moduleGroups } from "@site/utils/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@site/ui/tabs";
import { Button } from "@site/ui/button";
import CTABanner from "@site/sections/CTABanner";
import { cn } from "@site/lib/utils";

/**
 * ImmersiveModule — one full-viewport section per module.
 * Alternates layout (image left/right) and uses the module's brand gradient.
 */
function ImmersiveModule({ mod, index }) {
    const isReverse = index % 2 === 1;
    return (
        <section
            data-testid={`module-full-${mod.id}`}
            className="relative py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-border/70"
        >
            {/* Ambient backdrop */}
            <div className="absolute inset-0 -z-10">
                <div className={cn("absolute -top-32 -left-24 h-96 w-96 rounded-full blur-[120px] opacity-40", `bg-gradient-to-br ${mod.color}`)} />
                <div className={cn("absolute -bottom-32 -right-24 h-96 w-96 rounded-full blur-[120px] opacity-30", `bg-gradient-to-tr ${mod.color}`)} />
                <div className="absolute inset-0 bg-grid mask-radial-fade opacity-40" />
            </div>

            <div className="container-eru">
                <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center", isReverse && "lg:[direction:rtl]")}>
                    {/* Copy side */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-6 [direction:ltr]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                                Module {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                        </div>

                        <div className="mt-6 flex items-center gap-4">
                            <div
                                className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl bg-gradient-to-br",
                                    mod.color,
                                )}
                            >
                                <mod.icon className="h-8 w-8" strokeWidth={2.2} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
                                {mod.title}
                            </h2>
                        </div>

                        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                            {mod.desc ||
                                `A complete, opinionated ${mod.title.toLowerCase()} module — designed with real Indian schools, tested by real teachers.`}
                        </p>

                        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mod.items.map((it, i) => (
                                <motion.li
                                    key={it}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.06 }}
                                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm px-4 py-3"
                                >
                                    <span
                                        className={cn(
                                            "h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-white bg-gradient-to-br",
                                            mod.color,
                                        )}
                                    >
                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{it}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link to="/demo">
                                <Button
                                    data-testid={`module-cta-${mod.id}`}
                                    className={cn(
                                        "rounded-full h-11 px-5 text-white font-semibold shadow-soft bg-gradient-to-r",
                                        mod.color,
                                    )}
                                >
                                    See it in action <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/pricing">
                                <Button
                                    variant="ghost"
                                    className="rounded-full h-11 px-5 text-foreground font-semibold hover:bg-muted"
                                >
                                    View pricing
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Visual side — mock preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="lg:col-span-6 [direction:ltr]"
                    >
                        <ModulePreview mod={mod} index={index} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

/**
 * ModulePreview — decorative "device / dashboard" card unique per module.
 * Purely visual with hand-drawn UI to keep design premium.
 */
function ModulePreview({ mod, index }) {
    return (
        <div className="relative">
            {/* Glow */}
            <div className={cn("absolute -inset-4 -z-10 rounded-[2.5rem] blur-2xl opacity-30 bg-gradient-to-br", mod.color)} />

            <div className="relative rounded-[2rem] border border-border/70 bg-card p-4 sm:p-6 shadow-soft-lg overflow-hidden">
                {/* Header strip */}
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("h-8 rounded-lg px-3 flex items-center gap-2 text-white text-[11px] font-semibold bg-gradient-to-r", mod.color)}>
                        <mod.icon className="h-3.5 w-3.5" /> {mod.title}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                </div>

                {/* Body — Bento widgets */}
                <div className="grid grid-cols-6 gap-3">
                    {/* Big stat card */}
                    <div className="col-span-3 rounded-xl border border-border/60 bg-muted/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Overview
                        </p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                            {["96.2%", "₹12.4M", "4,286", "128", "1,542", "24×7", "58", "42"][index] || "94%"}
                        </p>
                        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full bg-gradient-to-r", mod.color)} style={{ width: `${65 + (index * 5) % 30}%` }} />
                        </div>
                    </div>
                    {/* Mini stat */}
                    <div className="col-span-3 rounded-xl border border-border/60 bg-muted/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Trend
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">+18.4% vs last month</p>
                        <div className="mt-3 flex items-end gap-1 h-10">
                            {[40, 55, 42, 68, 60, 82, 96].map((v, i) => (
                                <div
                                    key={i}
                                    className={cn("flex-1 rounded-sm bg-gradient-to-t", mod.color)}
                                    style={{ height: `${v}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* List rows */}
                    <div className="col-span-6 rounded-xl border border-border/60 bg-muted/40 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                Live activity
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> real-time
                            </span>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {mod.items.slice(0, 3).map((it, i) => (
                                <li key={i} className="flex items-center justify-between text-[12px] rounded-lg bg-card px-3 py-2 border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("h-6 w-6 rounded-md flex items-center justify-center text-white bg-gradient-to-br", mod.color)}>
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                        <span className="font-medium">{it}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">just now</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Floating badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="hidden md:flex absolute -top-4 -right-4 items-center gap-2 rounded-xl bg-card border border-border/60 px-3 py-2 shadow-soft"
            >
                <Sparkles className={cn("h-4 w-4 text-blue-800")} />
                <span className="text-[11px] font-semibold">100% Secure</span>
            </motion.div>
        </div>
    );
}

export default function FeaturesPage() {
    return (
        <div data-testid="features-page">
            {/* Hero */}
            <section className="relative pt-12 pb-12 sm:pt-20 sm:pb-16 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade opacity-60" />
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[720px] rounded-full bg-blue-500/10 blur-[120px]" />
                </div>
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="Features & Modules"
                        title="Eight modules. One school operating system."
                        subtitle="Everything your school runs on — deeply integrated, obsessively polished. Scroll to explore each module in detail."
                    />

                    {/* Quick module nav pills */}
                    <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                        {moduleGroups.map((m, i) => (
                            <a
                                key={m.id}
                                href={`#module-${m.id}`}
                                data-testid={`module-nav-pill-${m.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-[12px] font-semibold hover:border-blue-800/40 hover:shadow-soft transition-all group"
                            >
                                <span
                                    className={cn(
                                        "h-5 w-5 rounded-md flex items-center justify-center text-white bg-gradient-to-br",
                                        m.color,
                                    )}
                                >
                                    <m.icon className="h-2.5 w-2.5" strokeWidth={3} />
                                </span>
                                <span className="text-muted-foreground group-hover:text-foreground">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span>{m.title.split(" (")[0]}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ Full-screen modules ============ */}
            <div>
                {moduleGroups.map((m, i) => (
                    <div key={m.id} id={`module-${m.id}`}>
                        <ImmersiveModule mod={m} index={i} />
                    </div>
                ))}
            </div>

            {/* ============ Role-based tabbed feature grid ============ */}
            <section className="py-24">
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="By Role"
                        title="A tailored experience for every stakeholder"
                        subtitle="From principals to parents — everyone gets a focused, intuitive interface."
                    />
                    <Tabs defaultValue="admin" className="w-full mt-12">
                        <TabsList
                            data-testid="features-tab-list"
                            className="mx-auto flex flex-wrap justify-center gap-1 h-auto p-1.5 bg-muted/60 rounded-full border border-border/70"
                        >
                            {featureCategories.map((c) => (
                                <TabsTrigger
                                    key={c.id}
                                    value={c.id}
                                    data-testid={`features-tab-${c.id}`}
                                    className="rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-800 data-[state=active]:text-white data-[state=active]:shadow-soft transition-all"
                                >
                                    {c.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {featureCategories.map((c) => (
                            <TabsContent key={c.id} value={c.id} className="mt-10 sm:mt-12">
                                <div className="text-center max-w-2xl mx-auto">
                                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{c.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{c.subtitle}</p>
                                </div>
                                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                                    {c.items.map((f, i) => (
                                        <motion.div
                                            key={f.title}
                                            initial={{ opacity: 0, y: 16 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.2 }}
                                            transition={{ duration: 0.4, delay: i * 0.04 }}
                                            data-testid={`feature-${c.id}-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="group rounded-2xl border border-border/70 bg-card p-6 shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all"
                                        >
                                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center text-white shadow-soft">
                                                <f.icon className="h-5 w-5" strokeWidth={2.2} />
                                            </div>
                                            <h4 className="mt-4 text-base font-semibold tracking-tight">
                                                {f.title}
                                            </h4>
                                            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                                                {f.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </section>

            <CTABanner />
        </div>
    );
}
