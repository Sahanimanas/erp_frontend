/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { openEnquiryMail } from "@site/lib/enquiry";
import { motion } from "@site/lib/motion";
import { toast } from "@site/lib/toast";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Send, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import SectionHeading from "@site/components/SectionHeading";
import { Input } from "@site/ui/input";
import { Label } from "@site/ui/label";
import { Textarea } from "@site/ui/textarea";
import { Button } from "@site/ui/button";
import { Card, CardContent } from "@site/ui/card";

const initial = {
    school_name: "",
    principal_name: "",
    email: "",
    phone: "",
    students: "",
    city: "",
    message: "",
};

export default function DemoRequestPage() {
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (form.school_name.trim().length < 2) e.school_name = "Enter your school name";
        if (form.principal_name.trim().length < 2) e.principal_name = "Enter principal or contact name";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
        if (form.phone.trim().length < 6) e.phone = "Enter a valid phone number";
        const n = Number(form.students);
        if (!n || n < 1) e.students = "Enter approximate student count";
        if (form.city.trim().length < 1) e.city = "Enter your city";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (!validate()) {
            toast.error("Please fix the highlighted fields");
            return;
        }
        setSubmitting(true);
        // No demo-request endpoint exists server-side yet — hand the enquiry to
        // the visitor's mail client instead of silently dropping it. Visitors who
        // want to skip this entirely can use "Try Live Demo" on the home page.
        const handedOff = openEnquiryMail({
            subject: `Demo request: ${form.school_name}`,
            fields: { ...form, students: Number(form.students) },
        });
        if (handedOff) {
            toast.success("Opening your email app — send the draft and our team will be in touch.");
            setDone(true);
        } else {
            toast.error("Couldn't open your email app. Please call or email us directly.");
        }
        setSubmitting(false);
    };

    return (
        <div data-testid="demo-request-page">
            <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid mask-radial-fade opacity-60" />
                <div className="container-eru">
                    <SectionHeading
                        eyebrow="Request a Demo"
                        title="See School Mitra in your school's shoes."
                        subtitle="A 30-minute walkthrough tailored to your grade levels, curriculum and existing tools. No hard sell."
                    />
                </div>
            </section>

            <section className="pb-24">
                <div className="container-eru grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left benefits panel */}
                    <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-32 self-start">
                        {[
                            {
                                icon: Sparkles,
                                title: "Personalised walkthrough",
                                desc: "We tailor the demo to your school's size, board and workflow.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Data-safe evaluation",
                                desc: "Try full features on a sandbox — your real data is never touched.",
                            },
                            {
                                icon: TrendingUp,
                                title: "ROI report included",
                                desc: "We'll share a projected time & money saved report for your institute.",
                            },
                        ].map((b) => (
                            <div
                                key={b.title}
                                className="rounded-2xl border border-border/70 bg-card p-5 flex items-start gap-4 shadow-soft"
                            >
                                <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-700/10 flex items-center justify-center">
                                    <b.icon className="h-5 w-5 text-blue-800 dark:text-blue-300" />
                                </div>
                                <div>
                                    <h4 className="font-semibold tracking-tight">{b.title}</h4>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        {b.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground pt-2">
                            Prefer to talk?{" "}
                            <Link to="/contact" className="font-semibold text-blue-800 dark:text-blue-300">
                                Reach our sales team →
                            </Link>
                        </p>
                    </div>

                    {/* Right form */}
                    <Card className="lg:col-span-3 rounded-3xl border-border/70 shadow-soft">
                        <CardContent className="p-6 sm:p-10">
                            {done ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-10"
                                    data-testid="demo-success"
                                >
                                    <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h3 className="mt-5 text-3xl font-bold tracking-tight">You're on the list.</h3>
                                    <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                                        We've received your request for a demo at{" "}
                                        <span className="font-semibold text-foreground">
                                            {form.school_name || "your school"}
                                        </span>
                                        . Our team will reach out to{" "}
                                        <span className="font-semibold text-foreground">{form.email}</span> within
                                        one business day.
                                    </p>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                                        <Button
                                            onClick={() => {
                                                setDone(false);
                                                setForm(initial);
                                            }}
                                            variant="outline"
                                            className="rounded-full"
                                            data-testid="demo-reset-btn"
                                        >
                                            Submit another request
                                        </Button>
                                        <Link to="/features">
                                            <Button className="rounded-full bg-blue-800 hover:bg-blue-900 text-white">
                                                Explore features →
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={submit} className="space-y-5" data-testid="demo-form">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <FormField
                                            id="school_name"
                                            label="School / College name"
                                            value={form.school_name}
                                            onChange={(v) => update("school_name", v)}
                                            error={errors.school_name}
                                            placeholder="Greenfield International School"
                                        />
                                        <FormField
                                            id="principal_name"
                                            label="Principal / Contact name"
                                            value={form.principal_name}
                                            onChange={(v) => update("principal_name", v)}
                                            error={errors.principal_name}
                                            placeholder="Dr. Anjali Menon"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <FormField
                                            id="email"
                                            label="Work email"
                                            type="email"
                                            value={form.email}
                                            onChange={(v) => update("email", v)}
                                            error={errors.email}
                                            placeholder="principal@yourschool.edu"
                                        />
                                        <FormField
                                            id="phone"
                                            label="Phone number"
                                            value={form.phone}
                                            onChange={(v) => update("phone", v)}
                                            error={errors.phone}
                                            placeholder="+91 98xxxxxx"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <FormField
                                            id="students"
                                            label="Approx. number of students"
                                            type="number"
                                            value={form.students}
                                            onChange={(v) => update("students", v)}
                                            error={errors.students}
                                            placeholder="e.g. 850"
                                        />
                                        <FormField
                                            id="city"
                                            label="City"
                                            value={form.city}
                                            onChange={(v) => update("city", v)}
                                            error={errors.city}
                                            placeholder="Bengaluru"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="message">Anything specific? (optional)</Label>
                                        <Textarea
                                            id="message"
                                            data-testid="demo-field-message"
                                            rows={4}
                                            value={form.message}
                                            onChange={(e) => update("message", e.target.value)}
                                            placeholder="Grades taught, current software, migration timelines…"
                                            className="mt-1.5 rounded-xl border-border/80"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                                        <p className="text-xs text-muted-foreground max-w-md">
                                            By submitting, you agree to our privacy policy. We'll never share your
                                            details with third parties.
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            data-testid="demo-submit-btn"
                                            size="lg"
                                            className="rounded-full h-12 px-6 bg-blue-800 hover:bg-blue-900 text-white font-semibold w-full sm:w-auto"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    Request Demo <Send className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function FormField({ id, label, value, onChange, error, type = "text", placeholder }) {
    return (
        <div>
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <Input
                id={id}
                data-testid={`demo-field-${id.replace(/_/g, "-")}`}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1.5 h-11 rounded-xl border-border/80"
                min={type === "number" ? 1 : undefined}
            />
            {error && (
                <p className="mt-1 text-xs text-destructive" data-testid={`demo-error-${id.replace(/_/g, "-")}`}>
                    {error}
                </p>
            )}
        </div>
    );
}
