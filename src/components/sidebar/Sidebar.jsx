/**
 * Sidebar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads navigation tree from routeConfig.js and renders it dynamically.
 *
 * Features:
 *   ✓ Auto-highlights active route via useLocation + NavLink
 *   ✓ Auto-expands parent menu when a child route is active
 *   ✓ Collapse mode (icon only) with tooltip labels
 *   ✓ Role-based filtering (hides items the user can't access)
 *   ✓ Expand/collapse state persisted in Redux uiSlice
 *   ✓ Mobile: slides in/out as a drawer
 */
import { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSidebarCollapsed, selectDarkMode,
  toggleSidebar, toggleDarkMode,
} from "../../redux/slices/uiSlice";
import { selectUserRole, selectUser, selectUserPermissions, logout } from "../../redux/slices/authSlice";
import { routeConfig, canAccessSection } from "../../routes/routeConfig";
import apiClient from "../../services/axios";
import * as Icons from "lucide-react";
import logo from "../../../public/logo.jpeg";
// ─── Icon resolver ─────────────────────────────────────────────────────────
function Icon({ name, size = 16, className = "" }) {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
}

// ─── Sidebar-only dark/light toggle ────────────────────────────────────────
// Flips uiSlice.darkMode, which puts the `dark` class on this sidebar's <aside>
// (not on <html>), so the theme change is confined to the sidebar.
function ThemeToggle({ dark, onToggle }) {
  const label = dark ? "Switch sidebar to light theme" : "Switch sidebar to dark theme";
  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-pressed={dark}
      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50
                 dark:text-slate-400 dark:hover:text-amber-300 dark:hover:bg-slate-800
                 transition-colors shrink-0"
    >
      {dark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
    </button>
  );
}

// ─── Nav leaf item (link) ──────────────────────────────────────────────────
function NavLeaf({ item, collapsed, onNavigate, dim = false }) {
  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      className={({ isActive }) => {
        // `dim` forces the inactive look even on the active route — used so the
        // Dashboard stops looking selected once the user opens another section.
        const active = isActive && !dim;
        return `flex items-center py-2.5 rounded-lg transition-all duration-150 group border-t
         ${collapsed ? "justify-center px-0" : "gap-3.5 px-3.5"}
         ${active
           ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white font-bold border-indigo-500 shadow-sm"
           : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300 dark:border-slate-700"
         }`;
      }}
      title={collapsed ? item.label : undefined}
    >
      <span className="flex-shrink-0">
        <Icon name={item.icon} size={18} />
      </span>
      {!collapsed && (
        <span className="text-[14px] font-bold grow whitespace-nowrap">{item.label}</span>
      )}
    </NavLink>
  );
}

// ─── Nav parent item (opens a side flyout) ────────────────────────────────
/**
 * A section opens its children in a panel BESIDE the sidebar rather than
 * expanding inside it.
 *
 * Why: expanding in place pushed every section below it down the list, so
 * opening "Admission" moved "Employee" under the user's cursor. A flyout leaves
 * the sidebar still and keeps the whole menu reachable, and it is the only shape
 * that works when the sidebar is collapsed to icons.
 *
 * It is positioned `fixed` because the nav scrolls and clips — a panel rendered
 * inside it could not escape its own overflow.
 */
