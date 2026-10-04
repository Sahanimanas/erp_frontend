/**
 * components/ui/index.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete reusable component library for the ERP.
 * Import from this file everywhere:
 *   import { Button, Card, Badge, DataTable, PageHeader } from "../../components/ui";
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, X, Download } from "lucide-react";
import { Loader } from "../loaders/PageLoader";

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────────────────────────────────────
export function Button({
  children, variant = "primary", size = "md",
  className = "", loading = false, icon, ...props
}) {
  // Flat solid fills with a one-step-darker border, the way the reference
  // product draws every button. Colours come from the :root tokens so a shade
  // is corrected in index.css, not here.
  const base = "inline-flex items-center justify-center gap-2 font-medium border transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none";
  const solid = (fill, border) => ({
    background: `var(${fill})`, borderColor: `var(${border})`, color: "#fff",
  });
  const variants = {
    primary:   { style: solid("--erp-primary", "--erp-primary-dk"), cls: "hover:brightness-95" },
    danger:    { style: solid("--erp-danger", "--erp-danger"),      cls: "hover:brightness-95" },
    success:   { style: solid("--erp-success", "--erp-success"),    cls: "hover:brightness-95" },
    warning:   { style: solid("--erp-warning", "--erp-warning"),    cls: "hover:brightness-95" },
    secondary: { style: { background: "#f4f4f4", borderColor: "var(--erp-border)", color: "var(--erp-text)" }, cls: "hover:bg-slate-200" },
    outline:   { style: { background: "#fff", borderColor: "var(--erp-primary)", color: "var(--erp-primary)" }, cls: "hover:bg-[var(--erp-primary-sf)]" },
    ghost:     { style: { background: "transparent", borderColor: "transparent", color: "var(--erp-muted)" }, cls: "hover:bg-slate-100" },
  };
  const sizes = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  const v = variants[variant] ?? variants.primary;
  return (
    <button
      className={`${base} ${v.cls} ${sizes[size]} ${className}`}
      style={{ borderRadius: "var(--erp-radius)", ...v.style }}
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
    // Square-ish label, not a pill — the reference product's status chips are
    // small rectangles sitting inside table cells.
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold ${variants[variant]}`}
      style={{ borderRadius: "var(--erp-radius)" }}
    >
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
    // A "panel": square-ish, hairline border, no lift. The title sits on a blue
    // rule, which is how the reference product separates a panel head from its
    // body — so the heading reads as a section, not as a floating card label.
    <div
      className={`bg-white ${className}`}
      style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}
    >
      {(title || action) && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "2px solid var(--erp-primary)" }}
        >
          <div>
            {title && <h3 className="text-[15px] font-semibold" style={{ color: "var(--erp-text)" }}>{title}</h3>}
            {subtitle && <p className="text-[12px] mt-0.5" style={{ color: "var(--erp-muted)" }}>{subtitle}</p>}
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
export function StatCard({ label, value, icon: Icon, gradient, change, sparkData = [], onClick }) {
  const isPos = change >= 0;
  const maxSp = Math.max(...sparkData, 1);
  // When `onClick` is supplied the whole card becomes a button so it's keyboard
  // reachable — otherwise it stays a plain, non-interactive div.
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button", onClick } : {})}
      className={`w-full text-left bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow group
        ${onClick ? "cursor-pointer hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px] text-slate-700 font-medium mb-1">{label}</p>
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
          <span className="text-slate-600 font-normal"> vs last month</span>
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
    </Wrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, icon, children }) {
  return (
    <div
      className="flex items-center justify-between mb-5 bg-white px-4 py-3"
      style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          // Pages pass their own icon at assorted sizes (14–20px); normalise to
          // 20px here so every page header matches without touching all ~177
          // call sites. Square tile with a hairline border, not a rounded chip.
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 [&_svg]:w-[20px] [&_svg]:h-[20px]"
            style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)", color: "var(--erp-primary)" }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[20px] leading-tight font-normal" style={{ color: "var(--erp-text)" }}>{title}</h1>
          {subtitle && <p className="text-[12.5px] mt-0.5" style={{ color: "var(--erp-muted)" }}>{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Field label in the reference product's style: normal-weight dark text above
 * the control, with a red asterisk when the field is required. `required` is a
 * native input attribute, so marking a field required also marks it visually —
 * no second prop to keep in sync.
 */
function FieldLabel({ label, required }) {
  if (!label) return null;
  return (
    <label className="block text-[13px] mb-1" style={{ color: "var(--erp-text)" }}>
      {label}
      {required && <span style={{ color: "var(--erp-danger)" }}> *</span>}
    </label>
  );
}

