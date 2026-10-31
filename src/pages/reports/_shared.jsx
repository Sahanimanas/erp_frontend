/**
 * Shared pieces for the Reports module: the period picker, headline tiles,
 * a report table with Excel export + print, a ranked share list, and a bar
 * chart that always ships with a legend and a table view.
 *
 * Chart colours are the dashboard's validated pair (blue #2a78d6 / orange
 * #eb6834 on white). A chart never carries more than these two series, so
 * every other breakdown is a ranked list in a single hue.
 */
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Printer, Table2, BarChart3, AlertTriangle, Search } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Card, Button, DataTable, ExportButton } from "../../components/ui";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { printTable } from "../../utils/printPdf";

export const BLUE = "#2a78d6";
export const ORANGE = "#eb6834";

// ── Formatting ───────────────────────────────────────────────────────────────
export const money = (n) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;
export const num = (n) => Number(n || 0).toLocaleString("en-IN");
export const pctText = (n) => `${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10" → "Oct 2026" */
export const monthLabel = (ym) => {
  const [y, m] = String(ym).split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : ym;
};
/** "2026-10-05" → "05 Oct" */
export const dayLabel = (ymd) => {
  const [, m, d] = String(ymd).split("-").map(Number);
  return m ? `${String(d).padStart(2, "0")} ${MONTHS[m - 1]}` : ymd;
};

// ── Period ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();

/** The Indian school session (April → March) a date falls in. */
function sessionOf(d) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return { start: `${y}-04-01`, end: `${y + 1}-03-31`, label: `${y}-${String(y + 1).slice(2)}` };
}

export function periodPresets(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = ymd(now);
  const lmY = m === 0 ? y - 1 : y;
  const lm = m === 0 ? 11 : m - 1;
  const ses = sessionOf(now);
  const prevSes = sessionOf(new Date(Number(ses.start.slice(0, 4)) - 1, 5, 1));
  return [
    { key: "today", label: "Today", from: today, to: today },
    { key: "month", label: "This month", from: `${y}-${pad(m + 1)}-01`, to: today },
    { key: "lastmonth", label: "Last month", from: `${lmY}-${pad(lm + 1)}-01`, to: `${lmY}-${pad(lm + 1)}-${pad(lastDay(lmY, lm))}` },
    { key: "session", label: `Session ${ses.label}`, from: ses.start, to: today },
    { key: "lastsession", label: `Session ${prevSes.label}`, from: prevSes.start, to: prevSes.end },
  ];
}

/**
 * The selected period, kept in the URL (?from=&to=) so a report can be
 * bookmarked, shared, and opened from the Reports home with the same dates.
 */
export function usePeriod(defaultKey = "month") {
  const [params, setParams] = useSearchParams();
  const presets = useMemo(() => periodPresets(), []);
  const fallback = presets.find((p) => p.key === defaultKey) || presets[1];
  // A real calendar day — "2026-99-99" matches the pattern but is not a date.
  const valid = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  };
  let from = valid(params.get("from")) ? params.get("from") : fallback.from;
  let to = valid(params.get("to")) ? params.get("to") : fallback.to;
  if (from > to) ({ from, to } = fallback);
  const active = presets.find((p) => p.from === from && p.to === to)?.key ?? "custom";

  const set = (next) => {
    const p = new URLSearchParams(params);
    p.set("from", next.from);
    p.set("to", next.to);
    setParams(p, { replace: true });
  };
  return { from, to, active, presets, set, query: `from=${from}&to=${to}` };
}

// ── Class ────────────────────────────────────────────────────────────────────
/**
 * The class a report is narrowed to, kept in the URL (?classId=) beside the
 * period, so a link from the Reports home opens a report on the same class.
 * "" is the whole school; a class that no longer exists falls back to it.
 */
export function useReportClass() {
  const [params, setParams] = useSearchParams();
  const { data: classes = [] } = useGetClassesQuery();
  const raw = params.get("classId") || "";
  const classId = raw && classes.length && !classes.some((c) => c.id === raw) ? "" : raw;
  const className = classes.find((c) => c.id === classId)?.name || "";
  const set = (id) => {
    const p = new URLSearchParams(params);
    if (id) p.set("classId", id);
    else p.delete("classId");
    setParams(p, { replace: true });
  };
  return { classId, className, classes, set, query: classId ? `&classId=${classId}` : "" };
}

/** The class select for a report's filter bar. */
export function ClassSelect({ cls }) {
  return (
    <label className="text-[14px] font-bold text-[#24282e]">
      <span className="block mb-1">Class</span>
      <select value={cls.classId} onChange={(e) => cls.set(e.target.value)} aria-label="Class"
        className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none min-w-[140px]"
        style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
        <option value="">All classes</option>
        {cls.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
  );
}

/** Preset buttons + custom dates. Extra filters go in `children`. */
export function PeriodBar({ period, children, hidePresets = [] }) {
  const [draft, setDraft] = useState(null);
  const custom = draft ?? { from: period.from, to: period.to };
  const apply = () => {
    if (custom.from && custom.to && custom.from <= custom.to) {
      period.set(custom);
      setDraft(null);
    }
  };
  return (
    <Card className="mb-4">
      <div className="px-4 py-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1.5">
          {period.presets.filter((p) => !hidePresets.includes(p.key)).map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={period.active === p.key ? "primary" : "secondary"}
              onClick={() => { setDraft(null); period.set(p); }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <label className="text-[14px] font-bold text-[#24282e]">
            <span className="block mb-1">From</span>
            <input type="date" value={custom.from} max={custom.to || undefined}
              onChange={(e) => setDraft({ ...custom, from: e.target.value })}
              className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none"
              style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }} />
          </label>
          <label className="text-[14px] font-bold text-[#24282e]">
            <span className="block mb-1">To</span>
            <input type="date" value={custom.to} min={custom.from || undefined}
              onChange={(e) => setDraft({ ...custom, to: e.target.value })}
              className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none"
              style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }} />
          </label>
          {draft && <Button size="sm" onClick={apply} disabled={!custom.from || !custom.to || custom.from > custom.to}>Apply</Button>}
        </div>
        {children}
      </div>
    </Card>
  );
}

// ── Status blocks ────────────────────────────────────────────────────────────
export function ReportError({ error }) {
  if (!error) return null;
  const msg = error?.data?.error || error?.data?.message || error?.error || "Could not load this report.";
  return (
    <div className="mb-4 px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-200 flex items-center gap-2"
         style={{ borderRadius: "var(--erp-radius)" }}>
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

export function Note({ children, tone = "info" }) {
  const tones = {
    info: "bg-sky-50 border-sky-200 text-sky-900",
    warn: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`mb-4 px-4 py-2.5 text-[12.5px] border ${tones[tone]}`} style={{ borderRadius: "var(--erp-radius)" }}>
      {children}
    </div>
  );
}

// ── Headline tiles ───────────────────────────────────────────────────────────
/** A headline figure. With `to` it becomes a link to the detailed report. */
export function Kpi({ label, value, sub, tone = "var(--erp-text)", to, loading }) {
  const body = (
    <>
      <p className="text-[11px] text-slate-600 font-medium">{label}</p>
      <p className="text-[20px] font-bold mt-0.5 leading-tight" style={{ color: tone }}>
        {loading ? <span className="inline-block h-5 w-20 bg-slate-100 animate-pulse rounded" /> : value}
      </p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </>
  );
  const cls = "block bg-white px-4 py-3 h-full";
  const style = { border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" };
  return to ? (
    <Link to={to} className={`${cls} hover:shadow-sm hover:border-[var(--erp-primary)] transition-shadow`} style={style}>{body}</Link>
  ) : (
    <div className={cls} style={style}>{body}</div>
  );
}

export function KpiRow({ children, cols = 4 }) {
  const grid = { 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5", 6: "sm:grid-cols-3 lg:grid-cols-6" }[cols];
  return <div className={`grid grid-cols-2 ${grid} gap-3 mb-4`}>{children}</div>;
}

// ── Report table ─────────────────────────────────────────────────────────────
/**
 * A titled table with Excel export and print. Each column may give `value`
 * (plain value for export/print) alongside `render` (what the screen shows).
 */
export function ReportTable({
  title, subtitle, columns, rows = [], filename = "report", printTitle, printSubtitle,
  loading, emptyText = "Nothing to show for this period.", footer, searchable = false, onRowClick,
}) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    if (!searchable || !q.trim()) return rows;
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => columns.some((c) => String(c.value ? c.value(r) : r[c.key] ?? "").toLowerCase().includes(needle)));
  }, [rows, q, searchable, columns]);

  const plain = (c, r) => (c.value ? c.value(r) : r[c.key] ?? "");
  const exportColumns = columns.map((c) => ({ label: c.label, get: (r) => plain(c, r) }));
  const print = () =>
    printTable({
      title: printTitle || title,
      subtitle: printSubtitle || subtitle || "",
      columns: columns.map((c) => c.label),
      rows: shown.map((r) => columns.map((c) => {
        const v = plain(c, r);
        return c.money ? money(v) : v;
      })),
      footer: footer?.print ?? "",
    });

  const action = (
    <div className="flex items-center gap-2">
      {searchable && (
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label={`Search ${title}`}
            className="pl-7 pr-2 py-1 text-[12px] border bg-white w-40 focus:outline-none"
            style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }} />
        </div>
      )}
      <ExportButton filename={`${filename}.csv`} rows={shown} columns={exportColumns} />
      <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={print} disabled={!shown.length}>Print</Button>
    </div>
  );

  return (
    <Card title={title} subtitle={subtitle} action={action} noPadding className="mb-4">
      <DataTable
        loading={loading}
        emptyText={searchable && q ? "No match." : emptyText}
        onRowClick={onRowClick}
        columns={columns.map((c) => ({
          key: c.key,
          label: c.label,
          render: c.render
            ? (_v, r) => c.render(r)
            : c.money
              ? (_v, r) => money(plain(c, r))
              : (_v, r) => plain(c, r),
        }))}
        data={shown}
      />
      {footer && shown.length > 0 && (
        <div className="px-4 py-2.5 text-[13px] font-semibold flex flex-wrap justify-end gap-x-6 gap-y-1"
             style={{ borderTop: "1px solid var(--erp-border)", background: "#f9fafb" }}>
          {footer.items.map((f) => (
            <span key={f.label}>{f.label}: <span style={{ color: f.tone || "var(--erp-text)" }}>{f.value}</span></span>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Ranked share list ────────────────────────────────────────────────────────
/** Part-to-whole as ranked bars in one hue: name, value, share of total. */
export function ShareList({ title, subtitle, rows = [], format = money, empty = "Nothing recorded." }) {
  const total = rows.reduce((s, r) => s + Number(r.amount ?? r.count ?? 0), 0);
  return (
    <Card title={title} subtitle={subtitle} className="mb-4 h-[calc(100%-1rem)]">
      <div className="px-4 py-3 space-y-2.5">
        {rows.length === 0 && <p className="text-[13px] text-slate-500 py-4 text-center">{empty}</p>}
        {rows.map((r) => {
          const v = Number(r.amount ?? r.count ?? 0);
          const share = total ? (v / total) * 100 : 0;
          return (
            <div key={r.name}>
              <div className="flex justify-between gap-3 text-[12.5px]">
                <span className="text-slate-700 truncate">{r.name}</span>
                <span className="font-semibold text-slate-800 whitespace-nowrap">
                  {format(v)} <span className="text-slate-500 font-normal">· {share.toFixed(share < 10 ? 1 : 0)}%</span>
                </span>
              </div>
              <div className="h-1.5 mt-1 bg-slate-100 rounded-sm overflow-hidden">
                <div className="h-full rounded-sm" style={{ width: `${Math.max(share, 0.5)}%`, background: BLUE }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Bar chart ────────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit, labelFmt }) {
  if (!active || !payload?.length) return null;
  const f = unit === "money" ? money : unit === "pct" ? pctText : num;
  return (
    <div className="bg-white px-3 py-2 text-[12px] shadow-md" style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
      <p className="font-semibold text-slate-800 mb-1">{labelFmt ? labelFmt(label) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-700">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{f(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Up to two series as grouped (or stacked) bars over one axis. A legend is
 * always drawn for two series, and "View as table" swaps the plot for the
 * same numbers in rows — identity never rests on colour alone.
 */
export function BarsChart({
  title, subtitle, data = [], xKey, xFmt = (v) => v, series, unit = "money", stacked = false, height = 260,
}) {
  const [asTable, setAsTable] = useState(false);
  const f = unit === "money" ? money : unit === "pct" ? pctText : num;
  const yFmt = (v) => (unit === "money" ? (v >= 100000 ? `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`) : unit === "pct" ? `${v}%` : v);

  const action = (
    <button type="button" onClick={() => setAsTable((v) => !v)}
      className="inline-flex items-center gap-1 text-[12px] font-semibold"
      style={{ color: "var(--erp-primary)" }}>
      {asTable ? <><BarChart3 size={13} /> View as chart</> : <><Table2 size={13} /> View as table</>}
    </button>
  );

  return (
    <Card title={title} subtitle={subtitle} action={action} className="mb-4">
      {data.length === 0 ? (
        <p className="text-[13px] text-slate-500 py-10 text-center">Nothing recorded for this period.</p>
      ) : asTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: "#f4f6f9" }}>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">{" "}</th>
                {series.map((s) => <th key={s.key} className="px-4 py-2 text-right font-semibold text-slate-700">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d[xKey]} style={{ borderTop: "1px solid #eef0f3" }}>
                  <td className="px-4 py-1.5 text-slate-700">{xFmt(d[xKey])}</td>
                  {series.map((s) => <td key={s.key} className="px-4 py-1.5 text-right text-slate-800">{f(d[s.key])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-2 pt-3 pb-1">
          {series.length > 1 && (
            <div className="flex gap-4 px-3 pb-2 text-[12px] text-slate-700">
              {series.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} /> {s.name}
                </span>
              ))}
            </div>
          )}
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="#e1e0d9" strokeWidth={1} />
              <XAxis dataKey={xKey} tickFormatter={xFmt} tick={{ fontSize: 11, fill: "#596069" }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
              <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: "#596069" }} axisLine={false} tickLine={false} width={58} allowDecimals={false} />
              <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }} content={<ChartTip unit={unit} labelFmt={xFmt} />} />
              {series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} maxBarSize={26}
                     stackId={stacked ? "s" : undefined}
                     radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
                     stroke="#ffffff" strokeWidth={stacked ? 2 : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
