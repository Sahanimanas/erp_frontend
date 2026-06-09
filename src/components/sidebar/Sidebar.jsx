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
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSidebarCollapsed, selectExpandedSections,
  toggleSidebar, toggleSection, openSection,
} from "../../redux/slices/uiSlice";
import { selectUserRole, logout } from "../../redux/slices/authSlice";
import { routeConfig } from "../../routes/routeConfig";
import apiClient from "../../services/axios";
import * as Icons from "lucide-react";

// ─── Icon resolver ─────────────────────────────────────────────────────────
function Icon({ name, size = 16, className = "" }) {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} />;
}

// ─── Nav leaf item (link) ──────────────────────────────────────────────────
function NavLeaf({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
         ${isActive
           ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/25"
           : "text-slate-400 hover:text-white hover:bg-white/5"
         }`
      }
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
function NavParent({ item, collapsed }) {
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
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left
          ${isExpanded || isParentActive
            ? "bg-indigo-600/15 text-indigo-300"
            : "text-slate-400 hover:text-white hover:bg-white/5"
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
          <div className="ml-4 mt-1 border-l border-slate-700/40 pl-3 space-y-0.5 pb-1">
            {item.children
              .filter((c) => !c.hidden)
              .map((child) => (
                <NavLink
                  key={child.key}
                  to={child.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-[11.5px] transition-all duration-150
                     ${isActive
                       ? "bg-indigo-600 text-white font-semibold"
                       : "text-slate-500 hover:text-white hover:bg-white/5"
                     }`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
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
  const collapsed        = useSelector(selectSidebarCollapsed);
  const userRole         = useSelector(selectUserRole);

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
  const HEAD_ORDER = ["dashboard", "students", "employee", "admission", "attendance", "fee-management", "payments", "exams"];
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
        bg-[#0f172a] border-r border-slate-800/50
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[52px]" : "w-[220px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-800/50 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
              <Icons.GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-[13px] tracking-wide">GlobalSchoolMitra</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Pro</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto">
            <Icons.GraduationCap size={16} className="text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
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
          className="flex items-center justify-center py-2 text-slate-500 hover:text-white transition-colors"
        >
          <Icons.PanelLeftOpen size={15} />
        </button>
      )}

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {!collapsed && (
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">MAIN</p>
        )}

        {visibleNav.map((item) =>
          item.children ? (
            <NavParent key={item.key} item={item} collapsed={collapsed} />
          ) : (
            <NavLeaf key={item.key} item={item} collapsed={collapsed} />
          )
        )}
      </nav>

      {/* ── Logout ───────────────────────────────────────────────────── */}
      <div className="p-2 border-t border-slate-800/50 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          title={collapsed ? "Logout" : undefined}
        >
          <Icons.LogOut size={16} />
          {!collapsed && <span className="text-[12.5px] font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
