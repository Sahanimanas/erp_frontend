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
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSidebarCollapsed, selectExpandedSections,
  toggleSidebar, toggleSection, openSection,
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
           : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200"
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

// ─── Nav parent item (expandable) ─────────────────────────────────────────
function NavParent({ item, collapsed, onNavigate }) {
  const dispatch         = useDispatch();
  const location         = useLocation();
  const expandedSections = useSelector(selectExpandedSections);
  const isExpanded       = expandedSections.includes(item.key);
  const isParentActive   = item.children?.some((c) => location.pathname.startsWith(c.path));

  // Auto-expand if a child route is active
  useEffect(() => {
    if (isParentActive && !expandedSections.includes(item.key)) {
      dispatch(openSection(item.key));
    }
  }, [location.pathname]); // eslint-disable-line

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={() => {
          // Collapsed the submenu has nowhere to render, so a click here used to
          // do nothing at all — leaving every section unreachable while the menu
          // was closed. Re-open the sidebar and expand this section instead.
          if (collapsed) {
            dispatch(toggleSidebar());
            dispatch(openSection(item.key));
            return;
          }
          dispatch(toggleSection(item.key));
        }}
        className={`
          w-full flex items-center py-2.5 rounded-lg transition-all duration-150 text-left border-t
          ${collapsed ? "justify-center px-0" : "gap-3.5 px-3.5"}
          ${isExpanded || isParentActive
            ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white font-bold border-indigo-500 shadow-sm"
            : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200"
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <span className="flex-shrink-0">
          <Icon name={item.icon} size={18} />
        </span>
        {!collapsed && (
          <>
            <span className="text-[14px] font-bold grow whitespace-nowrap">{item.label}</span>
            <span
              className="transition-transform duration-200 flex-shrink-0"
              style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
            >
              <Icons.ChevronDown size={15} />
            </span>
          </>
        )}
      </button>

      {/* Children (animated height) */}
      {!collapsed && (
        // 36px per flush menu row, plus 16px for the panel's own margin,
        // padding and borders, or the last item clips.
        <div
          className="overflow-hidden transition-all duration-200"
          style={{ maxHeight: isExpanded ? `${item.children.length * 36 + 16}px` : "0px" }}
        >
          {/* Open submenu: flat desktop-menu style — one shaded panel, rows
              flush against each other with no pills, borders or gaps. The row
              itself is the hover/active target, edge to edge. */}
          <div className="-mx-2.5 mt-1 bg-indigo-50 border-y border-indigo-100 py-1">
            {item.children
              .filter((c) => !c.hidden)
              .map((child) => (
                <NavLink
                  key={child.key}
                  to={child.path}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 pl-6 pr-3 py-2 text-[13.5px] font-bold transition-colors duration-100
                     ${isActive
                       ? "bg-indigo-600 text-white"
                       : "text-slate-700 hover:bg-indigo-100 hover:text-indigo-800"
                     }`
                  }
                >
                  <span className="whitespace-nowrap">{child.label}</span>
                  <Icons.ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />
                </NavLink>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar root ─────────────────────────────────────────────────────────
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
  const expandedSections = useSelector(selectExpandedSections);
  // True once the user opens any expandable section — used to drop the Dashboard
  // highlight so two items aren't shown "selected" at the same time.
  const anyExpanded      = expandedSections.length > 0;
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
  const HEAD_ORDER = ["dashboard", "students", "employee", "admission", "fee-management", "payments", "attendance", "timetable", "exams", "result-management", "certificate", "parents", "library"];
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
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col shrink-0
        bg-white border-r border-slate-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[58px]" : "w-max min-w-[216px] max-w-[280px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* ── Brand + menu toggle ──────────────────────────────────────── */}
      {/* Both live inside the sidebar so no top bar is needed and the page keeps
          its full height. */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-200 shrink-0">
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
            <span className="text-slate-900 font-bold text-[14px] tracking-wide truncate">{brandName}</span>
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
            className="hidden lg:inline-flex text-red-600 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50 shrink-0"
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
          className="flex items-center justify-center py-2.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors border-b border-slate-200"
          title="Open menu"
          aria-label="Open menu"
        >
          <Icons.Menu size={20} />
        </button>
      )}

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">MAIN</p>
        )}

        {visibleNav.map((item) =>
          item.children ? (
            <NavParent key={item.key} item={item} collapsed={collapsed} onNavigate={onMobileClose} />
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
      <div className="p-2 border-t border-slate-200 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <NavLink to="/account/profile" title={user?.name || "My Profile"}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </NavLink>
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Icons.LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Profile — moved here from the top-right corner */}
            <NavLink to="/account/profile" onClick={onMobileClose}
              className="flex-1 min-w-0 flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || ""}</p>
              </div>
            </NavLink>
            <button onClick={handleLogout} title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
              <Icons.LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
