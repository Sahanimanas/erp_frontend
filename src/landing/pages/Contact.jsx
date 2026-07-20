import { useState } from "react";
import { openEnquiryMail } from "@site/lib/enquiry";
import { toast } from "@site/lib/toast";
import { Mail, Phone, MapPin, Loader2, Send } from "lucide-react";
import { motion } from "@site/lib/motion";
import SectionHeading from "@site/components/SectionHeading";
import { Input } from "@site/ui/input";
import { Label } from "@site/ui/label";
import { Textarea } from "@site/ui/textarea";
import { Button } from "@site/ui/button";
import { Card, CardContent } from "@site/ui/card";
import { BRAND } from "@site/utils/data";

const initial = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const validate = () => {
        const e = {};
        if (form.name.trim().length < 2) e.name = "Please enter your name";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
        if (form.subject.trim().length < 2) e.subject = "Add a short subject";
        if (form.message.trim().length < 5) e.message = "Message is too short";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        // No contact endpoint exists server-side yet — hand the enquiry to the
        // visitor's mail client instead of silently dropping it.
        const handedOff = openEnquiryMail({
            subject: `Website enquiry: ${form.subject}`,
            fields: form,
        });
        if (handedOff) {
            toast.success("Opening your email app — send the draft and we'll reply within 1 business day.");
            setDone(true);
        } else {
            toast.error(`Couldn't open your email app. Please write to ${BRAND.email}.`);
        }
        setSubmitting(false);
    };

    return (
        <div data-testid="contact-page">
            <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade opacity-60" />
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="Get in touch"
                        title="Talk to a real human."
                        subtitle="Our team responds within one business day. For urgent support, our chat is available 9am–9pm IST."
                    />
                </div>
            </section>

            <section className="pb-24">
                <div className="container-eru grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Contact form */}
                    <Card className="lg:col-span-3 rounded-3xl border-border/70 shadow-soft">
                        <CardContent className="p-6 sm:p-8">
                            {done ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-12"
                                    data-testid="contact-success"
                                >
                                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                        <Send className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h3 className="mt-4 text-2xl font-bold tracking-tight">Message sent!</h3>
                                    <p className="mt-2 text-muted-foreground">
                                        We got your message. Expect a reply from our team within one business day.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setDone(false);
                                            setForm(initial);
                                        }}
                                        variant="outline"
                                        className="mt-6 rounded-full"
                                        data-testid="contact-reset-btn"
                                    >
                                        Send another message
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field
                                            id="name"
                                            label="Full name"
                                            value={form.name}
                                            onChange={(v) => setForm({ ...form, name: v })}
                                            error={errors.name}
                                        />
                                        <Field
                                            id="email"
                                            type="email"
                                            label="Email"
                                            value={form.email}
                                            onChange={(v) => setForm({ ...form, email: v })}
                                            error={errors.email}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field
                                            id="phone"
                                            label="Phone (optional)"
                                            value={form.phone}
                                            onChange={(v) => setForm({ ...form, phone: v })}
                                        />
                                        <Field
                                            id="subject"
                                            label="Subject"
                                            value={form.subject}
                                            onChange={(v) => setForm({ ...form, subject: v })}
                                            error={errors.subject}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            data-testid="contact-field-message"
                                            rows={5}
                                            placeholder="Tell us about your school and how we can help…"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            className="mt-1.5 rounded-xl border-border/80"
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        data-testid="contact-submit-btn"
                                        className="rounded-full h-12 px-6 bg-blue-800 hover:bg-blue-900 text-white font-semibold w-full sm:w-auto"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" /> Send message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar info */}
                    <div className="lg:col-span-2 space-y-5">
                        <InfoCard
                            icon={Mail}
                            title="Email"
                            body={BRAND.email}
                            href={BRAND.emailHref}
                            testid="contact-info-email"
                        />
                        <InfoCard
                            icon={Phone}
                            title="Phone"
                            body={BRAND.phone}
                            href={BRAND.phoneHref}
                            testid="contact-info-phone"
                        />
                        <InfoCard
                            icon={MapPin}
                            title="Head office"
                            body={BRAND.address}
                            testid="contact-info-address"
                        />

                        {/* Map card */}
                        <div
                            className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-soft"
                            data-testid="contact-map"
                        >
                            <div className="aspect-video bg-muted">
                                <iframe
                                    title="Global School Mitra office location"
                                    src="https://www.google.com/maps?q=Boring%20Road%20Patna%20Bihar&output=embed"
                                    loading="lazy"
                                    className="w-full h-full border-0"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Field({ id, label, value, onChange, error, type = "text" }) {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                data-testid={`contact-field-${id}`}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1.5 h-11 rounded-xl border-border/80"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    );
}

function InfoCard({ icon: Icon, title, body, href, testid }) {
    const Content = (
        <>
            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-700/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-blue-800 dark:text-blue-300" strokeWidth={2.2} />
            </div>
            <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    {title}
                </p>
                <p className="mt-1 font-medium text-foreground">{body}</p>
            </div>
        </>
    );
    const className =
        "rounded-2xl border border-border/70 bg-card p-5 flex items-start gap-4 shadow-soft hover:-translate-y-0.5 transition-transform";
    return href ? (
        <a href={href} className={className} data-testid={testid}>
            {Content}
        </a>
    ) : (
        <div className={className} data-testid={testid}>
            {Content}
        </div>
    );
}
