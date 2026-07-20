import { Link } from "react-router-dom";
import { motion } from "@site/lib/motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@site/ui/button";
import SectionHeading from "@site/components/SectionHeading";
import { pricingPlans } from "@site/utils/data";
import { cn } from "@site/lib/utils";

/**
 * Shared pricing card grid — used on Home preview & Pricing page.
 */
export function PricingCards({ compact = false }) {
    return (
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {pricingPlans.map((plan, idx) => {
                const isHighlight = plan.highlight;
                const isPremium = plan.premium;
                return (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        data-testid={`pricing-card-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className={cn(
                            "relative rounded-3xl bg-card p-7 sm:p-8 flex flex-col",
                            isHighlight
                                ? "border-2 border-blue-800 shadow-soft-lg lg:scale-[1.02]"
                                : "border border-border/70 shadow-soft",
                            isPremium && "glow-indigo border-transparent",
                        )}
                    >
                        {isHighlight && plan.badge && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-800 text-white text-[11px] font-semibold uppercase tracking-wider shadow-soft">
                                <Sparkles className="h-3 w-3" /> {plan.badge}
                            </span>
                        )}

                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold tracking-tight text-foreground">{plan.name}</h3>
                            {isPremium && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gradient-indigo">
                                    AI
                                </span>
                            )}
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                            {plan.tagline}
                        </p>

                        <div className="mt-6 flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">
                                ₹{plan.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">/month</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Billed annually · GST extra</p>

                        <Link to="/demo" className="block mt-6">
                            <Button
                                data-testid={`pricing-cta-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
                                className={cn(
                                    "w-full rounded-full h-11 font-semibold",
                                    isHighlight || isPremium
                                        ? "bg-blue-800 hover:bg-blue-900 text-white"
                                        : "bg-foreground text-background hover:opacity-90",
                                )}
                            >
                                {plan.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </Link>

                        <ul className="mt-7 space-y-3 flex-1">
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                                    <span
                                        className={cn(
                                            "mt-0.5 h-4.5 w-4.5 shrink-0 rounded-full flex items-center justify-center",
                                            isHighlight || isPremium
                                                ? "bg-blue-800 text-white"
                                                : "bg-blue-50 text-blue-800 dark:bg-blue-700/10",
                                        )}
                                    >
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                );
            })}
        </div>
    );
}

/**
 * Homepage preview version of pricing (with heading).
 */
export default function PricingPreview() {
    return (
        <section data-testid="pricing-preview-section" className="py-24 sm:py-32 bg-muted/30">
            <div className="container-eru">
                <SectionHeading
                    eyebrow="Pricing"
                    title="Simple, transparent pricing"
                    subtitle="Start on our free 30-day trial. No surprise fees — no per-student add-ons on higher plans."
                />
                <PricingCards />
            </div>
        </section>
    );
}
