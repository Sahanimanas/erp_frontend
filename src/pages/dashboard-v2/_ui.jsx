/**
 * Building blocks for Dashboard v2 — the reports-only dashboard.
 *
 * Look: gradient headline tiles, white rounded panels on a soft grey page.
 * Every gradient stop is a -600/-700 shade so white text on it keeps at least
 * 4.5:1 contrast (an -600 orange or emerald does not).
 *
 * Charts keep the Reports module's validated pair — blue #2a78d6 / orange
 * #eb6834 — plus a neutral grey for a third "rest" part. A chart always has a
 * legend for two or more series and a "View as table" switch, so identity
 * never rests on colour alone. Formatting and the period (kept in the URL)
 * come from the Reports module, so v2 and the classic reports agree.
 */
import { createContext, useContext, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  Printer, Search, Table2, BarChart3, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, ArrowUpRight, Info,
} from "lucide-react";
import { ExportButton } from "../../components/ui";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { printTable } from "../../utils/printPdf";
import { money, num, pctText, monthLabel, dayLabel } from "../reports/_shared";

export { money, num, pctText, fmtDate, monthLabel, dayLabel, usePeriod, periodPresets } from "../reports/_shared";

export const BLUE = "#2a78d6";
export const ORANGE = "#eb6834";
export const GREY = "#b9b8b1";

/** ₹3.1L / ₹45.2k / ₹1.2Cr — Indian short form for headline tiles. */
export function moneyShort(n) {
  const v = Math.round(Number(n || 0));
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  const fix = (x) => (x >= 100 ? Math.round(x) : Math.round(x * 10) / 10).toLocaleString("en-IN");
  if (a >= 1e7) return `${sign}₹${fix(a / 1e7)}Cr`;
  if (a >= 1e5) return `${sign}₹${fix(a / 1e5)}L`;
  if (a >= 1e3) return `${sign}₹${fix(a / 1e3)}k`;
  return `${sign}₹${a.toLocaleString("en-IN")}`;
}

// ── Class filter ─────────────────────────────────────────────────────────────
/**
 * One class filter for the whole of Dashboard v2: pick a class on any report
 * and every report that can be split by class opens on it. Remembered in this
 * browser only (a convenience); "" means the whole school.
 */
const CLASS_KEY = "gsm_v2_class";
const ClassFilter = createContext({ classId: "", setClassId: () => {}, classes: [], className: "" });

export function ClassFilterProvider({ children }) {
  const { data: classes = [] } = useGetClassesQuery();
  const [picked, setPicked] = useState(() => {
    try { return localStorage.getItem(CLASS_KEY) || ""; } catch { return ""; }
  });
  // A remembered class that no longer exists falls back to the whole school.
  const classId = picked && classes.length && !classes.some((c) => c.id === picked) ? "" : picked;
  const setClassId = (id) => {
    setPicked(id);
    try { id ? localStorage.setItem(CLASS_KEY, id) : localStorage.removeItem(CLASS_KEY); } catch { /* private mode */ }
  };
  const className = classes.find((c) => c.id === classId)?.name || "";
  return <ClassFilter.Provider value={{ classId, setClassId, classes, className }}>{children}</ClassFilter.Provider>;
}

export const useClassFilter = () => useContext(ClassFilter);

