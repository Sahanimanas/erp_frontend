/**
 * Dashboard v2 — a reports-only dashboard with its own full-screen layout.
 *
 *   ┌────────────┬──────────────────────────────────────┐
 *   │  Reports   │  School name              user  (A)  │
 *   │  menu      ├──────────────────────────────────────┤
 *   │  (dark)    │  Overview or one complete report     │
 *   │  ← Classic │                                      │
 *   └────────────┴──────────────────────────────────────┘
 *
 * Routed at /dashboard/v2/* outside DashboardLayout (routeConfig `standalone`),
 * so the ERP's own sidebar is replaced by this report menu. "Back to Classic
 * View" returns to the normal dashboard. Each report is lazy-loaded.
 */
import { Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard, ClipboardCheck, CircleDollarSign, FileText, UserPlus, Receipt, Wallet, UsersRound, Cake,
  MessageSquareText, ArrowLeft, Menu, X, GraduationCap, CalendarDays, School,
} from "lucide-react";
import { selectUser } from "../../redux/slices/authSlice";
import { ClassFilterProvider, useClassFilter } from "./_ui";
import logo from "../../../public/logo.jpeg";

const OverviewPage = lazy(() => import("./OverviewPage"));

/** The report menu, in the order a principal reads the school. */
export const V2_REPORTS = [
  { path: "attendance", label: "Attendance Report", icon: ClipboardCheck, Page: lazy(() => import("./AttendancePage")) },
  { path: "finance", label: "Revenue & Finance", icon: CircleDollarSign, Page: lazy(() => import("./FinancePage")) },
  { path: "exams", label: "Exam Performance", icon: FileText, Page: lazy(() => import("./ExamPage")) },
  { path: "admissions", label: "Admission Report", icon: UserPlus, Page: lazy(() => import("./AdmissionPage")) },
  { path: "fee-types", label: "Paid Fee Type Report", icon: Receipt, Page: lazy(() => import("./FeeTypePage")) },
  { path: "fee-dues", label: "Fee Dues & Defaulters", icon: Wallet, Page: lazy(() => import("./FeeDuesPage")) },
  { path: "staff-attendance", label: "Staff Attendance", icon: UsersRound, Page: lazy(() => import("./StaffAttendancePage")) },
  { path: "birthdays", label: "Upcoming Birthdays", icon: Cake, Page: lazy(() => import("./BirthdaysPage")) },
  { path: "whatsapp", label: "WhatsApp Sent Report", icon: MessageSquareText, Page: lazy(() => import("./WhatsAppPage")) },
];

const BASE = "/dashboard/v2";

function Loading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
    </div>
  );
}

function MenuLink({ to, end, icon: Icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          isActive ? "bg-blue-600 font-semibold text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,.8)]" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
        }`
      }
    >
      <Icon size={19} className="shrink-0" />
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

/** The class every report is narrowed to, shown in the header with a way out. */
function ClassChip() {
  const { className, setClassId } = useClassFilter();
  if (!className) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-[12px] font-semibold text-blue-800 ring-1 ring-blue-200">
      <School size={13} /> {className}
      <button type="button" onClick={() => setClassId("")} aria-label={`Show all classes instead of ${className}`}
        className="rounded-full p-0.5 hover:bg-blue-100"><X size={13} /></button>
    </span>
  );
}

export default function DashboardV2Page() {
  return (
    <ClassFilterProvider>
      <DashboardV2Shell />
    </ClassFilterProvider>
  );
}

function DashboardV2Shell() {
  const user = useSelector(selectUser);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  // A new report scrolls to the top and closes the phone menu.
  useEffect(() => {
    setMenuOpen(false);
    document.getElementById("v2-main")?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const schoolName = user?.schoolName || "Your school";
  const initials = (user?.name || user?.email || "U").split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f5f9] font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* ── Report menu ──────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col bg-[#111a2e] transition-transform duration-300 lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Reports menu"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-4">
          {logoOk ? (
            <img src={user?.schoolLogo || logo} alt="" onError={() => setLogoOk(false)}
              className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap size={18} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-white">{schoolName}</p>
            <p className="text-[11.5px] text-slate-400">Reports dashboard</p>
          </div>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <MenuLink to={BASE} end icon={LayoutDashboard}>Overview</MenuLink>
          <p className="px-3.5 pb-1 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">Reports</p>
          {V2_REPORTS.map((r) => (
            <MenuLink key={r.path} to={`${BASE}/${r.path}`} icon={r.icon}>{r.label}</MenuLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/[0.07] p-3">
          <MenuLink to="/dashboard" end icon={ArrowLeft}>Back to Classic View</MenuLink>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open reports menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
            <Menu size={20} />
          </button>
          <p className="min-w-0 truncate text-[14px] font-semibold uppercase tracking-[0.06em] text-slate-700">{schoolName}</p>
          <ClassChip />
          <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-700 md:inline-flex">
            <CalendarDays size={13} /> {today}
          </span>
          <span className="hidden max-w-[220px] truncate text-[13px] text-slate-600 sm:block md:ml-2">{user?.email}</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-bold text-white max-md:ml-auto"
            title={user?.name || user?.email}>
            {initials}
          </span>
        </header>

        {/* role="main", not <main>: the ERP's classic form/table CSS is scoped to
            the <main> element, and v2 has its own look. */}
        <div role="main" id="v2-main" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1480px]">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route index element={<OverviewPage />} />
                {V2_REPORTS.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />)}
                <Route path="*" element={<Navigate to={BASE} replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
