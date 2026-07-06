/**
 * Fee Management → Class Fee Summary
 * Class-wise fee totals for the school: total (expected), submitted (collected)
 * and pending fees per class, filterable by session and class.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, ExportButton } from "../../components/ui";
import { PieChart } from "lucide-react";
import { useGetClassFeeSummaryQuery } from "../../redux/api/paymentsApi";
import { useGetAcademicYearsQuery, useGetClassesQuery } from "../../redux/api/attendanceApi";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// Nursery → LKG → UKG → 1…12, same ordering rule as the other class pickers.
const ORDER = { Nursery: -4, "P-Nur": -3, Nur: -3, LKG: -2, UKG: -1 };
const classRank = (name) => ORDER[name] ?? (Number(name) || 99);

export default function ClassFeeSummaryPage() {
  usePageTitle("Class Fee Summary");
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  useEffect(() => {
    if (!session && years.length) setSession((years.find((y) => y.isActive) || years[0]).id);
  }, [years, session]);

  const { data: rows = [], isFetching } = useGetClassFeeSummaryQuery({ academicYearId: session }, { skip: !session });

  const filtered = rows
    .filter((r) => !classId || r.classId === classId)
    .slice()
    .sort((a, b) => classRank(a.className) - classRank(b.className));
  const totals = filtered.reduce(
    (t, r) => ({ students: t.students + r.students, total: t.total + r.total, collected: t.collected + r.collected, pending: t.pending + r.pending }),
    { students: 0, total: 0, collected: 0, pending: 0 }
  );

  const COLUMNS = [
    { key: "className", label: "Class", render: (v) => <span className="font-semibold text-slate-800">Class {v}</span> },
    { key: "students", label: "Students", render: (v) => <span className="font-semibold text-indigo-600">{v}</span> },
    { key: "total", label: "Total Fees", render: (v) => <span className="font-semibold">{inr(v)}</span> },
    { key: "collected", label: "Submitted", render: (v) => <span className="font-semibold text-emerald-600">{inr(v)}</span> },
    { key: "pending", label: "Pending", render: (v) => <span className={`font-semibold ${v > 0 ? "text-red-500" : "text-slate-400"}`}>{inr(v)}</span> },
    {
      key: "classId", label: "Collected %", sortable: false, render: (_, r) => {
        const pct = r.total > 0 ? Math.round((r.collected / r.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2 min-w-[130px]">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 w-9 text-right">{pct}%</span>
          </div>
        );
      },
    },
  ];

  const EXPORT_COLS = [
    { label: "Class", get: (r) => r.className },
    { label: "Students", get: (r) => r.students },
    { label: "Total Fees", get: (r) => r.total },
    { label: "Submitted", get: (r) => r.collected },
    { label: "Pending", get: (r) => r.pending },
  ];

  const chip = (label, value, cls) => (
    <div className={`rounded-lg px-4 py-2.5 ${cls}`}>
      <p className="text-[10px] font-bold uppercase opacity-70">{label}</p>
      <p className="text-[15px] font-extrabold mt-0.5">{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Class Fee Summary" subtitle="Total, submitted and pending fees per class" icon={<PieChart size={18} />}>
        <ExportButton filename="class-fee-summary.csv" rows={filtered} columns={EXPORT_COLS} />
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {chip("Students", totals.students, "bg-indigo-50 text-indigo-700")}
        {chip("Total Fees", inr(totals.total), "bg-slate-100 text-slate-700")}
        {chip("Submitted", inr(totals.collected), "bg-emerald-50 text-emerald-700")}
        {chip("Pending", inr(totals.pending), "bg-red-50 text-red-600")}
      </div>

      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 items-end">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select Session" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} className="w-44" />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "All Classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} className="w-40" />
          <span className="ml-auto text-[11px] text-slate-500">{isFetching ? "Calculating..." : `${filtered.length} class(es)`}</span>
        </div>
        <DataTable columns={COLUMNS} data={filtered} loading={isFetching} emptyText="No classes found for this session." />
      </Card>
    </div>
  );
}
