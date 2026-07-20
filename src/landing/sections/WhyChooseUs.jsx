import { motion } from "@site/lib/motion";
import SectionHeading from "@site/components/SectionHeading";
import { whyUs } from "@site/utils/data";

export default function WhyChooseUs() {
    return (
        <section data-testid="why-choose-us-section" className="py-24 sm:py-32 bg-muted/30">
            <div className="container-eru">
                <SectionHeading
                    eyebrow="Why School Mitra"
                    title="Enterprise-grade, but delightfully simple"
                    subtitle="Built with the exacting standards of IT heads, and the friendly polish teachers actually enjoy using."
                />
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {whyUs.map((w, i) => (
                        <motion.div
                            key={w.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            data-testid={`why-card-${w.title.toLowerCase().replace(/\s+/g, "-")}`}
                            className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft flex gap-4 items-start hover:-translate-y-1 hover:shadow-soft-lg transition-all"
                        >
                            <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-700/10 flex items-center justify-center">
                                <w.icon className="h-5 w-5 text-blue-800 dark:text-blue-300" strokeWidth={2.2} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold tracking-tight">{w.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