/** The shared class select, for a report's filter row. */
export function ClassPicker({ label = "Class" }) {
  const { classId, setClassId, classes } = useClassFilter();
  return (
    <Picker label={label} value={classId} onChange={setClassId} minWidth={160}
      options={[{ value: "", label: "All classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
  );
}

/** Said on a report that cannot be split by class while a class is picked. */
export function SchoolWideNote({ what }) {
  const { className } = useClassFilter();
  if (!className) return null;
  return (
    <p className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] text-slate-700">
      <Info size={15} className="shrink-0 text-blue-600" />
      {what} for the whole school — it is not kept class by class, so the {className} filter does not apply here.
    </p>
  );
}

/** A white card holding a report's filters (class, session, month…). */
export function FilterBar({ children }) {
  return <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200/80">{children}</div>;
}

// ── Page furniture ───────────────────────────────────────────────────────────
export function ReportHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Icon size={21} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[21px] font-bold leading-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-end gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, action, children, className = "", bodyClass = "p-5" }) {
  return (
    <section className={`rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,.04)] ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-[16.5px] font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[12.5px] text-slate-600">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/** Pill switch — Today / This Month, or the tabs over a report's tables. */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            value === o.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {o.label}
          {o.count != null && <span className="ml-1.5 text-[11.5px] text-slate-500">{num(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}

const fieldCls = "rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

/** A labelled native select in the v2 style. */
export function Picker({ label, value, onChange, options, minWidth = 150 }) {
  return (
    <label className="text-[12px] font-semibold text-slate-600">
      <span className="mb-1 block">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls} style={{ minWidth }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Period presets + custom dates; the period lives in the URL (?from=&to=). */
export function PeriodPicker({ period, hide = [], children }) {
  const [draft, setDraft] = useState(null);
  const custom = draft ?? { from: period.from, to: period.to };
  const ok = custom.from && custom.to && custom.from <= custom.to;
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200/80">
      {children && <div className="flex flex-wrap items-end gap-3 border-slate-200 pr-1 sm:border-r sm:pr-4">{children}</div>}
      <div className="flex flex-wrap gap-1.5">
        {period.presets.filter((p) => !hide.includes(p.key)).map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => { setDraft(null); period.set(p); }}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              period.active === p.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-[12px] font-semibold text-slate-600">
          <span className="mb-1 block">From</span>
          <input type="date" value={custom.from} max={custom.to || undefined} className={fieldCls}
            onChange={(e) => setDraft({ ...custom, from: e.target.value })} />
        </label>
        <label className="text-[12px] font-semibold text-slate-600">
          <span className="mb-1 block">To</span>
          <input type="date" value={custom.to} min={custom.from || undefined} className={fieldCls}
            onChange={(e) => setDraft({ ...custom, to: e.target.value })} />
        </label>
        {draft && (
          <button type="button" disabled={!ok} onClick={() => { period.set(custom); setDraft(null); }}
            className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            Apply
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorNote({ error }) {
  if (!error) return null;
  const msg = error?.data?.error || error?.data?.message || error?.error || "Could not load this report.";
  return (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

export function Hint({ children }) {
  return <p className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-900">{children}</p>;
}

export function Empty({ children = "Nothing recorded for this period.", h = 200 }) {
  return (
    <div className="flex items-center justify-center px-4 text-center text-[13.5px] text-slate-500" style={{ minHeight: h }}>
      {children}
    </div>
  );
}

// ── Headline tiles ───────────────────────────────────────────────────────────
const TONES = {
  violet: "from-violet-600 to-indigo-600",
  blue: "from-blue-600 to-indigo-700",
  green: "from-emerald-700 to-teal-700",
  pink: "from-pink-600 to-rose-700",
  cyan: "from-cyan-700 to-sky-700",
  purple: "from-purple-600 to-fuchsia-700",
  teal: "from-teal-700 to-emerald-700",
  orange: "from-orange-700 to-rose-700",
};
export const TONE_ORDER = ["violet", "blue", "green", "pink", "cyan", "purple", "teal", "orange"];

/**
 * A gradient headline figure. With `to` the whole tile is a link to the report
 * behind the number; `title` carries the exact amount when `value` is short.
 */
export function GradientStat({ label, value, sub, icon: Icon, tone = "violet", to, loading, title, compact = false }) {
  const body = (
    <>
      <span className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/90">{label}</p>
          <p className={`${compact ? "mt-1.5 text-[26px]" : "mt-2 text-[32px]"} font-bold leading-none tracking-tight`} title={title}>
            {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-white/25 align-middle" /> : value}
          </p>
          {sub != null && <p className="mt-2.5 truncate text-[13px] text-white/90">{loading ? " " : sub}</p>}
        </div>
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Icon size={22} />
          </span>
        )}
      </div>
      {to && <ArrowUpRight size={15} className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-80" aria-hidden />}
    </>
  );
  const cls = `group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[tone]} ${
    compact ? "px-5 py-4" : "px-5 py-5"
  } text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,.35)]`;
  return to ? (
    <Link to={to} className={`${cls} transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** `twoUp` keeps two small tiles per row on a phone instead of one. */