const fieldStyle = (error) => ({
  borderRadius: "var(--erp-radius)",
  border: `1px solid ${error ? "var(--erp-danger)" : "var(--erp-border)"}`,
  color: "var(--erp-text)",
  background: "#fff",
});

const FIELD_CLS =
  "w-full px-3 py-2 text-[13.5px] transition-colors focus:outline-none " +
  "focus:border-[var(--erp-primary)] placeholder-[var(--erp-muted)]";

export function Input({ label, error, className = "", icon, ...props }) {
  return (
    <div>
      <FieldLabel label={label} required={props.required} />
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--erp-muted)" }}>{icon}</span>
        )}
        <input
          className={`${FIELD_CLS} ${icon ? "pl-9" : ""} ${className}`}
          style={fieldStyle(error)}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] mt-1" style={{ color: "var(--erp-danger)" }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────────────────────────────────────
export function Select({ label, options = [], error, className = "", ...props }) {
  return (
    <div>
      <FieldLabel label={label} required={props.required} />
      <select
        className={`${FIELD_CLS} ${className}`}
        style={fieldStyle(error)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] mt-1" style={{ color: "var(--erp-danger)" }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = "", rows = 3, ...props }) {
  return (
    <div>
      <FieldLabel label={label} required={props.required} />
      <textarea
        rows={rows}
        className={`${FIELD_CLS} resize-none ${className}`}
        style={fieldStyle(error)}
        {...props}
      />
      {error && <p className="text-[11px] mt-1" style={{ color: "var(--erp-danger)" }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * `onRowClick` is optional: pass it and the whole row becomes the control that
 * opens the record, so a table does not need a trailing "open" button. Rows then
 * take keyboard focus and respond to Enter/Space. Omit it and the table behaves
 * exactly as before.
 */
export function DataTable({ columns = [], data = [], loading = false, emptyText = "No data available", onRowClick }) {
  const [sortKey, setSortKey]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Resolve the value a column sorts on: a custom `sortValue(row)` accessor when
  // provided (for nested/computed columns), else the raw `row[key]`.
  const sortValueFor = (col, row) => (col?.sortValue ? col.sortValue(row) : row[col?.key]);

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const col = columns.find((c) => c.key === sortKey);
        let av = sortValueFor(col, a);
        let bv = sortValueFor(col, b);
        // Push empty values to the bottom regardless of direction.
        const aEmpty = av === null || av === undefined || av === "";
        const bEmpty = bv === null || bv === undefined || bv === "";
        if (aEmpty && bEmpty) return 0;
        if (aEmpty) return 1;
        if (bEmpty) return -1;
        if (typeof av === "string" && typeof bv === "string") {
          av = av.toLowerCase(); bv = bv.toLowerCase();
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : data;

  if (loading) return <Loader minH="280px" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr style={{ background: "var(--erp-head)", borderBottom: "1px solid var(--erp-border)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`
                  px-4 py-2.5 text-left text-[12px] font-semibold text-[var(--erp-text)]
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
        <tbody className="divide-y divide-[var(--erp-border-soft)]">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-600">
                {emptyText}
              </td>
            </tr>
          ) : (
            sorted.map((row, ri) => (
              <tr
                key={row.id ?? ri}
                {...(onRowClick
                  ? {
                      onClick: () => onRowClick(row),
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick(row); }
                      },
                      tabIndex: 0,
                      role: "button",
                    }
                  : {})}
                className={`hover:bg-slate-50/70 transition-colors ${
                  onRowClick ? "cursor-pointer focus:outline-none focus:bg-indigo-50/70" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-[13px]" style={{ color: "var(--erp-text)" }}>
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
      <span className="text-[11px] text-slate-700">
        Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {start > 1 && <span className="text-[11px] text-slate-600 px-1">…</span>}
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
        {end < totalPages && <span className="text-[11px] text-slate-600 px-1">…</span>}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
export function WelcomeBanner({ name = "Demo", schoolName = "", schoolLogo = null }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  // Once logged into a school, the banner represents the institution — show the
  // school name + logo instead of the individual admin's name.
  const title = schoolName || name;
  const initials = (schoolName || name || "S").trim().charAt(0).toUpperCase();
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white px-6 py-5 mb-6">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute right-16 -bottom-10 w-44 h-44 rounded-full bg-white/5" />
      <div className="absolute right-4 top-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt={title}
              className="w-12 h-12 rounded-xl object-cover bg-white/15 border border-white/25 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold shrink-0">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-[18px] font-bold">Welcome, {title} 👋</h2>
            <p className="text-indigo-200 text-[12px] mt-1">Today is {today}</p>
          </div>
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-600 transition-colors">
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
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white transition-all placeholder-slate-400"
      />
      {value && (
        <button onClick={() => onChange({ target: { value: "" } })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600">
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
      {description && <p className="text-xs text-slate-600 max-w-xs">{description}</p>}
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
        <div className="flex justify-between text-[10px] text-slate-700 mb-1">
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
    // Underlined tabs on a white strip: the active one is marked by a blue rule
    // that lines up with the panel rules, rather than by a floating pill.
    <div className="flex bg-white" style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
      {tabs.map((tab) => {
        const on = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="px-4 py-2 text-[13px] transition-colors focus:outline-none focus:bg-[var(--erp-primary-sf)]"
            style={{
              color: on ? "var(--erp-primary)" : "var(--erp-muted)",
              borderBottom: `2px solid ${on ? "var(--erp-primary)" : "transparent"}`,
              fontWeight: on ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        );
      })}
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

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE FILTER (From / To with a clear button) — reusable across pages
// ─────────────────────────────────────────────────────────────────────────────
export function DateRangeFilter({ from, to, onChange, label = "Date" }) {
  return (
    <div className="flex items-end gap-2">
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label} From</label>
        <input
          type="date"
          value={from || ""}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label} To</label>
        <input
          type="date"
          value={to || ""}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
        />
      </div>
      {(from || to) && (
        <button
          onClick={() => onChange({ from: "", to: "" })}
          className="px-3 py-2 text-[12px] text-slate-700 hover:text-indigo-600 font-semibold"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT BUTTON — exports the given rows/columns to an Excel-friendly CSV.
//   columns: [{ label, get(row) }]  (or omit to auto-derive from row keys)
// ─────────────────────────────────────────────────────────────────────────────
// ExportButton — on click opens a modal offering "current page" vs "all data".
//   rows      : the rows currently shown (filtered current page)
//   allRows   : (optional) the full dataset already in memory
//   fetchAll  : (optional) async () => rows[] — fetch every matching record
//               (used by server-paginated pages so "all data" is truly all)
// When neither allRows nor fetchAll is supplied, "all data" falls back to rows.
export function ExportButton({ filename = "export.csv", rows = [], columns, label = "Export Excel", size = "sm", allRows, fetchAll }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const hasAllSource = typeof fetchAll === "function" || Array.isArray(allRows);

  const runExport = async (scope) => {
    let data = rows;
    if (scope === "all") {
      if (typeof fetchAll === "function") {
        setBusy(true);
        try { data = await fetchAll(); }
        catch {
          const t = await import("react-hot-toast");
          t.default.error("Could not load all data");
          setBusy(false);
          return;
        }
        setBusy(false);
      } else if (Array.isArray(allRows)) {
        data = allRows;
      }
    }
    const { exportRows, autoColumns } = await import("../../utils/exportExcel");
    const cols = columns && columns.length ? columns : autoColumns(data);
    const ok = exportRows(filename, data || [], cols);
    const t = await import("react-hot-toast");
    if (!ok) t.default.error("Nothing to export");
    else t.default.success(`Exported ${data.length} row(s)`);
    setOpen(false);
  };

  const Option = ({ scope, title, desc, loading }) => (
    <button
      type="button"
      onClick={() => runExport(scope)}
      disabled={busy}
      className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors disabled:opacity-60 flex items-center gap-3"
    >
      <Download size={16} className="text-indigo-600 shrink-0" />
      <span className="flex-1">
        <span className="block text-[13px] font-semibold text-slate-800">{loading ? "Preparing…" : title}</span>
        <span className="block text-[11px] text-slate-600">{desc}</span>
      </span>
    </button>
  );

  return (
    <>
      <Button variant="secondary" size={size} icon={<Download size={13} />} disabled={!rows || rows.length === 0} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => { if (!busy) setOpen(false); }} title="Export to Excel" size="sm">
        <div className="space-y-3">
          <p className="text-[12.5px] text-slate-700">Choose what to export to <b>{filename}</b>.</p>
          <Option scope="current" title="Export current page" desc={`Only the rows shown now (${rows.length})`} />
          <Option
            scope="all"
            loading={busy}
            title="Export all data"
            desc={hasAllSource ? "Every matching record across all pages" : `All loaded rows (${rows.length})`}
          />
        </div>
      </Modal>
    </>
  );
}
