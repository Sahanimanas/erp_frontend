/**
 * _sections.jsx — the tab panels of Student 360, plus the small formatters they
 * share. Kept beside the page (same convention as students/_idCardShared.jsx)
 * so Student360Page.jsx stays about layout and data-fetching only.
 *
 * Every panel takes already-fetched data and renders it; none of them fetch.
 */
import { useMemo } from "react";
import {
  CalendarCheck, Wallet, ClipboardList, Receipt, User, Phone, Mail, Home,
  Droplet, Cake, Bus, FileText, CheckCircle2, AlertCircle, Users, ChevronRight,
} from "lucide-react";
import { Card, Badge, DataTable, EmptyState, ProgressBar } from "../../components/ui";

/* ── formatters ─────────────────────────────────────────────────────────── */

export const inr = (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMonth = (ym) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export const studentName = (s) =>
  `${s?.user?.firstName ?? s?.firstName ?? ""} ${s?.user?.lastName ?? s?.lastName ?? ""}`.trim() || "—";

/** PRESENT and LATE both count as "attended" — the same rule the mobile app uses. */
const isPresent = (status) => /present|late/i.test(status || "");

/**
 * Attendance rollup: overall counts + a per-month breakdown, newest month first.
 * Returns zeros (not null) for an empty list so callers never branch on shape.
 */
export function summariseAttendance(records = []) {
  const total = records.length;
  const present = records.filter((r) => isPresent(r.status)).length;
  const late = records.filter((r) => /late/i.test(r.status || "")).length;
  const leave = records.filter((r) => /leave/i.test(r.status || "")).length;
  const absent = total - present - leave;

  const byMonth = {};
  for (const r of records) {
    if (!r.date) continue;
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] ??= { key, total: 0, present: 0, absent: 0 };
    byMonth[key].total += 1;
    if (isPresent(r.status)) byMonth[key].present += 1;
    else byMonth[key].absent += 1;
  }

  return {
    total,
    present,
    absent: Math.max(0, absent),
    late,
    leave,
    pct: total ? Math.round((present / total) * 100) : 0,
    months: Object.values(byMonth).sort((a, b) => b.key.localeCompare(a.key)),
  };
}

/** Per-exam totals and percentage, newest first. `subjects` may be empty. */
export function summariseExams(performance = []) {
  return performance.map((p) => {
    const subjects = Array.isArray(p.subjects) ? p.subjects : [];
    const obtained = subjects.reduce((s, x) => s + (Number(x.marks) || 0), 0);
    return {
      id: p.exam?.id,
      name: p.exam?.name || "Exam",
      type: p.exam?.type,
      date: p.exam?.startDate,
      subjects,
      obtained,
      count: subjects.length,
      // No per-subject max comes back on this feed, so average-per-subject is
      // the honest summary — never a fabricated "out of 100".
      avg: subjects.length ? Math.round(obtained / subjects.length) : 0,
    };
  });
}

/* ── Attendance ─────────────────────────────────────────────────────────── */