function NavParent({ item, collapsed, onNavigate, openKey, setOpenKey }) {
  const location = useLocation();
  const btnRef   = useRef(null);
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  const isOpen         = openKey === item.key;
  const isParentActive = item.children?.some((c) => location.pathname.startsWith(c.path));
  const kids           = item.children.filter((c) => !c.hidden);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const PANEL_H = Math.min(kids.length * 40 + 52, window.innerHeight - 24);
    setPos({
      left: r.right + 8,
      // Keep the panel on screen when a section sits near the bottom.
      top: Math.max(12, Math.min(r.top, window.innerHeight - PANEL_H - 12)),
    });
  };

  const open = () => { place(); setOpenKey(item.key); };

  // Close on Escape or a click outside; re-place on resize. Listeners exist only
  // while this panel is open, so a closed sidebar costs nothing.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setOpenKey(null); };
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpenKey(null);
    };
    const onResize = () => place();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]); // eslint-disable-line

  return (
    <div>
      <button
        ref={btnRef}
        onClick={() => (isOpen ? setOpenKey(null) : open())}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center py-2.5 rounded-lg transition-all duration-150 text-left border-t
          ${collapsed ? "justify-center px-0" : "gap-3.5 px-3.5"}
          ${isOpen || isParentActive
            ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white font-bold border-indigo-500 shadow-sm"
            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300 dark:border-slate-700"
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <span className="flex-shrink-0"><Icon name={item.icon} size={18} /></span>
        {!collapsed && (
          <>
            <span className="text-[14px] font-bold grow whitespace-nowrap">{item.label}</span>
            <Icons.ChevronRight
              size={15}
              className="flex-shrink-0 transition-transform duration-200"
              style={{ transform: isOpen ? "translateX(2px)" : "none" }}
            />
          </>
        )}
      </button>

      {isOpen && pos && (
        <div
          ref={panelRef}
          role="menu"
          aria-label={item.label}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 60 }}
          // A surface of its own, not the sidebar's. In dark mode the panel used
          // to be slate-900 beside a slate-900 sidebar, so the two merged into
          // one dark slab. A rose surface separates by HUE as well as by
          // lightness, which survives both themes.
          className="w-[250px] max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl overflow-hidden
                     bg-rose-50/95 dark:bg-rose-950
                     ring-1 ring-rose-300/80 dark:ring-rose-400/30
                     shadow-[0_22px_60px_rgba(136,19,55,.35)]
                     animate-[fadeSlideIn_.14s_ease-out] origin-left"
        >
          <div className="px-4 py-2.5 flex items-center gap-2
                          bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white">
            <Icon name={item.icon} size={15} />
            <span className="text-[13px] font-bold">{item.label}</span>
          </div>

          <div className="py-1 divide-y divide-rose-100 dark:divide-rose-900/60">
            {kids.map((child) => (
              <NavLink
                key={child.key}
                to={child.path}
                end
                onClick={() => { setOpenKey(null); onNavigate?.(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold transition-colors
                   ${isActive
                     ? "bg-rose-600 text-white"
                     : "text-rose-950 hover:bg-white dark:text-rose-100 dark:hover:bg-rose-900 dark:hover:text-white"
                   }`
                }
              >
                <span className="whitespace-nowrap">{child.label}</span>
                <Icons.ChevronRight size={13} className="ml-auto shrink-0 opacity-50" />
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const dispatch         = useDispatch();
  const collapsedPref    = useSelector(selectSidebarCollapsed);
  // On mobile the sidebar is a full drawer — never icon-collapsed.
  const [isMobile, setIsMobile] = useState(false);
  // Brand logo from /public/logo.jpeg; falls back to the icon if it won't load.
  const [logoOk, setLogoOk] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const collapsed        = isMobile ? false : collapsedPref;
  // Sidebar-only dark theme: the `dark` class goes on the <aside> below, so every
  // `dark:` variant in this file resolves inside the sidebar and nowhere else.
  const darkMode         = useSelector(selectDarkMode);
  // Which section's flyout is open. Held here rather than inside each item so
  // opening one closes the others without them having to know about each other.
  const [openFlyout, setOpenFlyout] = useState(null);
  // True once the user opens any expandable section — used to drop the Dashboard
  // highlight so two items aren't shown "selected" at the same time.
  // Dashboard recedes while a section's flyout is open, so the open panel is
  // clearly where attention is.
  const anyExpanded      = Boolean(openFlyout);
  const userRole         = useSelector(selectUserRole);
  const user             = useSelector(selectUser);
  const permissions      = useSelector(selectUserPermissions);
  const initials         = user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  // Brand shown at the top of the sidebar. For a school user it's their own
  // school's name + logo; the Super Admin (no school) sees the platform brand.
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const brandName    = (!isSuperAdmin && user?.schoolName) || "GlobalSchoolMitra";
  const brandLogo    = (!isSuperAdmin && user?.schoolLogo) || logo;

  // Logout: best-effort revoke the refresh token server-side, then clear all
  // client auth state (Redux + localStorage via the logout reducer) and bounce
  // to the login screen.
  const handleLogout = () => {
    // Best-effort server-side token revoke — fire-and-forget so a slow/failed
    // network call can never block the actual logout.
    let refreshToken;
    try { ({ refreshToken } = JSON.parse(localStorage.getItem("erp_auth") || "{}")); } catch { /* ignore */ }
    apiClient.post("/auth/logout", { refreshToken }).catch(() => {});

    // Clear all client auth state (Redux + localStorage), then hard-redirect to
    // the login screen. A full reload guarantees we leave the protected area and
    // no in-memory route guard can bounce us back.
    dispatch(logout());
    window.location.assign("/login");
  };

  // Filter nav items the user can see
  const filteredNav = routeConfig.filter((item) => {
    // Hidden sections are kept routable but never shown in the sidebar.
    if (item.hidden) return false;
    // Super Admin manages the SaaS platform only — show just the "Platform"
    // section, not the school-operational modules (many of which also list
    // SUPER_ADMIN in their roles).
    if (userRole === "SUPER_ADMIN") return item.key === "platform";
    if (item.roles && item.roles.length > 0) {
      if (!userRole) return false;
      if (!item.roles.includes(userRole)) return false;
    }
    // Designation-privilege gating: a user with a designation only sees the
    // sections their privileges grant (admin roles & unmapped sections pass).
    return canAccessSection(item.key, permissions, userRole);
  });

  // Explicit sidebar ordering: core school modules pinned right under Dashboard,
  // and the generic/utility modules pushed to the bottom. Anything not listed
  // keeps its original routeConfig order, placed in between.
  const HEAD_ORDER = ["dashboard", "student360", "admission", "students", "class-management", "employee", "leave", "salary", "fee-management", "payments", "attendance", "timetable", "exams", "result-management", "certificate", "parents", "library"];
  const TAIL_ORDER = ["tasks", "house", "inventory", "license"];
  const weightFor = (item, idx) => {
    const head = HEAD_ORDER.indexOf(item.key);
    if (head !== -1) return head;                       // 0..5  → top
    const tail = TAIL_ORDER.indexOf(item.key);
    if (tail !== -1) return 10000 + tail;               // bottom, in given order
    return 1000 + idx;                                  // middle, preserve original order
  };
  const visibleNav = filteredNav
    .map((item, idx) => ({ item, w: weightFor(item, idx) }))
    .sort((a, b) => a.w - b.w)
    .map((x) => x.item);

  return (
    // Expanded width is content-driven (w-max): the sidebar grows to fit the
    // longest menu/submenu label instead of clipping it, bounded 216–280px so
    // it stays roughly as wide as the top bar's menu-button + brand block.
    // 280 is the floor that still fits the longest submenu label on one line
    // ("All Student Daily Attendance"); below it the nav gains an x-scrollbar.
    <aside
      className={`
        ${/* `dark` marks the subtree; Tailwind's class strategy is a descendant
             selector, so the <aside>'s own colours are set explicitly here. */
           darkMode ? "dark bg-slate-900 border-slate-800" : "bg-white border-slate-200"}
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col shrink-0
        border-r shadow-sm
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[58px]" : "w-max min-w-[216px] max-w-[280px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* ── Brand + menu toggle ──────────────────────────────────────── */}
      {/* Both live inside the sidebar so no top bar is needed and the page keeps
          its full height. */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {logoOk ? (
              <img src={brandLogo} alt={brandName}
                onError={() => setLogoOk(false)}
                className="w-8 h-8 rounded-xl object-contain bg-white shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <Icons.GraduationCap size={16} className="text-white" />
              </div>
            )}
            <span className="text-slate-900 dark:text-white font-bold text-[14px] tracking-wide truncate">{brandName}</span>
          </div>
        )}
        {collapsed && (
          logoOk ? (
            <img src={brandLogo} alt={brandName}
              onError={() => setLogoOk(false)}
              className="w-8 h-8 rounded-xl object-contain bg-white mx-auto" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto">
              <Icons.GraduationCap size={16} className="text-white" />
            </div>
          )
        )}
        {/* Open → red X closes the sidebar. */}
        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:inline-flex text-red-600 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 shrink-0"
            title="Close menu"
            aria-label="Close menu"
          >
            <Icons.X size={18} />
          </button>
        )}
      </div>

      {/* Closed → hamburger re-opens it. */}
      {collapsed && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center py-2.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-slate-300 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-800"
          title="Open menu"
          aria-label="Open menu"
        >
          <Icons.Menu size={20} />
        </button>
      )}

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">MAIN</p>
        )}

        {visibleNav.map((item) =>
          item.children ? (
            <NavParent key={item.key} item={item} collapsed={collapsed} onNavigate={onMobileClose}
                       openKey={openFlyout} setOpenKey={setOpenFlyout} />
          ) : (
            <NavLeaf
              key={item.key}
              item={item}
              collapsed={collapsed}
              onNavigate={onMobileClose}
              dim={item.key === "dashboard" && anyExpanded}
            />
          )
        )}
      </nav>

      {/* ── Profile + Logout ─────────────────────────────────────────── */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <NavLink to="/account/profile" title={user?.name || "My Profile"}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </NavLink>
            <ThemeToggle dark={darkMode} onToggle={() => dispatch(toggleDarkMode())} />
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors">
              <Icons.LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Profile — moved here from the top-right corner */}
            <NavLink to="/account/profile" onClick={onMobileClose}
              className="flex-1 min-w-0 flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.role || ""}</p>
              </div>
            </NavLink>
            <ThemeToggle dark={darkMode} onToggle={() => dispatch(toggleDarkMode())} />
            <button onClick={handleLogout} title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors shrink-0">
              <Icons.LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
