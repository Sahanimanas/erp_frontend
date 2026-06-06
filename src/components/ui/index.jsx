/**
 * components/ui/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete reusable component library for the ERP.
 * Import from this file everywhere:
 *   import { Button, Card, Badge, DataTable, PageHeader } from "../../components/ui";
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────────────────────────────────────
export function Button({
  children, variant = "primary", size = "md",
  className = "", loading = false, icon, ...props
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none";
  const variants = {
    primary:   "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
    ghost:     "hover:bg-slate-100 text-slate-600",
    danger:    "bg-red-600 hover:bg-red-700 text-white",
    success:   "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline:   "border border-indigo-300 text-indigo-600 hover:bg-indigo-50",
    warning:   "bg-amber-500 hover:bg-amber-600 text-white",
  };
  const sizes = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "default", dot = false }) {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100  text-amber-700",
    danger:  "bg-red-100    text-red-700",
    info:    "bg-blue-100   text-blue-700",
    purple:  "bg-violet-100 text-violet-700",
    indigo:  "bg-indigo-100 text-indigo-700",
    cyan:    "bg-cyan-100   text-cyan-700",
  };
  const dotColors = {
    default: "bg-slate-500", success: "bg-emerald-500", warning: "bg-amber-500",
    danger: "bg-red-500", info: "bg-blue-500", purple: "bg-violet-500",
    indigo: "bg-indigo-500", cyan: "bg-cyan-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", title, subtitle, action, noPadding = false }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex gap-2">{action}</div>}
        </div>
      )}
      {noPadding ? children : <div>{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, gradient, change, sparkData = [] }) {
  const isPos = change >= 0;
  const maxSp = Math.max(...sparkData, 1);
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow group cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px] text-slate-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}>
          {Icon && <Icon size={19} className="text-white" />}
        </div>
      </div>
      {change !== undefined && (
        <p className={`text-[10px] font-semibold ${isPos ? "text-emerald-600" : "text-red-500"}`}>
          {isPos ? "▲" : "▼"} {Math.abs(change)}%
          <span className="text-slate-400 font-normal"> vs last month</span>
        </p>
      )}
      {sparkData.length > 0 && (
        <div className="flex items-end gap-0.5 h-6 mt-2">
          {sparkData.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-indigo-100 group-hover:bg-indigo-300 transition-colors"
              style={{ height: `${Math.max(2, (v / maxSp) * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, icon, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[15px] font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = "", icon, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[11px] font-semibold text-slate-600">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        )}
        <input
          className={`
            w-full px-3 py-2 text-sm border rounded-lg
            focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
            transition-all placeholder-slate-400 text-slate-700
            ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}
            ${icon ? "pl-9" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────────────────────────────────────
export function Select({ label, options = [], error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[11px] font-semibold text-slate-600">{label}</label>}
      <select
        className={`
          w-full px-3 py-2 text-sm border rounded-lg bg-white
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all text-slate-700
          ${error ? "border-red-400" : "border-slate-200 hover:border-slate-300"}
          ${className}
        `}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = "", rows = 3, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[11px] font-semibold text-slate-600">{label}</label>}
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg resize-none
          focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all placeholder-slate-400 text-slate-700
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────
export function DataTable({ columns = [], data = [], loading = false, emptyText = "No data available" }) {
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : data;

  if (loading) return (
    <div className="p-4 space-y-2.5 animate-pulse">
      {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`
                  px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider
                  ${col.sortable !== false ? "cursor-pointer select-none hover:text-slate-700" : ""}
                  ${col.width ? `w-${col.width}` : ""}
                `}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortKey === col.key && (
                    sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            sorted.map((row, ri) => (
              <tr key={row.id ?? ri} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 text-[12.5px]">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
export function Pagination({ page, total, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
      <span className="text-[11px] text-slate-500">
        Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {start > 1 && <span className="text-[11px] text-slate-400 px-1">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`
              w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors
              ${p === page ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}
            `}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="text-[11px] text-slate-400 px-1">…</span>}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME BANNER
// ─────────────────────────────────────────────────────────────────────────────
export function WelcomeBanner({ name = "Demo" }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white px-6 py-5 mb-6">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute right-16 -bottom-10 w-44 h-44 rounded-full bg-white/5" />
      <div className="absolute right-4 top-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold">Welcome, {name} 👋</h2>
          <p className="text-indigo-200 text-[12px] mt-1">Today is {today}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-xl">
          <span className="text-[12px] font-semibold">
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH INPUT
// ─────────────────────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white transition-all placeholder-slate-400"
      />
      {value && (
        <button onClick={() => onChange({ target: { value: "" } })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = "indigo", height = "h-2", label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    indigo:  "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber:   "bg-amber-500",
    red:     "bg-red-500",
    cyan:    "bg-cyan-500",
  };
  return (
    <div>
      {label && (
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] ?? "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
export function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all
            ${active === tab.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────────────────────
export function Avatar({ name = "", src, size = "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" };
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials || "?"}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CARDS ROW (grid of colored mini-cards)
// ─────────────────────────────────────────────────────────────────────────────
export function SummaryCards({ cards = [] }) {
  const palettes = [
    { bg: "bg-indigo-50", text: "text-indigo-600" },
    { bg: "bg-emerald-50", text: "text-emerald-600" },
    { bg: "bg-red-50", text: "text-red-500" },
    { bg: "bg-amber-50", text: "text-amber-600" },
    { bg: "bg-violet-50", text: "text-violet-600" },
    { bg: "bg-cyan-50", text: "text-cyan-600" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((c, i) => {
        const pal = palettes[i % palettes.length];
        return (
          <div key={c.label} className={`rounded-xl p-4 ${c.bg ?? pal.bg}`}>
            <p className={`text-xl font-bold ${c.text ?? pal.text}`}>
              {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE TOOLBAR (search + filters row above a table)
// ─────────────────────────────────────────────────────────────────────────────
export function TableToolbar({ children }) {
  return (
    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end">
      {children}
    </div>
  );
}
