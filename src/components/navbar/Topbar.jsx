/**
 * Topbar.jsx — Top navigation bar
 */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../../redux/slices/uiSlice";
import { markAllRead, selectNotifications } from "../../redux/slices/notificationsSlice";
import { logout } from "../../redux/slices/authSlice";
import { selectUser } from "../../redux/slices/authSlice";
import {
  Menu, Search, Bell, Moon, Sun, Calendar,
  Settings, Grid3X3, X, LogOut, User,
} from "lucide-react";

function NotifPanel({ onClose }) {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector(selectNotifications);
  const typeColor = { info:"bg-blue-500", warning:"bg-amber-500", success:"bg-emerald-500", danger:"bg-red-500" };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {unreadCount > 0 && (
            <button onClick={() => dispatch(markAllRead())} className="text-[11px] text-indigo-600 hover:underline">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
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
  const dispatch     = useSelector ? useDispatch() : null;
  const { unreadCount } = useSelector(selectNotifications);
  const user         = useSelector(selectUser);
  const [showNotif, setShowNotif]   = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "D";

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 flex items-center px-4 gap-3 shrink-0 relative z-30">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Desktop icon buttons */}
      <div className="hidden sm:flex items-center gap-1">
        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Menu size={15} />
        </button>
        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Grid3X3 size={15} />
        </button>
      </div>

      {/* Search */}
      <div className={`relative transition-all duration-200 ${searchFocus ? "flex-1 max-w-sm" : "w-52"}`}>
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          className="w-full pl-8 pr-4 py-2 text-[12.5px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder-slate-400"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Date chip */}
        <div className="hidden md:flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold">
          <Calendar size={12} />
          <span>{today}</span>
        </div>

        <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Settings size={15} />
        </button>

        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Moon size={15} />
        </button>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
        </div>

        {/* Avatar */}
        <button className="flex items-center gap-2 ml-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold">
            {initials}
          </div>
          <span className="hidden md:block text-[12px] font-medium text-slate-700">{user?.name ?? "Demo"}</span>
        </button>
      </div>
    </header>
  );
}
