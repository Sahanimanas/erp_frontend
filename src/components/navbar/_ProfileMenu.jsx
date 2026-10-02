/**
 * _ProfileMenu.jsx — the avatar dropdown
 * ─────────────────────────────────────────────────────────────────────────────
 * Header (photo tile + email + role + red logout) over a vertical menu list,
 * matching the genixPay profile panel.
 *
 * Both logout controls go through the same handler so the header button and the
 * list row can never drift apart.
 */
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, School, LogOut } from "lucide-react";
import { PhotoTile, FOCUS_RING } from "./_IconButton";

/**
 * Roles are stored as enum strings ("SCHOOL_ADMIN"); the bar shows them to a
 * human, so underscores become spaces and each word is title-cased.
 */
function roleLabel(role) {
  if (!role || typeof role !== "string") return "User";
  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// `to: null` ⇒ no route exists for this item, so it renders disabled.
// Mailbox has no page in routeConfig.js — the only mail route is
// /communication/email, which is an admin-only *compose* screen, not an inbox.
const ITEMS = [
  { label: "Profile",         icon: User,   to: "/account/profile" },
  { label: "Reset Password",  icon: Lock,   to: "/account/password" },
  { label: "Mailbox",         icon: Mail,   to: null },
  { divider: true },
  { label: "School Settings", icon: School, to: "/settings/school" },
  { divider: true },
  { label: "Logout",          icon: LogOut, action: "logout" },
];

export default function ProfileMenu({ id, user, onNavigate, onLogout }) {
  const navigate = useNavigate();

  const go = (to) => {
    navigate(to);
    onNavigate?.();
  };

  return (
    <div
      id={id}
      role="menu"
      aria-label="Account"
      className="absolute right-0 top-[56px] z-50 w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden
                 rounded-[6px] border border-slate-200 bg-white
                 shadow-[0_12px_40px_rgba(16,24,40,0.18)]
                 animate-[fadeSlideIn_0.16s_ease-out] origin-top-right"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-gradient-to-br from-[var(--erp-primary)] to-[var(--erp-primary-dk)] p-4">
        <PhotoTile src={user?.photo ?? user?.avatar} size={68} alt={user?.name ?? "User"} />

        <div className="min-w-0 flex-1">
          {/* `break-words` because a long tenant email must wrap, not widen the panel. */}
          <p className="break-words text-[14px] font-semibold leading-snug text-white">
            {user?.email ?? user?.name ?? "Signed in"}
          </p>
          <p className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
            {roleLabel(user?.role)}
          </p>

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-[4px] bg-gradient-to-br from-red-500 to-red-600
                        px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_3px_10px_rgba(220,38,38,0.4)]
                        transition-transform duration-150 hover:-translate-y-[1px] active:translate-y-0 ${FOCUS_RING}`}
          >
            <LogOut size={13} strokeWidth={2} />
            Logout
          </button>
        </div>
      </div>

      {/* ── Menu list ──────────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 py-1">
        {ITEMS.map((item, i) => {
          if (item.divider) {
            return <div key={`d${i}`} className="my-1 border-t border-slate-100" />;
          }

          const { label, icon: Icon, to, action } = item;
          const isLogout = action === "logout";
          const disabled = !to && !isLogout;

          return (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={isLogout ? onLogout : disabled ? undefined : () => go(to)}
              title={disabled ? "Not available yet" : label}
              className={[
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors",
                disabled
                  ? "cursor-not-allowed text-slate-400 opacity-60"
                  : isLogout
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50",
                FOCUS_RING,
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={1.75} className="shrink-0" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
