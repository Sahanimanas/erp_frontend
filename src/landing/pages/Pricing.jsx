import SectionHeading from "@site/components/SectionHeading";
import { PricingCards } from "@site/sections/PricingPreview";
import FAQ from "@site/sections/FAQ";
import CTABanner from "@site/sections/CTABanner";

export default function PricingPage() {
    return (
        <div data-testid="pricing-page">
            <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-14 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade opacity-60" />
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="Pricing"
                        title="Fair pricing that scales with your school."
                        subtitle="Every plan includes onboarding, data migration and unlimited teacher accounts. No per-student billing on any plan."
                    />
                </div>
            </section>

            <section className="pb-24">
                <div className="container-eru">
                    <PricingCards />

                    {/* Comparison call-out */}
                    <div className="mt-16 rounded-3xl border border-border/70 bg-card p-8 sm:p-10 shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "30-day free trial",
                                desc: "Full access, no credit card. Cancel anytime — no questions asked.",
                            },
                            {
                                title: "Migration included",
                                desc: "We move your existing data from Excel or any other ERP for free.",
                            },
                            {
                                title: "Cancel anytime",
                                desc: "Monthly & annual billing. Export your data with one click if you leave.",
                            },
                        ].map((b) => (
                            <div key={b.title}>
                                <h4 className="font-semibold text-foreground">{b.title}</h4>
                                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FAQ />
            <CTABanner />
        </div>
    );
}
