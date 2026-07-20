import { motion } from "@site/lib/motion";
import { Rocket, Eye, HeartHandshake } from "lucide-react";
import SectionHeading from "@site/components/SectionHeading";
import Stats from "@site/sections/Stats";
import CTABanner from "@site/sections/CTABanner";
import { team } from "@site/utils/data";

const pillars = [
    {
        icon: Rocket,
        title: "Our Mission",
        desc: "To give every school — from Patna to Pune — enterprise-grade software so educators can spend more time teaching, less time on paperwork.",
    },
    {
        icon: Eye,
        title: "Our Vision",
        desc: "Smart Schools. Smart Future. Empower 25,000 institutions and 10 million students to run on modern digital infrastructure by 2030.",
    },
    {
        icon: HeartHandshake,
        title: "Why We Built This",
        desc: "The founders ran a school in Bihar for three years. We felt the pain of using 7 different tools — and knew there had to be a better way.",
    },
];

export default function AboutPage() {
    return (
        <div data-testid="about-page">
            {/* Hero */}
            <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade opacity-60" />
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="About Global School Mitra"
                        title="Built by educators, for educators."
                        subtitle="We're on a mission to modernise how schools run — with software that respects teachers' time and empowers principals to lead."
                    />
                </div>
            </section>

            {/* Pillars */}
            <section className="pb-24">
                <div className="container-eru">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                data-testid={`about-pillar-${p.title.toLowerCase().replace(/\s+/g, "-")}`}
                                className="rounded-3xl border border-border/70 bg-card p-8 shadow-soft"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-700 to-orange-500 text-white flex items-center justify-center shadow-soft">
                                    <p.icon className="h-6 w-6" strokeWidth={2.2} />
                                </div>
                                <h3 className="mt-5 text-xl font-semibold tracking-tight">{p.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Stats />

            {/* Team */}
            <section className="py-24 sm:py-32">
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="Team"
                        title="The humans behind Global School Mitra"
                        subtitle="A small, senior team from Google, BYJU'S, IIT and life-long educators."
                    />
                    <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {team.map((m, i) => (
                            <motion.div
                                key={m.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                data-testid={`team-card-${m.name.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group rounded-2xl border border-border/70 bg-card overflow-hidden shadow-soft hover:-translate-y-1 hover:shadow-soft-lg transition-all"
                            >
                                <div className="aspect-square overflow-hidden bg-muted">
                                    <img
                                        src={m.avatar}
                                        alt={m.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5">
                                    <h4 className="font-semibold tracking-tight">{m.name}</h4>
                                    <p className="text-xs uppercase tracking-widest text-blue-800 dark:text-blue-300 mt-1">
                                        {m.role}
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        {m.bio}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <CTABanner />
        </div>
    );
}
