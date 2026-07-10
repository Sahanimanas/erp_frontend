/**
 * LandingPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Public marketing home for the GlobalSchoolMitra School ERP.
 *
 * Two primary calls-to-action:
 *   • "Try Live Demo" — one-click sign-in to the seeded demo school
 *     (admin@school.com / test123) → lands the visitor in the real dashboard.
 *   • "School Login"   — routes to the standard /login form.
 *
 * Already-authenticated visitors are bounced straight to their home
 * (handled in AppRoutes' RootRoute), so this page is only ever seen logged-out.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  GraduationCap, ArrowRight, PlayCircle, LogIn, ShieldCheck,
  Users, CalendarCheck, Wallet, ClipboardList, BookOpen, Building2,
  BarChart3, Bus, CheckCircle2,
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

const STATS = [
  { value: "35+",   label: "Modules" },
  { value: "100k+", label: "Students at scale" },
  { value: "Multi", label: "Tenant SaaS" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState(null);

  // Resolve the school/platform brand for this domain (same source LoginPage uses).
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/public/school", { params: { host: window.location.hostname } });
        if (res.data?.success && res.data.data) setBrand(res.data.data);
      } catch { /* keep platform default */ }
    })();
  }, []);

  const brandName = brand?.name || "GlobalSchoolMitra";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#1a1030] text-white font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[28rem] h-[28rem] rounded-full bg-pink-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />

      {/* ── Top navigation ─────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5">
          {brand?.logo ? (
            <img src={brand.logo} alt={brandName} className="h-9 w-auto rounded-lg bg-white object-contain p-1" />
          ) : (
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <GraduationCap size={20} />
            </span>
          )}
          <span className="font-extrabold text-lg tracking-tight">{brandName}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={startDemo}
            disabled={demoLoading}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-200 hover:text-white transition-colors disabled:opacity-60"
          >
            <PlayCircle size={16} /> Live Demo
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold transition-colors"
          >
            <LogIn size={16} /> School Login
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
          <ShieldCheck size={13} /> Enterprise multi-tenant School ERP
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
          Run your entire school on{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            one platform
          </span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-slate-300/90 text-base sm:text-lg">
          Admissions, students, attendance, fees, exams, HR, accounting and reports —
          {" "}{brandName} brings every department into a single, secure dashboard.
        </p>

        {/* Primary CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={startDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70"
          >
            {demoLoading
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Starting demo…</span></>
              : <><PlayCircle size={18} /><span>Try Live Demo</span></>}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold transition-all"
          >
            <LogIn size={18} /> School Login <ArrowRight size={16} />
          </button>
        </div>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        <p className="mt-3 text-xs text-slate-500">
          No sign-up needed — the demo opens a fully seeded school with sample students, fees & staff.
        </p>

        {/* Stats strip */}
        <div className="mt-12 flex items-center justify-center gap-8 sm:gap-14">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Feature grid ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">Everything a school needs</h2>
        <p className="text-center text-slate-400 mt-2 text-sm">One login for every module — no more scattered spreadsheets.</p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl bg-[#111827]/70 backdrop-blur-xl border border-slate-800/60 p-5 hover:border-indigo-500/50 hover:-translate-y-0.5 transition-all"
            >
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-300 group-hover:text-indigo-200">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA band ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600/20 via-violet-600/15 to-pink-600/15 border border-indigo-500/30 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">See it working in seconds</h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
            Explore live dashboards, real student records and fee workflows — no setup, no forms.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={startDemo}
              disabled={demoLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70"
            >
              <PlayCircle size={18} /> {demoLoading ? "Starting demo…" : "Launch Demo"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-semibold transition-all"
            >
              <LogIn size={18} /> School Login
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Secure JWT auth</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Role-based access</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Built for scale</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 {brandName} — School Management System</span>
          <button onClick={() => navigate("/login")} className="hover:text-slate-300 transition-colors">
            School Login →
          </button>
        </div>
      </footer>
    </div>
  );
}
