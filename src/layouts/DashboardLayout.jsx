/**
 * DashboardLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The shell that wraps every authenticated page:
 *
 *   ┌─────────────────────────────────────────────┐
 *   │  Sidebar  │  Topbar                         │
 *   │           │─────────────────────────────────│
 *   │           │  <Outlet />  (page content)      │
 *   └─────────────────────────────────────────────┘
 *
 * Sidebar width transitions via CSS class (not inline style) so Tailwind
 * JIT can purge unused classes correctly.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, GraduationCap } from "lucide-react";
import { selectSidebarCollapsed, setMobileOpen } from "../redux/slices/uiSlice";
import Sidebar from "../components/sidebar/Sidebar";

export default function DashboardLayout() {
  const dispatch         = useDispatch();
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpenState] = useState(false);

  const openMobile  = () => { setMobileSidebarOpenState(true);  dispatch(setMobileOpen(true)); };
  const closeMobile = () => { setMobileSidebarOpenState(false); dispatch(setMobileOpen(false)); };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobile}
      />

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div
        className={`
          flex flex-col flex-1 min-w-0 overflow-hidden
          transition-all duration-300
        `}
      >
        {/* Mobile-only top bar — opens the sidebar drawer. Hidden on desktop,
            where the page content fills the area beside the always-visible sidebar. */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 bg-[#0f172a] text-white shrink-0">
          <button onClick={openMobile} aria-label="Open menu" className="p-1.5 -ml-1 rounded-lg hover:bg-white/10">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <GraduationCap size={15} className="text-white" />
            </div>
            <span className="font-bold text-[13px] tracking-wide">GlobalSchoolMitra</span>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          id="main-content"
        >
          <div className="animate-[fadeSlideIn_0.2s_ease-out] w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
