/* eslint-disable react/no-unescaped-entities */
import { motion } from "@site/lib/motion";
import { Users, Wallet, Sparkles, Bell, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

/**
 * Fully hand-crafted product dashboard preview — no external image required.
 * Bento layout with attendance chart, fee metric, AI insight panel, live counts.
 */

const attendanceData = [
    { day: "Mon", value: 92 },
    { day: "Tue", value: 95 },
    { day: "Wed", value: 88 },
    { day: "Thu", value: 96 },
    { day: "Fri", value: 91 },
    { day: "Sat", value: 84 },
];

const revenueData = [
    { m: "J", v: 42 },
    { m: "F", v: 55 },
    { m: "M", v: 61 },
    { m: "A", v: 78 },
    { m: "M", v: 84 },
    { m: "J", v: 96 },
    { m: "J", v: 112 },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const card = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function DashboardMockup() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative w-full"
            data-testid="hero-dashboard-mockup"
        >
            {/* Glow behind mockup */}
            <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-700/20 via-sky-400/10 to-transparent blur-3xl"
            />

            <div className="rounded-[1.75rem] border border-border/70 bg-card shadow-soft-lg overflow-hidden">
                {/* Fake browser chrome */}
                <div className="flex items-center justify-between px-4 h-10 border-b border-border/70 bg-muted/40">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono tracking-tight">
                        app.globalschoolmitra.com/dashboard
                    </div>
                    <div className="w-10" />
                </div>

                {/* Grid body */}
                <div className="grid grid-cols-6 gap-3 p-3 sm:p-4 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
                    {/* Sidebar */}
                    <motion.aside
                        variants={card}
                        className="hidden sm:flex col-span-1 flex-col gap-1.5 rounded-xl border border-border/60 bg-card/70 p-2.5"
                    >
                        {["Dashboard", "Students", "Attendance", "Fees", "Exams", "Timetable", "Messages"].map(
                            (l, i) => (
                                <div
                                    key={l}
                                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                                        i === 0
                                            ? "bg-blue-800 text-white"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            i === 0 ? "bg-white" : "bg-muted-foreground/40"
                                        }`}
                                    />
                                    {l}
                                </div>
                            ),
                        )}
                    </motion.aside>

                    {/* Main widgets area */}
                    <div className="col-span-6 sm:col-span-5 grid grid-cols-6 gap-3">
                        {/* Metric — students */}
                        <motion.div
                            variants={card}
                            className="col-span-3 sm:col-span-2 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                <Users className="h-3.5 w-3.5" /> Students
                            </div>
                            <div className="mt-2 text-2xl font-bold text-foreground tracking-tight">4,286</div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                <TrendingUp className="h-3 w-3" /> +12% MoM
                            </div>
                        </motion.div>

                        {/* Metric — fee */}
                        <motion.div
                            variants={card}
                            className="col-span-3 sm:col-span-2 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                <Wallet className="h-3.5 w-3.5" /> Fees Collected
                            </div>
                            <div className="mt-2 text-2xl font-bold text-foreground tracking-tight">
                                ₹12.4<span className="text-base text-muted-foreground">M</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-800 font-semibold">
                                <TrendingUp className="h-3 w-3" /> 94% cleared
                            </div>
                        </motion.div>

                        {/* Metric — attendance */}
                        <motion.div
                            variants={card}
                            className="col-span-6 sm:col-span-2 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Today's Attendance
                            </div>
                            <div className="mt-2 text-2xl font-bold text-foreground tracking-tight">96.2%</div>
                            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-700 to-sky-400"
                                    style={{ width: "96%" }}
                                />
                            </div>
                        </motion.div>

                        {/* Attendance chart */}
                        <motion.div
                            variants={card}
                            className="col-span-6 sm:col-span-3 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Weekly Attendance
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">92.6% average</p>
                                </div>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-700/10 dark:text-blue-300">
                                    This week
                                </span>
                            </div>
                            <div className="mt-2 h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 10, fill: "currentColor" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: 8,
                                                fontSize: 12,
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {attendanceData.map((_, i) => (
                                                <rect key={i} fill="url(#att-grad)" />
                                            ))}
                                        </Bar>
                                        <defs>
                                            <linearGradient id="att-grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366F1" />
                                                <stop offset="100%" stopColor="#38BDF8" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* AI Insights */}
                        <motion.div
                            variants={card}
                            className="col-span-6 sm:col-span-3 rounded-xl border border-blue-700/40 bg-gradient-to-br from-blue-800 to-sky-600 text-white p-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
                            <div className="relative">
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium">
                                    <span className="relative inline-flex h-2 w-2">
                                        <span className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
                                        <span className="relative h-2 w-2 rounded-full bg-white" />
                                    </span>
                                    <Sparkles className="h-3.5 w-3.5" /> AI Insights
                                </div>
                                <p className="mt-2 text-sm font-semibold leading-snug">
                                    3 students at risk of drop-out based on attendance & marks trends
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <button className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-blue-900">
                                        Review now
                                    </button>
                                    <span className="text-[11px] text-white/80">Grade 8 · Section B</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Fee revenue line */}
                        <motion.div
                            variants={card}
                            className="col-span-6 sm:col-span-4 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Fee Collections
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                        ₹96.2L{" "}
                                        <span className="text-[11px] text-emerald-600 ml-1 font-semibold">
                                            +18.4%
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-medium">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-blue-700" /> This year
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                        <XAxis
                                            dataKey="m"
                                            tick={{ fontSize: 10, fill: "currentColor" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: 8,
                                                fontSize: 12,
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="v"
                                            stroke="#6366F1"
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: "#6366F1" }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Notifications feed */}
                        <motion.div
                            variants={card}
                            className="col-span-6 sm:col-span-2 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                <Bell className="h-3.5 w-3.5" /> Live Feed
                            </div>
                            <ul className="mt-2 space-y-2">
                                {[
                                    { c: "bg-emerald-500", t: "Grade 9 attendance marked" },
                                    { c: "bg-sky-500", t: "12 fee receipts issued" },
                                    { c: "bg-amber-500", t: "PTA meeting in 2 hrs" },
                                ].map((n, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px]">
                                        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${n.c}`} />
                                        <span className="text-foreground/80">{n.t}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Timetable strip */}
                        <motion.div
                            variants={card}
                            className="col-span-6 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                    <Calendar className="h-3.5 w-3.5" /> Today's Timetable · Grade 10-A
                                </div>
                                <span className="text-[10px] text-muted-foreground">6 periods</span>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {[
                                    { s: "Math", t: "8:00", c: "from-blue-700 to-blue-300" },
                                    { s: "Physics", t: "9:00", c: "from-sky-500 to-sky-400" },
                                    { s: "English", t: "10:00", c: "from-emerald-500 to-emerald-400" },
                                    { s: "Chem", t: "11:30", c: "from-fuchsia-500 to-fuchsia-400" },
                                    { s: "History", t: "12:30", c: "from-amber-500 to-amber-400" },
                                    { s: "PE", t: "2:00", c: "from-rose-500 to-rose-400" },
                                ].map((p, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-lg p-2 text-white bg-gradient-to-br ${p.c} text-[10px] leading-tight`}
                                    >
                                        <div className="opacity-80">{p.t}</div>
                                        <div className="font-semibold">{p.s}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Floating side badge */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="hidden lg:flex absolute -left-6 top-16 items-center gap-2 rounded-xl bg-card border border-border/60 px-3 py-2 shadow-soft"
            >
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-[11px]">
                    <p className="font-semibold text-foreground">2,847 students</p>
                    <p className="text-muted-foreground">present today</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
