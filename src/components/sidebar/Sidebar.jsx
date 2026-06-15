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
import { selectUserRole, selectUser, logout } from "../../redux/slices/authSlice";
import { routeConfig } from "../../routes/routeConfig";
import apiClient from "../../services/axios";
import * as Icons from "lucide-react";
import logo from "../../../public/logo.jpeg"
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
        return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group border-t
         ${active
           ? "bg-emerald-500/20 text-white font-bold border-emerald-400"
           : "text-white hover:bg-white/10 border-white/20 hover:border-white/40"
         }`;
      }}
      title={collapsed ? item.label : undefined}
    >
      <span className="flex-shrink-0">
        <Icon name={item.icon} size={16} />
      </span>
      {!collapsed && (
        <span className="text-[12.5px] font-medium truncate flex-1">{item.label}</span>
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
        onClick={() => !collapsed && dispatch(toggleSection(item.key))}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left border-t
          ${isExpanded || isParentActive
            ? "bg-emerald-500/20 text-white font-bold border-emerald-400"
            : "text-white hover:bg-white/10 border-white/20 hover:border-white/40"
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        <span className="flex-shrink-0">
          <Icon name={item.icon} size={16} />
        </span>
        {!collapsed && (
          <>
            <span className="text-[12.5px] font-medium truncate flex-1">{item.label}</span>
            <span
              className="transition-transform duration-200 flex-shrink-0"
              style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}
            >
              <Icons.ChevronDown size={13} />
            </span>
          </>
        )}
      </button>

      {/* Children (animated height) */}
      {!collapsed && (
        <div
          className="overflow-hidden transition-all duration-200"
          style={{ maxHeight: isExpanded ? `${item.children.length * 40}px` : "0px" }}
        >
          {/* Open submenu panel: white background, full sidebar width (bleeds past nav padding) */}
          <div className="-mx-2 mt-1 bg-white p-1.5 space-y-0.5 shadow-sm">
            {item.children
              .filter((c) => !c.hidden)
              .map((child) => (
                <NavLink
                  key={child.key}
                  to={child.path}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all duration-150
                     ${isActive
                       ? "bg-emerald-100 text-emerald-700 font-bold"
                       : "text-slate-700 hover:bg-slate-100"
                     }`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                  <span className="truncate">{child.label}</span>
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
  // Brand logo from /public/logo.png; falls back to the icon if not present.
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
    if (!item.roles || item.roles.length === 0) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  // Explicit sidebar ordering: core school modules pinned right under Dashboard,
  // and the generic/utility modules pushed to the bottom. Anything not listed
  // keeps its original routeConfig order, placed in between.
  const HEAD_ORDER = ["dashboard", "students", "employee", "admission", "fee-management", "payments", "attendance", "exams"];
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
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col shrink-0
        bg-gray-900 border-r-4 border-white/10
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[52px]" : "w-[220px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-white/10 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {logoOk ? (
              <img src={brandLogo} alt={brandName}
                onError={() => setLogoOk(false)}
                className="w-8 h-8 rounded-xl object-contain bg-white shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <Icons.GraduationCap size={16} className="text-white" />
              </div>
            )}
            <span className="text-white font-bold text-[13px] tracking-wide truncate">{brandName}</span>
          </div>
        )}
        {collapsed && (
          logoOk ? (
            <img src={brandLogo} alt={brandName}
              onError={() => setLogoOk(false)}
              className="w-8 h-8 rounded-xl object-contain bg-white mx-auto" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto">
              <Icons.GraduationCap size={16} className="text-white" />
            </div>
          )
        )}
        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:inline-flex text-slate-200 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            title="Collapse sidebar"
          >
            <Icons.PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center py-2 text-slate-200 hover:text-white transition-colors"
        >
          <Icons.PanelLeftOpen size={15} />
        </button>
      )}

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {!collapsed && (
          <p className="text-[9px] font-bold text-slate-200 uppercase tracking-widest px-3 mb-2">MAIN</p>
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
      <div className="p-2 border-t border-white/10 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <NavLink to="/account/profile" title={user?.name || "My Profile"}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </NavLink>
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg text-slate-200 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Icons.LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Profile — moved here from the top-right corner */}
            <NavLink to="/account/profile" onClick={onMobileClose}
              className="flex-1 min-w-0 flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-semibold text-white truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-200 truncate">{user?.role || ""}</p>
              </div>
            </NavLink>
            <button onClick={handleLogout} title="Logout"
              className="p-2 rounded-lg text-slate-200 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
              <Icons.LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
