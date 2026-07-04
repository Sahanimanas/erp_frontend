/**
 * Exam Management → Exam Hall Plan
 * Per-hall capacity vs allocated seats for a session's exam.
 */
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, Badge } from "../../components/ui";
import { LayoutGrid } from "lucide-react";
import { useGetHallPlanQuery } from "../../redux/api/examMgmtApi";
import { useSessionExams, sessionOptions, examOptions } from "./_examShared";

export default function ExamHallPlanPage() {
  usePageTitle("Exam Hall Plan");
  const { years, session, setSession, exams, examId, setExamId } = useSessionExams();
  const { data: halls = [], isFetching } = useGetHallPlanQuery(examId, { skip: !examId });

  const COLUMNS = [
    { key: "name", label: "Hall", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "roomNo", label: "Room No", render: (v) => v || "-" },
    { key: "capacity", label: "Capacity", render: (v) => v || "Unlimited" },
    { key: "allocated", label: "Allocated", render: (v) => <span className="font-semibold text-indigo-600">{v}</span> },
    {
      key: "id", label: "Occupancy", sortable: false, render: (_, r) => {
        if (!r.capacity) return <Badge variant={r.allocated ? "info" : "default"}>{r.allocated ? "In use" : "Free"}</Badge>;
        const pct = Math.round((r.allocated / r.capacity) * 100);
        return (
          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 w-9 text-right">{pct}%</span>
          </div>
        );
      },
    },
  ];

  const totals = halls.reduce((t, h) => ({ capacity: t.capacity + (h.capacity || 0), allocated: t.allocated + h.allocated }), { capacity: 0, allocated: 0 });

  return (
    <div>
      <PageHeader title="Exam Hall Plan" subtitle="Hall-wise seat utilisation for an exam" icon={<LayoutGrid size={18} />} />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-44" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-56" />
          {examId && !isFetching && (
            <span className="ml-auto text-[11px] text-slate-500">{totals.allocated} allocated / {totals.capacity || "∞"} total capacity</span>
          )}
        </div>
        <DataTable columns={COLUMNS} data={halls} loading={isFetching} emptyText={examId ? "No halls yet — add them under Exam Hall Detail." : "Pick a session and exam to see hall utilisation."} />
      </Card>
    </div>
  );
}
