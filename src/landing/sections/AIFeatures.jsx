import { motion } from "@site/lib/motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@site/ui/button";
import { aiFeatures } from "@site/utils/data";

/**
 * Dark, high-contrast AI section — glowing accents.
 */
export default function AIFeatures() {
    return (
        <section
            data-testid="ai-features-section"
            className="relative py-24 sm:py-32 overflow-hidden bg-slate-950 text-white"
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 -z-0 opacity-70">
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-800/25 blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-sky-500/20 blur-[140px]" />
            </div>
            <div className="absolute inset-0 -z-0 bg-grid opacity-[0.06]" />

            <div className="relative container-eru">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left copy */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold text-blue-200">
                            <Sparkles className="h-3.5 w-3.5" /> AI Automation
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
                            The first ERP that
                            <br />
                            <span className="text-gradient-indigo">thinks with you.</span>
                        </h2>
                        <p className="mt-5 text-white/70 leading-relaxed max-w-md">
                            AI woven into everyday workflows — not bolted on. Predict at-risk students, auto-draft
                            reports, generate board-aligned papers and answer parents 24/7.
                        </p>
                        <Link to="/features" className="inline-block mt-8">
                            <Button
                                data-testid="ai-explore-btn"
                                className="rounded-full h-11 px-5 bg-white text-blue-900 hover:bg-white/90 font-semibold"
                            >
                                Explore AI features
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Right feature cards */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiFeatures.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                data-testid={`ai-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
                                className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-blue-300/40 hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 shadow-lg shadow-blue-700/30">
                                    <f.icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
                                <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
