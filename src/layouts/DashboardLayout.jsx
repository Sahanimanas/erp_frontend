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
import { useDispatch, useSelector } from "react-redux";
import { UserCheck, LogOut } from "lucide-react";
import { setMobileOpen } from "../redux/slices/uiSlice";
import { selectImpersonation, selectUser, impersonationEnd } from "../redux/slices/authSlice";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/navbar/Topbar";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const [mobileSidebarOpen, setMobileSidebarOpenState] = useState(false);
  const impersonation = useSelector(selectImpersonation);
  const user = useSelector(selectUser);

  const openMobile  = () => { setMobileSidebarOpenState(true);  dispatch(setMobileOpen(true)); };
  const closeMobile = () => { setMobileSidebarOpenState(false); dispatch(setMobileOpen(false)); };

  // Restore the Super Admin's parked session and go back to the platform side.
  const exitImpersonation = () => {
    dispatch(impersonationEnd());
    window.location.assign("/super-admin/schools");
  };

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
        {/* Impersonation banner. An impersonated session is otherwise
            indistinguishable from the Super Admin's own — and account-scoped
            actions (Change Password above all) act on whoever the token says
            you are, not on the school you have on screen. */}
        {impersonation && (
          <div className="no-print shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-white">
            <UserCheck size={15} className="shrink-0" />
            <p className="text-[12px] font-semibold">
              Signed in as {user?.email || user?.name || "school admin"}
              {user?.schoolName ? ` · ${user.schoolName}` : ""}
            </p>
            <p className="text-[11px] text-amber-50">
              Impersonated by {impersonation.byEmail || "Super Admin"} — account actions apply to this school
              admin, not to your platform login.
            </p>
            <button
              onClick={exitImpersonation}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-white/20 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/30"
            >
              <LogOut size={12} /> Exit to Super Admin
            </button>
          </div>
        )}

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
