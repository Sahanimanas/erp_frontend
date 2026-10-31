/**
 * Fee Dues & Defaulters — class-wise fee position for the session and the list
 * of students who owe money as of a month, straight from the fee ledger engine
 * (the same numbers as Fee Payment and the demand bills).
 *
 * Replaces the earlier page, which read the legacy FeeCollection table that
 * the fee module no longer writes to, so it showed ₹0 for every school.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, X } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge } from "../../components/ui";
import { useGetFeesDueReportQuery } from "../../redux/api/reportsApi";
import { ReportError, Note, Kpi, KpiRow, ReportTable, useReportClass, money, num, pctText } from "./_shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** April → March of the current session, as the fee engine labels them ("Oct-2026"). */
function sessionMonths(now = new Date()) {
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 12 }, (_, i) => {
    const m = (3 + i) % 12;
    const y = startYear + (3 + i >= 12 ? 1 : 0);
    return `${MONTHS[m]}-${y}`;
  });
}
const thisMonth = () => { const d = new Date(); return `${MONTHS[d.getMonth()]}-${d.getFullYear()}`; };

export default function FeesReportsPage() {
  usePageTitle("Fee Dues & Defaulters");
  const navigate = useNavigate();
  const [month, setMonth] = useState(thisMonth());
  const [classFilter, setClassFilter] = useState(null);
  // The class picked here (or carried from the Reports home) is applied on the
  // server; clicking a class row below narrows the defaulters on screen.
  const cls = useReportClass();
  const { data, isFetching, error } = useGetFeesDueReportQuery({ month, classId: cls.classId });

  const t = data?.totals;
  const months = useMemo(() => sessionMonths(), []);
  const defaulters = useMemo(
    () => (data?.defaulters ?? []).filter((d) => !classFilter || d.classId === classFilter.id),
    [data, classFilter]
  );
  const shownDue = defaulters.reduce((s, d) => s + d.overdue, 0);

  return (
    <div>
      <PageHeader title="Fee Dues & Defaulters" icon={<Wallet />}
        subtitle={cls.className ? `${cls.className} — who owes how much` : "Who owes how much, class by class"}>
        <label className="text-[12px] font-semibold text-slate-600 flex items-center gap-2">
          Class
          <select value={cls.classId} onChange={(e) => { setClassFilter(null); cls.set(e.target.value); }} aria-label="Class"
            className="px-2.5 py-1.5 text-[13px] border bg-white font-semibold text-slate-800 focus:outline-none"
            style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
            <option value="">All classes</option>
            {cls.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-slate-600 flex items-center gap-2">
          Due till
          <select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Due till month"
            className="px-2.5 py-1.5 text-[13px] border bg-white font-semibold text-slate-800 focus:outline-none"
            style={{ borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
            {months.map((m) => <option key={m} value={m}>{m.replace("-", " ")}</option>)}
          </select>
        </label>
      </PageHeader>
      <ReportError error={error} />

      <KpiRow cols={5}>
        <Kpi label={`Due till ${month.replace("-", " ")}`} value={money(t?.overdue)} sub={`${num(t?.defaulters)} students`} tone="var(--erp-danger)" loading={isFetching} />
        <Kpi label="Session fee" value={money(t?.sessionFee)} sub={`${num(t?.students)} students`} loading={isFetching} />
        <Kpi label="Paid against session fee" value={money(t?.collected)} tone="var(--erp-success)" loading={isFetching} />
        <Kpi label="Remaining for session" value={money(t?.remaining)} sub="Includes months not due yet" tone="var(--erp-warning)" loading={isFetching} />
        <Kpi label="Collection rate" value={pctText(t?.collectionRate)} sub="of session fee" loading={isFetching} />
      </KpiRow>

      <Note>
        <b>Due till {month.replace("-", " ")}</b> = only fees whose month has already arrived (not future months). This is the same calculation shown in
        Fee Payment and the demand bill. “Paid against session fee” can differ from the Income Report — the Income Report shows
        <i>all</i> money received in the selected dates, while this shows only money paid against this session’s fee structure.
      </Note>

      <ReportTable
        title="Class-wise position"
        subtitle="Click a class to see only its defaulters"
        filename={`class-fee-position-${month}`}
        printTitle={`Class-wise Fee Position — due till ${month.replace("-", " ")}`}
        loading={isFetching}
        rows={data?.classes ?? []}
        emptyText="No students with a fee structure yet."
        onRowClick={(r) => setClassFilter((c) => (c?.id === r.classId ? null : { id: r.classId, name: r.className }))}
        columns={[
          {
            key: "className", label: "Class", value: (r) => r.className,
            render: (r) => <span className="font-semibold" style={{ color: classFilter?.id === r.classId ? "var(--erp-primary)" : undefined }}>{r.className}</span>,
          },
          { key: "students", label: "Students" },
          { key: "sessionFee", label: "Session fee", money: true },
          { key: "collected", label: "Paid", money: true },
          { key: "remaining", label: "Remaining", money: true },
          {
            key: "overdue", label: "Due till month", value: (r) => r.overdue,
            render: (r) => <span className="font-bold" style={{ color: r.overdue > 0 ? "var(--erp-danger)" : "var(--erp-success)" }}>{money(r.overdue)}</span>,
          },
          { key: "defaulters", label: "Defaulters" },
          {
            key: "collectionRate", label: "Collected", value: (r) => `${r.collectionRate}%`,
            render: (r) => <Badge variant={r.collectionRate >= 75 ? "success" : r.collectionRate >= 40 ? "warning" : "danger"}>{pctText(r.collectionRate)}</Badge>,
          },
        ]}
        footer={{
          items: [
            { label: "Session fee", value: money(t?.sessionFee) },
            { label: "Paid", value: money(t?.collected), tone: "var(--erp-success)" },
            { label: "Due till month", value: money(t?.overdue), tone: "var(--erp-danger)" },
          ],
          print: `Session fee ${money(t?.sessionFee)}  ·  Paid ${money(t?.collected)}  ·  Due ${money(t?.overdue)}`,
        }}
      />

      {classFilter && (
        <Card className="mb-3">
          <div className="px-4 py-2 flex items-center gap-2 text-[13px]">
            Showing defaulters of <b>{classFilter.name}</b>
            <button type="button" onClick={() => setClassFilter(null)} className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--erp-primary)" }}>
              <X size={13} /> Show all classes
            </button>
          </div>
        </Card>
      )}

      <ReportTable
        title={`Defaulters — due till ${month.replace("-", " ")}`}
        subtitle={`${num(defaulters.length)} students · ${money(shownDue)} · highest due first · click a row to collect fee`}
        filename={`defaulters-${classFilter?.name || "all"}-${month}`}
        printTitle={`Fee Defaulters — due till ${month.replace("-", " ")}${classFilter ? ` — ${classFilter.name}` : ""}`}
        loading={isFetching}
        searchable
        rows={defaulters}
        emptyText="No defaulters — all fees are paid."
        onRowClick={(r) => navigate(`/payments/student-fee?id=${r.studentId}`)}
        columns={[
          { key: "name", label: "Student", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
          { key: "rollNumber", label: "Roll No" },
          { key: "className", label: "Class" },
          { key: "fatherName", label: "Father" },
          { key: "phone", label: "Phone" },
          { key: "previousDue", label: "Previous due", money: true },
          { key: "currentDue", label: "This month", money: true },
          {
            key: "overdue", label: "Total due", value: (r) => r.overdue,
            render: (r) => <span className="font-bold" style={{ color: "var(--erp-danger)" }}>{money(r.overdue)}</span>,
          },
          { key: "paid", label: "Paid (session)", money: true },
        ]}
        footer={{
          items: [{ label: "Total due", value: money(shownDue), tone: "var(--erp-danger)" }],
          print: `Total due: ${money(shownDue)}`,
        }}
      />
    </div>
  );
}