export function StatGrid({ children, cols = 4, twoUp = false }) {
  const c = { 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 xl:grid-cols-4", 5: "sm:grid-cols-3 xl:grid-cols-5", 6: "sm:grid-cols-3 xl:grid-cols-6" }[cols];
  return <div className={`mb-5 grid ${twoUp ? "grid-cols-2" : "grid-cols-1"} gap-4 ${c}`}>{children}</div>;
}

// ── Charts ───────────────────────────────────────────────────────────────────
const fmtFor = (unit) => (unit === "money" ? money : unit === "pct" ? pctText : num);
const yTick = (unit) => (v) =>
  unit === "money" ? moneyShort(v) : unit === "pct" ? `${v}%` : Number(v).toLocaleString("en-IN");

function ChartTip({ active, payload, label, unit, labelFmt, total }) {
  if (!active || !payload?.length) return null;
  const f = fmtFor(unit);
  const sum = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-[12px] shadow-lg ring-1 ring-slate-200">
      <p className="mb-1 font-semibold text-slate-900">{labelFmt ? labelFmt(label) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 leading-5 text-slate-700">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: p.color }} />
          {p.name}
          <span className="ml-auto pl-3 font-semibold text-slate-900">{f(p.value)}</span>
        </p>
      ))}
      {total && payload.length > 1 && (
        <p className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-1 leading-5 text-slate-700">
          <span className="h-2.5 w-2.5" />Total<span className="ml-auto pl-3 font-semibold text-slate-900">{f(sum)}</span>
        </p>
      )}
    </div>
  );
}

export function Legend({ series }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-700">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} /> {s.name}
        </span>
      ))}
    </div>
  );
}

/**
 * Bars over one axis (grouped, or stacked for a part-to-whole), in a panel
 * with a legend and a table view of the same numbers.
 */
