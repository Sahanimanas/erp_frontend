/**
 * _QuickActions.jsx — the grid (apps) dropdown
 * ─────────────────────────────────────────────────────────────────────────────
 * Six shortcuts in a 2-column grid, matching the genixPay apps panel.
 *
 * Every `to` below was checked against routeConfig.js — the app is live for 20
 * schools, so a shortcut that 404s is worse than no shortcut. A tile with no
 * real route must be given `to: null`, which renders it disabled rather than
 * guessing a path.
 */
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  IndianRupee,
  CalendarClock,
  MonitorPlay,
  AlertCircle,
  FileText,
} from "lucide-react";
import { FOCUS_RING } from "./_IconButton";

// Labels are split across two lines in the reference, so they are stored as a
// pair instead of relying on where the box happens to wrap.
// `tint` is the icon chip's gradient. Six identical grey glyphs were hard to
// tell apart at a glance; a colour per action makes the grid scannable without
// anyone having to read the labels.
const ACTIONS = [
  { l1: "Student",   l2: "Admission",   icon: UserPlus,      to: "/admission/new",      tint: "from-indigo-500 to-violet-600" },
  { l1: "Salary",    l2: "Payment",     icon: IndianRupee,   to: "/salary/pay",         tint: "from-emerald-500 to-teal-600" },
  { l1: "Leave",     l2: "Application", icon: CalendarClock, to: "/leave/apply",        tint: "from-sky-500 to-cyan-600" },
  { l1: "Live Class",l2: "Rooms",       icon: MonitorPlay,   to: "/live/list",          tint: "from-fuchsia-500 to-purple-600" },
  { l1: "Due Fees",  l2: "Invoice",     icon: AlertCircle,   to: "/fees/due-invoice",   tint: "from-amber-500 to-orange-600" },
  { l1: "Fees Pay",  l2: "/ Invoice",   icon: FileText,      to: "/fees/pay-invoice",   tint: "from-rose-500 to-red-600" },
];

export default function QuickActions({ id, onNavigate }) {
  const navigate = useNavigate();

  const go = (to) => {
    navigate(to);
    onNavigate?.();
  };

  return (
    <div
      id={id}
      role="menu"
      aria-label="Quick actions"
      // Clamped to the viewport so the 420px panel cannot push the page sideways
      // on a phone; `right-0` keeps it inside the bar on small screens.
      className="absolute left-0 top-[56px] z-50 w-[420px] max-w-[calc(100vw-1.5rem)] overflow-hidden
                 rounded-[6px] border border-slate-200 bg-white
                 shadow-[0_12px_40px_rgba(16,24,40,0.18)]
                 animate-[fadeSlideIn_0.16s_ease-out] origin-top-left"
    >
      {/* A titled strip tells you what the grid is before you read six labels. */}
      <div className="bg-gradient-to-r from-[var(--erp-primary)] to-[var(--erp-primary-dk)] px-4 py-2.5">
        <p className="text-[12px] font-semibold tracking-wide text-white">Quick Actions</p>
      </div>

      <div className="grid grid-cols-2">
        {ACTIONS.map(({ l1, l2, icon: Icon, to, tint }, i) => {
          const disabled = !to;
          return (
            <button
              key={`${l1}-${l2}`}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={disabled ? undefined : () => go(to)}
              title={disabled ? "Not available yet" : `${l1} ${l2}`}
              className={[
                "group flex flex-col items-center gap-2.5 px-4 py-5 text-center transition-colors duration-150",
                // Hairlines between cells instead of per-cell borders, so the
                // grid reads as one block (2 columns ⇒ right border on evens).
                i % 2 === 0 ? "border-r border-slate-100" : "",
                i < ACTIONS.length - 2 ? "border-b border-slate-100" : "",
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-slate-50/80 active:bg-slate-100",
                FOCUS_RING,
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-xl text-white",
                  "bg-gradient-to-br", tint,
                  "shadow-[0_4px_12px_rgba(16,24,40,0.18)]",
                  "transition-transform duration-200 ease-out",
                  disabled ? "grayscale" : "group-hover:-translate-y-0.5 group-hover:scale-[1.08]",
                ].join(" ")}
              >
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <span className="text-[12px] font-semibold leading-tight text-slate-700">
                {l1}
                <br />
                {l2}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
