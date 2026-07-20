import { motion } from "@site/lib/motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@site/components/SectionHeading";
import { coreFeatures } from "@site/utils/data";

/**
 * Bento-style features overview.
 */
export default function FeaturesOverview() {
    return (
        <section data-testid="features-overview-section" className="py-24 sm:py-32">
            <div className="container-eru">
                <SectionHeading
                    eyebrow="Platform"
                    title="Every school workflow — thoughtfully redesigned"
                    subtitle="From taking daily attendance to publishing report cards, School Mitra replaces 6+ tools with a single, opinionated platform."
                />

                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                    {coreFeatures.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: i * 0.04 }}
                            data-testid={`feature-card-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                            className="group relative rounded-2xl border border-border/70 bg-card p-6 shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
                        >
                            <span className="absolute inset-0 bg-gradient-to-br from-blue-700/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 text-white shadow-soft">
                                    <f.icon className="h-5 w-5" strokeWidth={2.2} />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                                    {f.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                                <Link
                                    to="/features"
                                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-800 dark:text-blue-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all"
                                >
                                    Learn more <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