export function BarsPanel({
  title, subtitle, data = [], xKey, xFmt = (v) => v, series, unit = "num", stacked = false, height = 260,
  loading, empty, className = "", tools, footer, horizontal = false,
}) {
  const [asTable, setAsTable] = useState(false);
  const f = fmtFor(unit);
  const action = (
    <div className="flex flex-wrap items-center gap-2">
      {tools}
      {data.length > 0 && (
        <button type="button" onClick={() => setAsTable((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-blue-700 hover:bg-blue-50">
          {asTable ? <><BarChart3 size={14} /> View as chart</> : <><Table2 size={14} /> View as table</>}
        </button>
      )}
    </div>
  );
  return (
    <Panel title={title} subtitle={subtitle} action={action} className={className}>
      {loading ? (
        <div className="animate-pulse rounded-xl bg-slate-100" style={{ height }} />
      ) : data.length === 0 ? (
        <Empty h={height}>{empty}</Empty>
      ) : asTable ? (
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="border-0 px-3 py-2 text-left font-semibold text-slate-700"> </th>
                {series.map((s) => <th key={s.key} className="border-0 px-3 py-2 text-right font-semibold text-slate-700">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d[xKey]} className="border-t border-slate-100">
                  <td className="border-0 px-3 py-1.5 text-slate-700">{xFmt(d[xKey])}</td>
                  {series.map((s) => <td key={s.key} className="border-0 px-3 py-1.5 text-right text-slate-900">{f(d[s.key])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <Legend series={series} />
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={height}>
              {horizontal ? (
                // One bar per row, label on the left — for long names (exams).
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid horizontal={false} stroke="#e7e6e0" />
                  <XAxis type="number" tickFormatter={yTick(unit)} tick={{ fontSize: 11, fill: "#5f6670" }} axisLine={false} tickLine={false}
                    allowDecimals={false} domain={unit === "pct" ? [0, 100] : undefined} />
                  <YAxis type="category" dataKey={xKey} tickFormatter={xFmt} tick={{ fontSize: 12, fill: "#3f4650" }} axisLine={false}
                    tickLine={false} width={170} interval={0} />
                  <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }} content={<ChartTip unit={unit} labelFmt={xFmt} total={stacked} />} />
                  {series.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} maxBarSize={26}
                      stackId={stacked ? "s" : undefined}
                      radius={!stacked || i === series.length - 1 ? [0, 4, 4, 0] : 0}
                      stroke="#ffffff" strokeWidth={stacked ? 2 : 0} />
                  ))}
                </BarChart>
              ) : (
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="24%">
                  <CartesianGrid vertical={false} stroke="#e7e6e0" />
                  <XAxis dataKey={xKey} tickFormatter={xFmt} tick={{ fontSize: 11, fill: "#5f6670" }} axisLine={false} tickLine={false}
                    interval="preserveStartEnd" minTickGap={10} />
                  <YAxis tickFormatter={yTick(unit)} tick={{ fontSize: 11, fill: "#5f6670" }} axisLine={false} tickLine={false}
                    width={unit === "money" ? 62 : 40} allowDecimals={false} domain={unit === "pct" ? [0, 100] : undefined} />
                  <Tooltip cursor={{ fill: "rgba(42,120,214,0.06)" }}
                    content={<ChartTip unit={unit} labelFmt={xFmt} total={stacked} />} />
                  {series.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} maxBarSize={28}
                      stackId={stacked ? "s" : undefined}
                      radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
                      stroke="#ffffff" strokeWidth={stacked ? 2 : 0} />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
      {footer && <div className="mt-3 flex justify-end">{footer}</div>}
    </Panel>
  );
}

/**
 * A part-to-whole ring with its headline in the hole and every part listed
 * with its value underneath. Parts that are all zero show a message instead of
 * an empty ring.
 */
export function Donut({ parts, centerLabel, centerValue, format = money, height = 220 }) {
  const total = parts.reduce((s, p) => s + (Number(p.value) || 0), 0);
  if (!total) return <Empty h={height}>Nothing to show yet.</Empty>;
  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={parts.filter((p) => p.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius="62%" outerRadius="88%" paddingAngle={1.5} stroke="#ffffff" strokeWidth={2} startAngle={90} endAngle={-270}>
              {parts.filter((p) => p.value > 0).map((p) => <Cell key={p.name} fill={p.color} />)}
            </Pie>
            <Tooltip content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg bg-white px-3 py-2 text-[12px] shadow-lg ring-1 ring-slate-200">
                  <p className="flex items-center gap-2 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: payload[0].payload.color }} />
                    {payload[0].name}
                    <span className="pl-3 font-semibold text-slate-900">{format(payload[0].value)}</span>
                  </p>
                </div>
              ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-600">{centerLabel}</span>
          <span className="text-[22px] font-bold leading-tight text-slate-900">{centerValue}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {parts.map((p) => (
          <span key={p.name} className="inline-flex items-center gap-1.5 text-[13px] text-slate-700">
            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: p.color }} />
            {p.name} <span className="font-semibold text-slate-900">{format(p.value)}</span>
            <span className="text-slate-500">· {Math.round((p.value / total) * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Part-to-whole as ranked bars in one hue: name, value, share of the total. */
export function ShareBars({ rows = [], format = money, empty = "Nothing recorded.", max = 8 }) {
  const total = rows.reduce((s, r) => s + Number(r.value || 0), 0);
  const shown = rows.slice(0, max);
  const rest = rows.slice(max).reduce((s, r) => s + Number(r.value || 0), 0);
  const list = rest > 0 ? [...shown, { name: `Other (${rows.length - max})`, value: rest }] : shown;
  if (!rows.length || !total) return <Empty h={120}>{empty}</Empty>;
  return (
    <div className="space-y-3">
      {list.map((r) => {
        const share = (Number(r.value || 0) / total) * 100;
        return (
          <div key={r.name}>
            <div className="flex justify-between gap-3 text-[13px]">
              <span className="truncate text-slate-700">{r.name}</span>
              <span className="whitespace-nowrap font-semibold text-slate-900">
                {format(r.value)} <span className="font-normal text-slate-500">· {share.toFixed(share < 10 ? 1 : 0)}%</span>
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${Math.max(share, 0.6)}%`, background: BLUE }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** A small rate badge — the colour is backed by the printed number. */
export function RateBadge({ value, good = 75, fair = 50 }) {
  const v = Number(value || 0);
  const cls = v >= good ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : v >= fair ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-red-50 text-red-700 ring-red-200";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ${cls}`}>{pctText(v)}</span>;
}

// ── Table ────────────────────────────────────────────────────────────────────
/**
 * The full list behind a report: search, sort, pages, Excel export and print.
 * A column may give `value(row)` (plain value for sort/search/export/print)
 * alongside `render(row)` (what the screen shows), and `sortValue(row)` when
 * the plain value does not sort (a formatted date); `money` formats rupees and
 * `align: "right"` right-aligns figures. Cells set `border-0`: the ERP draws a
 * box around every table cell globally, and v2 rules rows only.
 */
export function DataPanel({
  title, subtitle, columns, rows = [], filename = "report", printTitle, printSubtitle, loading,
  emptyText = "Nothing to show for this period.", pageSize = 25, footer, tools, defaultSort,
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(defaultSort || null);
  const [page, setPage] = useState(1);

  const plain = (c, r) => (c.value ? c.value(r) : r[c.key] ?? "");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = needle
      ? rows.filter((r) => columns.some((c) => String(plain(c, r)).toLowerCase().includes(needle)))
      : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        list = [...list].sort((a, b) => {
          const key = (r) => (col.sortValue ? col.sortValue(r) : plain(col, r));
          const av = key(a), bv = key(b);
          const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { numeric: true });
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [rows, q, sort, columns]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  const exportColumns = columns.map((c) => ({ label: c.label, get: (r) => plain(c, r) }));
  const print = () =>
    printTable({
      title: printTitle || title,
      subtitle: printSubtitle || subtitle || "",
      columns: columns.map((c) => c.label),
      rows: filtered.map((r) => columns.map((c) => (c.money ? money(plain(c, r)) : plain(c, r)))),
      footer: footer?.print ?? "",
    });

  const toggleSort = (key) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      bodyClass="pt-4"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {tools}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…"
              aria-label={`Search ${title}`}
              className="w-44 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-[12.5px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <ExportButton filename={`${filename}.csv`} rows={filtered} columns={exportColumns} />
          <button type="button" onClick={print} disabled={!filtered.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Printer size={13} /> Print
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-2 px-5 pb-5">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Empty h={140}>{q ? "No match." : emptyText}</Empty>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50">
                  {columns.map((c) => (
                    <th key={c.key} scope="col"
                      className={`whitespace-nowrap border-0 px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-600 ${c.align === "right" ? "text-right" : "text-left"}`}>
                      {c.sortable === false ? c.label : (
                        <button type="button" onClick={() => toggleSort(c.key)}
                          className={`inline-flex items-center gap-1 hover:text-slate-900 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                          {c.label}
                          {sort?.key === c.key && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slice.map((r, i) => (
                  <tr key={r.id ?? r.studentId ?? r.employeeId ?? `${current}-${i}`} className="hover:bg-blue-50/40">
                    {columns.map((c) => (
                      <td key={c.key} className={`border-0 px-4 py-2.5 text-slate-800 ${c.align === "right" ? "text-right tabular-nums" : ""} ${c.nowrap ? "whitespace-nowrap" : ""}`}>
                        {c.render ? c.render(r) : c.money ? money(plain(c, r)) : plain(c, r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-[13px] font-semibold text-slate-800">
              {footer.items.map((f) => <span key={f.label}>{f.label}: <span className="text-slate-900">{f.value}</span></span>)}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[12.5px] text-slate-600">
            <span>
              {num((current - 1) * pageSize + 1)}–{num(Math.min(current * pageSize, filtered.length))} of {num(filtered.length)}
            </span>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <span className="px-1">Page {current} of {pages}</span>
                <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

// ── Series helpers ───────────────────────────────────────────────────────────
/** The Indian calendar day (YYYY-MM-DD) an instant falls on. */
export const istDay = (d) => new Date(new Date(d).getTime() + 330 * 60000).toISOString().slice(0, 10);

/**
 * Day-wise money for a period, collected or not: every calendar day from
 * `from` to `to` gets a row (0 when nothing came in), with the receipts that
 * day. Longer than `limit` days, it rolls up to months so the line stays
 * readable. Receipts are dated in Indian time, like the report's day buckets.
 */
export function dailyCollection(from, to, byDay = [], receipts = [], limit = 62) {
  const amount = new Map(byDay.map((d) => [d.date, Number(d.fee || 0)]));
  const count = new Map();
  for (const r of receipts) {
    const k = istDay(r.date);
    count.set(k, (count.get(k) || 0) + 1);
  }
  const days = [];
  for (let t = Date.parse(`${from}T00:00:00Z`), end = Date.parse(`${to}T00:00:00Z`); t <= end; t += 864e5) {
    const date = new Date(t).toISOString().slice(0, 10);
    days.push({ date, amount: amount.get(date) || 0, receipts: count.get(date) || 0 });
  }
  if (days.length <= limit) return { data: days, xKey: "date", xFmt: dayLabel, grain: "day" };
  const m = new Map();
  for (const d of days) {
    const k = d.date.slice(0, 7);
    const acc = m.get(k) || { month: k, amount: 0, receipts: 0 };
    acc.amount += d.amount;
    acc.receipts += d.receipts;
    m.set(k, acc);
  }
  return { data: [...m.values()], xKey: "month", xFmt: monthLabel, grain: "month" };
}

/**
 * One measure over time as a line with a soft area under it — every point
 * marked, a crosshair tooltip, and a table view. The curve is monotone so it
 * never dips below zero between two days, which a natural spline would.
 */
export function TrendPanel({
  title, subtitle, data = [], xKey, xFmt = (v) => v, valueKey = "amount", name = "Collected", unit = "money",
  height = 300, loading, empty, className = "", tools, footer, tipExtra, color = BLUE,
}) {
  const [asTable, setAsTable] = useState(false);
  const gid = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const f = fmtFor(unit);
  const hasAny = data.some((d) => Number(d[valueKey]) > 0);
  const dense = data.length > 16;
  const action = (
    <div className="flex flex-wrap items-center gap-2">
      {tools}
      {hasAny && (
        <button type="button" onClick={() => setAsTable((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-blue-700 hover:bg-blue-50">
          {asTable ? <><BarChart3 size={14} /> View as chart</> : <><Table2 size={14} /> View as table</>}
        </button>
      )}
    </div>
  );
  return (
    <Panel title={title} subtitle={subtitle} action={action} className={className}>
      {loading ? (
        <div className="animate-pulse rounded-xl bg-slate-100" style={{ height }} />
      ) : !hasAny ? (
        <Empty h={height}>{empty}</Empty>
      ) : asTable ? (
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="border-0 px-3 py-2 text-left font-semibold text-slate-700"> </th>
                <th className="border-0 px-3 py-2 text-right font-semibold text-slate-700">{name}</th>
                {tipExtra && <th className="border-0 px-3 py-2 text-right font-semibold text-slate-700">Receipts</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d[xKey]} className="border-t border-slate-100">
                  <td className="border-0 px-3 py-1.5 text-slate-700">{xFmt(d[xKey])}</td>
                  <td className="border-0 px-3 py-1.5 text-right text-slate-900">{f(d[valueKey])}</td>
                  {tipExtra && <td className="border-0 px-3 py-1.5 text-right text-slate-900">{num(d.receipts)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: dense ? 8 : 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e7e6e0" />
            <XAxis dataKey={xKey} tickFormatter={xFmt} axisLine={{ stroke: "#d4d3cc" }} tickLine={false}
              tick={{ fontSize: 11, fill: "#5f6670" }} interval={dense && data.length <= 31 ? 0 : "preserveStartEnd"}
              angle={dense ? -40 : 0} textAnchor={dense ? "end" : "middle"} height={dense ? 52 : 30} minTickGap={4} />
            <YAxis tickFormatter={yTick(unit)} tick={{ fontSize: 11, fill: "#5f6670" }} axisLine={false} tickLine={false}
              width={unit === "money" ? 62 : 40} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-lg bg-white px-3 py-2 text-[12px] shadow-lg ring-1 ring-slate-200">
                    <p className="mb-1 font-semibold text-slate-900">{xFmt(label)}</p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {name}<span className="ml-auto pl-3 font-semibold text-slate-900">{f(payload[0].value)}</span>
                    </p>
                    {tipExtra && <p className="mt-0.5 text-slate-600">{tipExtra(payload[0].payload)}</p>}
                  </div>
                ) : null
              }
            />
            <Area type="monotone" dataKey={valueKey} name={name} stroke={color} strokeWidth={2.5} fill={`url(#${gid})`}
              dot={{ r: 4, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color, stroke: "#ffffff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </Panel>
  );
}

/**
 * Day rows → month rows when a long period would squeeze too many bars in.
 * `keys` are summed; the x label switches from "05 Oct" to "Oct 2026".
 */
export function byDayOrMonth(rows, keys, dateKey = "date", limit = 62) {
  if (rows.length <= limit) return { data: rows, xKey: dateKey, xFmt: dayLabel, grain: "day" };
  const m = new Map();
  for (const r of rows) {
    const k = String(r[dateKey]).slice(0, 7);
    const acc = m.get(k) || { month: k, ...Object.fromEntries(keys.map((x) => [x, 0])) };
    for (const x of keys) acc[x] += Number(r[x] || 0);
    m.set(k, acc);
  }
  return { data: [...m.values()], xKey: "month", xFmt: monthLabel, grain: "month" };
}
