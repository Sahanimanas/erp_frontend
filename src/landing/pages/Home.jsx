import Hero from "@site/sections/Hero";
import TrustedBy from "@site/sections/TrustedBy";
import FeaturesOverview from "@site/sections/FeaturesOverview";
import AIFeatures from "@site/sections/AIFeatures";
import ClassroomShowcase from "@site/sections/ClassroomShowcase";
import WhyChooseUs from "@site/sections/WhyChooseUs";
import Stats from "@site/sections/Stats";
import Testimonials from "@site/sections/Testimonials";
import PricingPreview from "@site/sections/PricingPreview";
import FAQ from "@site/sections/FAQ";
import CTABanner from "@site/sections/CTABanner";

export default function Home() {
    return (
        <div data-testid="home-page">
            <Hero />
            <TrustedBy />
            <FeaturesOverview />
            <AIFeatures />
            <ClassroomShowcase />
            <WhyChooseUs />
            <Stats />
            <Testimonials />
            <PricingPreview />
            <FAQ />
            <CTABanner />
        </div>
    );
}
