import SectionHeading from "@site/components/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@site/ui/accordion";
import { faqs } from "@site/utils/data";

export default function FAQ() {
    return (
        <section data-testid="faq-section" className="py-24 sm:py-32">
            <div className="container-eru">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
                        <SectionHeading
                            eyebrow="FAQ"
                            title="Everything you wanted to ask."
                            subtitle="If you can't find your question here, our team is available on chat during business hours."
                            align="left"
                        />
                    </div>
                    <div className="lg:col-span-7">
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {faqs.map((f, i) => (
                                <AccordionItem
                                    key={f.q}
                                    value={`item-${i}`}
                                    data-testid={`faq-item-${i}`}
                                    className="rounded-2xl border border-border/70 bg-card px-5 shadow-soft data-[state=open]:border-blue-700/50"
                                >
                                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                                        {f.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                                        {f.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
}
