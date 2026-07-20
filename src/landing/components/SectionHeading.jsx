import { motion } from "@site/lib/motion";
import { cn } from "@site/lib/utils";

/**
 * Reusable section heading — eyebrow label + big title + sub.
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = "center", className }) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4",
                align === "center" ? "items-center text-center" : "items-start text-left",
                className,
            )}
        >
            {eyebrow && (
                <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200/70 bg-blue-50/70 text-blue-900 text-[11px] font-semibold uppercase tracking-[0.18em] dark:bg-blue-700/10 dark:border-blue-700/25 dark:text-blue-200"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-700 animate-pulse" />
                    {eyebrow}
                </motion.span>
            )}
            <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-3xl"
            >
                {title}
            </motion.h2>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
