/**
 * _saShared.jsx — shared helpers for the Super Admin area.
 * Formatters + status/plan badges, reused across every platform page.
 */
import { Badge } from "../../components/ui";

export const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN ?? "globalschoolmitra.com";

// ── Formatters ───────────────────────────────────────────────────────────
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function formatMoney(amount, currency = "INR") {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n.toLocaleString("en-IN")}`;
  }
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Status badge (school.derivedStatus / subscription.status) ──────────────
const STATUS_MAP = {
  active:    { variant: "success", label: "Active" },
  trial:     { variant: "info",    label: "Trial" },
  expired:   { variant: "danger",  label: "Expired" },
  inactive:  { variant: "default", label: "Suspended" },
  pending:   { variant: "warning", label: "Pending" },
  cancelled: { variant: "default", label: "Cancelled" },
};

export function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const cfg = STATUS_MAP[key] ?? { variant: "default", label: status || "—" };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

// ── Plan badge ─────────────────────────────────────────────────────────────
const PLAN_MAP = {
  "free trial":  "default",
  basic:         "cyan",
  professional:  "indigo",
  enterprise:    "purple",
};

export function PlanBadge({ plan }) {
  if (!plan) return <span className="text-slate-400">—</span>;
  const variant = PLAN_MAP[String(plan).toLowerCase()] ?? "default";
  return <Badge variant={variant}>{plan}</Badge>;
}

// ── DNS / SSL status pill ──────────────────────────────────────────────────
export function DnsBadge({ status }) {
  const key = String(status || "").toUpperCase();
  const variant = key === "ACTIVE" ? "success" : key === "FAILED" ? "danger" : "warning";
  return <Badge variant={variant} dot>{key || "—"}</Badge>;
}