export function AttendanceSection({ summary, records = [], loading }) {
  const recent = records.slice(0, 15);

  if (!loading && !summary.total) {
    return (
      <EmptyState
        icon="📅"
        title="No attendance yet"
        description="Nothing has been marked for this student so far."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Month by month" subtitle="Newest first">
        <div className="px-5 py-4 space-y-3">
          {summary.months.length === 0 && <p className="text-xs text-slate-600">No records.</p>}
          {summary.months.map((m) => {
            const pct = m.total ? Math.round((m.present / m.total) * 100) : 0;
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{fmtMonth(m.key)}</span>
                  <span className="text-xs text-slate-600">
                    {m.present}/{m.total} · <span className="font-semibold text-slate-600">{pct}%</span>
                  </span>
                </div>
                <ProgressBar value={pct} color={pct >= 75 ? "emerald" : pct >= 60 ? "amber" : "red"} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Recent records" subtitle={`Last ${recent.length} of ${summary.total}`} noPadding>
        <DataTable
          loading={loading}
          emptyText="No attendance records"
          columns={[
            { key: "date", label: "Date", render: (_v, r) => fmtDate(r.date) },
            {
              key: "status",
              label: "Status",
              render: (_v, r) => (
                <Badge variant={isPresent(r.status) ? "success" : /leave/i.test(r.status) ? "info" : "danger"}>
                  {r.status}
                </Badge>
              ),
            },
            { key: "remarks", label: "Remarks", render: (_v, r) => r.remarks || "—" },
          ]}
          data={recent}
        />
      </Card>
    </div>
  );
}

/* ── Fees ───────────────────────────────────────────────────────────────── */

export function FeesSection({ ledger, receipts = [], loading }) {
  const items = ledger?.items ?? [];
  const totals = ledger?.totals ?? { expected: 0, paid: 0, due: 0 };

  // Receipts arrive as one row per fee line; a receipt number groups them.
  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of receipts) {
      const key = p.receiptNo || p.id;
      const row = map.get(key) ?? {
        receiptNo: p.receiptNo || "—",
        paidDate: p.paidDate,
        mode: p.mode,
        amount: 0,
        lines: [],
      };
      row.amount += Number(p.amount) || 0;
      row.lines.push(p.feeTypeName || "Fee");
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
  }, [receipts]);

  if (!loading && !items.length && !receipts.length) {
    return (
      <EmptyState
        icon="💳"
        title="No fee record"
        description="No fee structure is set for this student's class, and nothing has been collected yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total payable", value: totals.expected, tone: "bg-indigo-50 text-indigo-600" },
          { label: "Paid", value: totals.paid, tone: "bg-emerald-50 text-emerald-600" },
          { label: "Due", value: totals.due, tone: "bg-red-50 text-red-500" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl p-4 ${c.tone}`}>
            <p className="text-[11px] font-medium opacity-80">{c.label}</p>
            <p className="text-xl font-bold mt-1">{inr(c.value)}</p>
          </div>
        ))}
      </div>

      <Card title="Fee breakdown" subtitle="From the class fee structure" noPadding>
        <DataTable
          loading={loading}
          emptyText="No fee structure for this class"
          columns={[
            { key: "name", label: "Fee type" },
            { key: "frequency", label: "Frequency", render: (_v, r) => r.frequency || "—" },
            { key: "expected", label: "Payable", render: (_v, r) => inr(r.expected) },
            { key: "discount", label: "Discount", render: (_v, r) => inr(r.discount) },
            { key: "paid", label: "Paid", render: (_v, r) => inr(r.paid) },
            {
              key: "due",
              label: "Due",
              render: (_v, r) =>
                Number(r.due) > 0
                  ? <span className="font-semibold text-red-500">{inr(r.due)}</span>
                  : <Badge variant="success">Clear</Badge>,
            },
          ]}
          data={items}
        />
      </Card>

      <Card title="Receipts" subtitle={`${grouped.length} payment${grouped.length === 1 ? "" : "s"}`} noPadding>
        <DataTable
          loading={loading}
          emptyText="No payments recorded"
          columns={[
            { key: "receiptNo", label: "Receipt" },
            { key: "paidDate", label: "Date", render: (_v, r) => fmtDate(r.paidDate) },
            { key: "lines", label: "Against", render: (_v, r) => r.lines.join(", ") },
            { key: "mode", label: "Mode", render: (_v, r) => <Badge variant="info">{r.mode || "CASH"}</Badge> },
            { key: "amount", label: "Amount", render: (_v, r) => <span className="font-semibold">{inr(r.amount)}</span> },
          ]}
          data={grouped}
        />
      </Card>
    </div>
  );
}

/* ── Exams ──────────────────────────────────────────────────────────────── */

export function ExamsSection({ exams = [], loading }) {
  if (!loading && !exams.length) {
    return (
      <EmptyState
        icon="📝"
        title="No results yet"
        description="No marks have been entered for this student."
      />
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((e) => (
        <Card
          key={e.id || e.name}
          title={e.name}
          subtitle={`${e.type ? `${e.type} · ` : ""}${fmtDate(e.date)}`}
          action={
            <div className="text-right">
              <p className="text-[11px] text-slate-600">Total</p>
              <p className="text-sm font-bold text-slate-800">{e.obtained}</p>
            </div>
          }
          noPadding
        >
          <DataTable
            columns={[
              { key: "subject", label: "Subject" },
              { key: "marks", label: "Marks", render: (_v, r) => <span className="font-semibold">{r.marks}</span> },
            ]}
            data={e.subjects}
            emptyText="No subject marks"
          />
        </Card>
      ))}
    </div>
  );
}

/* ── Profile ────────────────────────────────────────────────────────────── */

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-600">{label}</p>
      <p className="text-xs font-medium text-slate-700 break-words">{value || "—"}</p>
    </div>
  </div>
);

export function ProfileSection({ student }) {
  if (!student) return null;
  const parents = Array.isArray(student.parents) ? student.parents : [];
  const docs = Array.isArray(student.documents) ? student.documents : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Personal">
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={Cake} label="Date of birth" value={fmtDate(student.dateOfBirth)} />
          <Field icon={Droplet} label="Blood group" value={student.bloodGroup} />
          <Field icon={User} label="Gender" value={student.gender} />
          <Field icon={CalendarCheck} label="Admitted on" value={fmtDate(student.admissionDate)} />
          <Field icon={Phone} label="Phone" value={student.user?.phone} />
          <Field icon={Mail} label="Email" value={student.user?.email} />
          <Field icon={Home} label="Address" value={student.address} />
          <Field
            icon={Bus}
            label="Transport"
            value={student.transportAllotted ? student.transportRoute || "Allotted" : "Not allotted"}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Guardians">
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={User} label="Father" value={student.fatherName} />
            <Field icon={User} label="Mother" value={student.motherName} />
            {parents.map((p) => (
              <Field
                key={p.id}
                icon={Users}
                label={p.relationship || "Guardian"}
                value={`${studentName(p)}${p.user?.phone ? ` · ${p.user.phone}` : ""}`}
              />
            ))}
          </div>
        </Card>

        <Card title="Documents" subtitle={`${docs.length} uploaded`} noPadding>
          {docs.length === 0 ? (
            <div className="px-5 py-6">
              <p className="text-xs text-slate-600">No documents uploaded.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {docs.map((d) => (
                <li key={d.id} className="px-5 py-3 flex items-center gap-3">
                  <FileText size={14} className="text-slate-600 flex-shrink-0" />
                  <span className="text-xs text-slate-700 flex-1 truncate">{d.name || d.type || "Document"}</span>
                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Open
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ── Overview ───────────────────────────────────────────────────────────── */

/** A ring that reads as a percentage at a glance; colour carries the verdict. */
function Ring({ pct }) {
  const stroke = pct >= 75 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef2f7" strokeWidth="3.5" />
        <circle
          cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" strokeLinecap="round"
          stroke={stroke} strokeDasharray={`${(Math.min(100, pct) / 100) * 97.4} 97.4`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800 leading-none">{pct}%</span>
        <span className="text-[9px] text-slate-600 mt-0.5">present</span>
      </div>
    </div>
  );
}

/**
 * An overview card that doubles as a link to its own tab — clicking "Fees" opens
 * the Fees tab rather than making the reader go back up to the tab bar. Rendered
 * as a real button so it is keyboard reachable, with the chevron as the hint.
 */
function JumpCard({ title, subtitle, onJump, className = "", children }) {
  return (
    <button
      type="button"
      onClick={onJump}
      className={`text-left w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400
                 group transition-shadow hover:shadow-md ${className}`}
    >
      <Card
        title={title}
        subtitle={subtitle}
        action={
          <ChevronRight
            size={16}
            className="text-slate-500 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"
          />
        }
      >
        {children}
      </Card>
    </button>
  );
}

const Tile = ({ icon: Icon, tone, label, value, sub }) => (
  <div className="flex items-start gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tone}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-600">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      {sub && <p className="text-[10px] text-slate-600 truncate">{sub}</p>}
    </div>
  </div>
);

export function OverviewSection({ summary, ledger, exams, student, onJump, feesSubtitle = "Current session" }) {
  const totals = ledger?.totals ?? { expected: 0, paid: 0, due: 0 };
  const latest = exams[0];
  const clear = Number(totals.due) <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Attendance */}
      <JumpCard title="Attendance" subtitle="Whole record" onJump={() => onJump("attendance")}>
        <div className="px-5 py-5 flex items-center gap-5">
          <Ring pct={summary.pct} />
          <div className="space-y-2 min-w-0">
            {[
              { n: summary.present, l: "Present", c: "bg-emerald-500" },
              { n: summary.absent, l: "Absent", c: "bg-red-500" },
              { n: summary.late, l: "Late", c: "bg-amber-500" },
              { n: summary.leave, l: "Leave", c: "bg-blue-500" },
            ].map((r) => (
              <div key={r.l} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${r.c}`} />
                <span className="text-sm font-bold text-slate-800 tabular-nums w-7">{r.n}</span>
                <span className="text-[11px] text-slate-600">{r.l}</span>
              </div>
            ))}
            <p className="text-[10px] text-slate-600 pt-1">{summary.total} days marked</p>
          </div>
        </div>
      </JumpCard>

      {/* Fees */}
      <JumpCard title="Fees" subtitle={feesSubtitle} onJump={() => onJump("fees")}>
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-1">
            {clear
              ? <CheckCircle2 size={18} className="text-emerald-500" />
              : <AlertCircle size={18} className="text-amber-500" />}
            <span className={`text-2xl font-bold ${clear ? "text-emerald-600" : "text-slate-800"}`}>
              {inr(totals.due)}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mb-4">{clear ? "nothing pending" : "still due"}</p>

          <ProgressBar
            value={Number(totals.paid)}
            max={Math.max(1, Number(totals.expected))}
            color={clear ? "emerald" : "amber"}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-600">Paid {inr(totals.paid)}</span>
            <span className="text-[11px] text-slate-600">of {inr(totals.expected)}</span>
          </div>
        </div>
      </JumpCard>

      {/* Latest exam */}
      <JumpCard title="Latest exam" subtitle={latest ? latest.name : "No results yet"} onJump={() => onJump("exams")}>
        <div className="px-5 py-5">
          {latest ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">{latest.obtained}</span>
                <span className="text-[11px] text-slate-600">total marks</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {latest.count} subject{latest.count === 1 ? "" : "s"} · avg {latest.avg} · {fmtDate(latest.date)}
              </p>
              <div className="mt-4 space-y-1.5">
                {latest.subjects.slice(0, 4).map((x) => (
                  <div key={x.subject} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 truncate">{x.subject}</span>
                    <span className="text-[11px] font-bold text-slate-700 tabular-nums">{x.marks}</span>
                  </div>
                ))}
                {latest.subjects.length > 4 && (
                  <p className="text-[10px] text-slate-600 pt-1">
                    +{latest.subjects.length - 4} more in the Exams tab
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-600">No marks entered for this student.</p>
          )}
        </div>
      </JumpCard>

      {/* Quick facts */}
      <JumpCard className="lg:col-span-3" title="At a glance" subtitle="Full details in Profile" onJump={() => onJump("profile")}>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Tile icon={ClipboardList} tone="bg-indigo-50 text-indigo-600"
                label="Roll number" value={student?.rollNumber || "—"} />
          <Tile icon={Receipt} tone="bg-violet-50 text-violet-600"
                label="Admission no." value={student?.admissionNumber || "—"} />
          <Tile icon={User} tone="bg-cyan-50 text-cyan-600"
                label="Father" value={student?.fatherName || "—"} sub={student?.motherName || ""} />
          <Tile icon={Cake} tone="bg-amber-50 text-amber-600"
                label="Date of birth" value={fmtDate(student?.dateOfBirth)}
                sub={student?.bloodGroup ? `Blood ${student.bloodGroup}` : ""} />
        </div>
      </JumpCard>
    </div>
  );
}
