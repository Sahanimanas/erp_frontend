/**
 * DashboardLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The shell that wraps every authenticated page:
 *
 *   ┌───────────┬─────────────────────────────────┐
 *   │           │  Topbar                         │
 *   │  Sidebar  ├─────────────────────────────────┤
 *   │           │  <Outlet />  (page content)     │
 *   └───────────┴─────────────────────────────────┘
 *
 * The top bar carries the menu toggle, the quick-actions grid, notifications
 * and the profile menu, matching the reference design. It replaces the
 * mobile-only floating hamburger that used to be the only way to open the
 * sidebar on a phone — the bar is that affordance at every width now, which is
 * why <main> no longer reserves top padding for it.
 *
 * Sidebar width transitions via CSS class (not inline style) so Tailwind
 * JIT can purge unused classes correctly.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMobileOpen } from "../redux/slices/uiSlice";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/navbar/Topbar";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const [mobileSidebarOpen, setMobileSidebarOpenState] = useState(false);

  const openMobile  = () => { setMobileSidebarOpenState(true);  dispatch(setMobileOpen(true)); };
  const closeMobile = () => { setMobileSidebarOpenState(false); dispatch(setMobileOpen(false)); };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--erp-bg)] font-['Plus_Jakarta_Sans',sans-serif]">

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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        <Topbar onMenuClick={openMobile} />
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          id="main-content"
        >
          {/* `min-h-full flex flex-col` lets a page stretch to the full viewport
              by putting `flex-1` on its own root (list pages do this so the
              table fills the screen instead of floating above a grey gap).
              Pages that don't opt in keep sizing to their content. */}
          <div className="animate-[fadeSlideIn_0.2s_ease-out] w-full min-h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
