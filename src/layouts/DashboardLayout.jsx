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
import { selectSidebarCollapsed, setMobileOpen } from "../redux/slices/uiSlice";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar  from "../components/navbar/Topbar";

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
        <Topbar onMenuClick={openMobile} />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          id="main-content"
        >
          <div className="animate-[fadeSlideIn_0.2s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
