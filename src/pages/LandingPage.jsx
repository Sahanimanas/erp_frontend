/**
 * LandingPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Public marketing home for the GlobalSchoolMitra School ERP (white & blue theme).
 *
 * Two primary calls-to-action:
 *   • "Try Live Demo" — one-click sign-in to the seeded demo school
 *     (admin@school.com / test123) → lands the visitor in the real dashboard.
 *   • "School Login"   — routes to the standard /login form.
 *
 * The headline stats (schools, students, staff, parents) are LIVE counts pulled
 * from the public /public/stats endpoint — no auth, aggregate numbers only.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  GraduationCap, ArrowRight, PlayCircle, LogIn, ShieldCheck,
  Users, CalendarCheck, Wallet, ClipboardList, BookOpen, Building2,
  BarChart3, Bus, CheckCircle2, School, UserCog, HeartHandshake,
} from "lucide-react";
import { loginSuccess } from "../redux/slices/authSlice";
import apiClient from "../services/axios";

// Credentials for the public demo tenant (seeded via prisma/seed.ts).
const DEMO = { email: "admin@school.com", password: "test123" };

const FEATURES = [
  { icon: Users,         title: "Student Information",  desc: "Admissions, profiles, promotions, ID cards & bulk import for 100k+ students." },
  { icon: CalendarCheck, title: "Attendance",           desc: "Daily student & staff rosters, in/out time, monthly reports and smart-card feeds." },
  { icon: Wallet,        title: "Fees & Payments",      desc: "Class fee structures, collection, receipts, discounts, dues & Excel exports." },
  { icon: ClipboardList, title: "Exams & Reports",      desc: "Create exams, enter results, generate report cards, admit cards and analytics." },
  { icon: BookOpen,      title: "Academics & HR",       desc: "Classes, sections, timetable, employees, departments, designations & payroll." },
  { icon: Building2,     title: "Office Accounting",    desc: "Accounts, vouchers, income & expense vouchers with live balance tracking." },
  { icon: BarChart3,     title: "Insightful Reports",   desc: "Student, fees, attendance, exam & financial reports across every module." },
  { icon: Bus,           title: "Transport & More",     desc: "Routes, admissions enquiry board, reception, cards and communication tools." },
];

// Human-friendly number: 1019 → "1,019"; append "+" for a marketing feel.
const fmt = (n) => (typeof n === "number" && n > 0 ? `${n.toLocaleString("en-IN")}+` : "0");

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState(null);
  const [stats, setStats] = useState(null); // { schools, students, employees, parents }

  // Resolve the school/platform brand for this domain (same source LoginPage uses).
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/public/school", { params: { host: window.location.hostname } });
        if (res.data?.success && res.data.data) setBrand(res.data.data);
      } catch { /* keep platform default */ }
    })();
  }, []);

  // Live platform counts for the stats strip.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/public/stats");
        if (res.data?.success && res.data.data) setStats(res.data.data);
      } catch { /* leave stats null → UI shows a graceful dash */ }
    })();
  }, []);

  const brandName = brand?.name || "GlobalSchoolMitra";

  const STAT_CARDS = [
    { icon: School,         value: stats?.schools,   label: "Schools onboarded" },
    { icon: Users,          value: stats?.students,  label: "Students registered" },
    { icon: UserCog,        value: stats?.employees, label: "Staff & teachers" },
    { icon: HeartHandshake, value: stats?.parents,   label: "Parents connected" },
  ];

  // Sign in to the demo tenant and drop the visitor into the live dashboard —
  // mirrors LoginPage's success path so demo sessions behave like real ones.
  const startDemo = async () => {
    setError("");
    setDemoLoading(true);
    try {
      const response = await apiClient.post("/auth/login", DEMO);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        localStorage.setItem("erp_auth", JSON.stringify({
          token: accessToken, refreshToken, tokenExpiry,
        }));

        dispatch(loginSuccess({
          token: accessToken,
          refreshToken,
          tokenExpiry,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            schoolName: user.schoolName ?? null,
            schoolLogo: user.schoolLogo ?? null,
            schoolWatermark: user.schoolWatermark ?? null,
            schoolUpiQr: user.schoolUpiQr ?? null,
            schoolAddress: user.schoolAddress ?? null,
            schoolPhone: user.schoolPhone ?? null,
            schoolEmail: user.schoolEmail ?? null,
            permissions: user.permissions ?? null,
            avatar: null,
          },
        }));
        navigate(user.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard");
      } else {
        setError(response.data.error || "Demo is unavailable right now.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not start the demo. Please try School Login.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Soft blue background accents */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-[26rem] h-[26rem] rounded-full bg-sky-200/40 blur-3xl" />

      {/* ── Top navigation ─────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between w-full px-5 sm:px-10 lg:px-16 py-5">
        <div className="flex items-center gap-2.5">
          {brand?.logo ? (
            <img src={brand.logo} alt={brandName} className="h-9 w-auto rounded-lg bg-white object-contain p-1 ring-1 ring-slate-200" />
          ) : (
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/25 text-white">
              <GraduationCap size={20} />
            </span>
          )}
          <span className="font-extrabold text-lg tracking-tight text-slate-900">{brandName}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={startDemo}
            disabled={demoLoading}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors disabled:opacity-60"
          >
            <PlayCircle size={16} /> Live Demo
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition-colors"
          >
            <LogIn size={16} /> School Login
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full px-5 sm:px-10 lg:px-16 min-h-[calc(100vh-72px)] flex flex-col justify-center pt-10 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide">
          <ShieldCheck size={13} /> Enterprise multi-tenant School ERP
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
          Run your entire school on{" "}
          <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            one platform
          </span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-slate-600 text-base sm:text-lg">
          Admissions, students, attendance, fees, exams, HR, accounting and reports —
          {" "}{brandName} brings every department into a single, secure dashboard.
        </p>

        {/* Primary CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={startDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70"
          >
            {demoLoading
              ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Starting demo…</span></>
              : <><PlayCircle size={18} /><span>Try Live Demo</span></>}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold transition-all"
          >
            <LogIn size={18} /> School Login <ArrowRight size={16} />
          </button>
        </div>
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        <p className="mt-3 text-xs text-slate-500">
          No sign-up needed — the demo opens a fully seeded school with sample students, fees & staff.
        </p>

        {/* Live stats strip (from /public/stats) */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-6xl mx-auto w-full">
          {STAT_CARDS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-5 text-center">
              <span className="mx-auto grid place-items-center h-9 w-9 rounded-xl bg-blue-50 text-blue-600 mb-3">
                <Icon size={18} />
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {value == null ? <span className="text-slate-300">—</span> : fmt(value)}
              </div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Feature grid ───────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-5 sm:px-10 lg:px-16 pb-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900">Everything a school needs</h2>
        <p className="text-center text-slate-500 mt-2 text-sm">One login for every module — no more scattered spreadsheets.</p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl bg-slate-50 border border-slate-200 p-5 hover:border-blue-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-600">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA band ────────────────────────────────────────────── */}
      <section className="relative z-10 w-full px-5 sm:px-10 lg:px-16 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-sky-500 p-8 sm:p-12 text-center text-white shadow-xl shadow-blue-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold">See it working in seconds</h2>
          <p className="mt-3 text-blue-50 max-w-xl mx-auto text-sm sm:text-base">
            Explore live dashboards, real student records and fee workflows — no setup, no forms.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startDemo}
              disabled={demoLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg transition-all disabled:opacity-70"
            >
              <PlayCircle size={18} /> {demoLoading ? "Starting demo…" : "Launch Demo"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 border border-white/40 text-white font-semibold transition-all"
            >
              <LogIn size={18} /> School Login
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-blue-50">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Secure JWT auth</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Role-based access</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Built for scale</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="w-full px-5 sm:px-10 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 {brandName} — School Management System</span>
          <button onClick={() => navigate("/login")} className="text-blue-700 hover:text-blue-800 font-medium transition-colors">
            School Login →
          </button>
        </div>
      </footer>
    </div>
  );
}
