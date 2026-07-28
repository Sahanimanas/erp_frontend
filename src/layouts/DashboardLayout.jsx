/**
 * DashboardLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The shell that wraps every authenticated page:
 *
 *   ┌───────────┬─────────────────────────────────┐
 *   │  Sidebar  │  <Outlet />  (page content)     │
 *   └───────────┴─────────────────────────────────┘
 *
 * There is deliberately NO top bar: the brand and the menu toggle live inside
 * the sidebar, so page content keeps the full viewport height.
 *
 * Sidebar width transitions via CSS class (not inline style) so Tailwind
 * JIT can purge unused classes correctly.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Menu } from "lucide-react";
import { setMobileOpen } from "../redux/slices/uiSlice";
import Sidebar from "../components/sidebar/Sidebar";

export default function DashboardLayout() {
  const dispatch = useDispatch();
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

      {/* Mobile-only floating menu button. The sidebar is off-screen on mobile,
          so without this there is no way to open it — but it FLOATS over the
          content instead of being a bar, so it costs the page no height. */}
      {!mobileSidebarOpen && (
        <button
          onClick={openMobile}
          aria-label="Open menu"
          className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        <main
          className="flex-1 overflow-y-auto p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8"
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
