/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@site/ui/button";

/**
 * Bottom CTA banner shown across pages.
 */
export default function CTABanner() {
    return (
        <section data-testid="cta-banner" className="py-16 sm:py-24">
            <div className="container-eru">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 p-10 sm:p-14 text-white">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom_right,white,transparent_50%)]" />
                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight max-w-xl">
                                See School Mitra in a live 30-minute demo.
                            </h3>
                            <p className="mt-3 text-white/80 max-w-lg">
                                Tell us your school size and we'll tailor the walkthrough — including how you'll
                                migrate from your current system.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/demo">
                                <Button
                                    data-testid="cta-banner-demo"
                                    size="lg"
                                    className="rounded-full h-12 px-6 bg-white text-blue-900 hover:bg-white/90 font-semibold"
                                >
                                    Request Demo <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button
                                    data-testid="cta-banner-contact"
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full h-12 px-6 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                >
                                    Talk to sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
