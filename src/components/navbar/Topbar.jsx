/**
 * Topbar.jsx — Top navigation bar (genixPay-style)
 * ─────────────────────────────────────────────────────────────────────────────
 * Icon actions are diamonds (see _IconButton.jsx); the user tile stays square.
 *
 * All three dropdowns share ONE piece of state rather than a boolean each, so
 * "only one open at a time" is structural instead of something each handler has
 * to remember to enforce.
 */
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { markAllRead, selectNotifications } from "../../redux/slices/notificationsSlice";
import { logout, selectAuth } from "../../redux/slices/authSlice";
import {
  Menu, Calendar, X, Maximize, Minimize, LayoutGrid, Globe, Flag, Bell,
} from "lucide-react";
import { DiamondButton, PhotoTile, FOCUS_RING } from "./_IconButton";
import QuickActions from "./_QuickActions";
import ProfileMenu from "./_ProfileMenu";

function NotifPanel({ id, onClose }) {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector(selectNotifications);
  const typeColor = { info:"bg-blue-500", warning:"bg-amber-500", success:"bg-emerald-500", danger:"bg-red-500" };

  return (
    <div
      id={id}
      className="absolute right-0 top-[52px] z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-[3px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.14)]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {unreadCount > 0 && (
            <button type="button" onClick={() => dispatch(markAllRead())} className={`text-[11px] text-indigo-600 hover:underline ${FOCUS_RING}`}>
              Mark all read
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close notifications" className={`text-slate-400 hover:text-slate-600 ${FOCUS_RING}`}><X size={13} /></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
        {items.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
        )}
        {items.map((n) => (
          <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColor[n.type] ?? "bg-slate-400"}`} />
            <div className="min-w-0">
              <p className="text-[11.5px] text-slate-700 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useSelector(selectNotifications);
  const { user } = useSelector(selectAuth);

  // null | "grid" | "notif" | "profile"
  const [openMenu, setOpenMenu] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const headerRef = useRef(null);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));
  const close = () => setOpenMenu(null);

  // One listener pair for outside-click + Escape, attached only while a panel is
  // open so the bar costs nothing when idle.
  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) close();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // The user can leave fullscreen with F11/Esc without touching our button, so
  // the icon follows the document rather than our own click.
  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = () => {
    // Guarded: requestFullscreen rejects when the gesture isn't trusted, and is
    // absent in some embedded webviews.
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const handleLogout = () => {
    close();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <header
      ref={headerRef}
      className="relative z-30 flex h-[58px] shrink-0 items-center gap-2 bg-gradient-to-b from-white to-slate-50
                 px-3 shadow-[0_1px_3px_rgba(16,24,40,0.08),0_1px_0_rgba(16,24,40,0.04)] sm:px-4"
    >
      {/* ── Left cluster ─────────────────────────────────────────────────── */}
      {/* `relative` scopes the grid panel's absolute position to this cluster. */}
      <div className="relative flex shrink-0 items-center gap-2">
        <DiamondButton icon={Menu} label="Toggle menu" onClick={onMenuClick} />
        <DiamondButton
          icon={isFullscreen ? Minimize : Maximize}
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        />
        <DiamondButton
          icon={LayoutGrid}
          label="Quick actions"
          onClick={() => toggle("grid")}
          active={openMenu === "grid"}
          expanded={openMenu === "grid"}
          controls="topbar-quick-actions"
        />

        {openMenu === "grid" && (
          <QuickActions id="topbar-quick-actions" onNavigate={close} />
        )}
      </div>

      {/* ── Right cluster ────────────────────────────────────────────────── */}
      {/* No overflow-* here on purpose: a scroll container would clip the
          absolutely-positioned dropdown panels. Narrow screens instead drop the
          decorative diamonds (below), which keeps the row inside the viewport. */}
      <div className="relative ml-auto flex min-w-0 items-center gap-2">
        {/* Kept from the previous bar — the only place the date was shown.
            Hidden below xl so it never competes with the icons for width. */}
        <div className="hidden xl:flex shrink-0 items-center gap-1.5 rounded-[3px] border border-[#ddd] px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
          <Calendar size={12} />
          <span>{today}</span>
        </div>

        {/* Language and region have no implementation in this build; shown
            disabled rather than as buttons that silently do nothing. */}
        <DiamondButton icon={Globe} label="Language (not configured)" disabled className="hidden sm:inline-flex" />
        <DiamondButton icon={Calendar} label={today} disabled className="hidden sm:inline-flex" />
        <DiamondButton icon={Flag} label="Region (not configured)" disabled className="hidden md:inline-flex" />

        <DiamondButton
          icon={Bell}
          label="Notifications"
          badge={unreadCount}
          onClick={() => toggle("notif")}
          active={openMenu === "notif"}
          expanded={openMenu === "notif"}
          controls="topbar-notifications"
        />

        <span className="mx-1 h-7 w-px shrink-0 bg-slate-200" aria-hidden="true" />

        <button
          type="button"
          onClick={() => toggle("profile")}
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={openMenu === "profile"}
          aria-controls={openMenu === "profile" ? "topbar-profile" : undefined}
          className={`shrink-0 rounded-[2px] ${FOCUS_RING}`}
        >
          <PhotoTile src={user?.photo ?? user?.avatar} size={40} alt={user?.name ?? "User"} />
        </button>

        {openMenu === "notif" && (
          <NotifPanel id="topbar-notifications" onClose={close} />
        )}
        {openMenu === "profile" && (
          <ProfileMenu
            id="topbar-profile"
            user={user}
            onNavigate={close}
            onLogout={handleLogout}
          />
        )}
      </div>
    </header>
  );
}
