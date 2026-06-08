/**
 * _attShared.jsx — shared bits for the Attendance module pages.
 */
import { Badge } from "../../components/ui";

export const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"];

export const STATUS_VARIANT = {
  PRESENT: "success",
  ABSENT: "danger",
  LATE: "warning",
  LEAVE: "info",
  HALF_DAY: "purple",
};

export function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-300 text-[11px]">— not marked —</span>;
  return <Badge variant={STATUS_VARIANT[status] ?? "default"} dot>{status.replace("_", " ")}</Badge>;
}

/** Segmented status picker used inside marking grids. */
export function StatusPicker({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onChange(s)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
            value === s
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {s.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}

export const today = () => new Date().toISOString().slice(0, 10);

/** Download an array of row-objects as CSV. */
export function exportCsv(filename, rows, columns) {
  if (!rows?.length) return;
  const head = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((r) => columns.map((c) => `"${String(c.get(r) ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
