/**
 * Attendance → All Student Daily Attendance
 * Every student's status for a single date + summary counts + CSV.
 */
import { useState, useMemo } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SummaryCards } from "../../components/ui";
import { CalendarCheck, Download } from "lucide-react";
import { useGetStudentsDailyQuery } from "../../redux/api/attendanceApi";
import { StatusBadge, today, exportCsv } from "./_attShared";

export default function AllStudentDailyAttendancePage() {
  usePageTitle("All Student Daily Attendance");
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState(today());

  const { data: rows = [], isFetching } = useGetStudentsDailyQuery({ date: query });

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, marked: 0 };
    rows.forEach((r) => { if (r.status) { c.marked++; c[r.status] = (c[r.status] || 0) + 1; } });
    return c;
  }, [rows]);

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "name", label: "Student" },
    { key: "className", label: "Class", render: (v, r) => `${v ?? "—"}-${r.sectionName ?? ""}` },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="All Student Daily Attendance" subtitle="Every student's status for a day" icon={<CalendarCheck size={18} />} />
      <Card>
        <div className="p-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attendance Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
          <Button onClick={() => setQuery(date)}>Submit</Button>
        </div>
      </Card>

      <SummaryCards cards={[
        { label: "Total Students", value: rows.length },
        { label: "Present", value: counts.PRESENT, bg: "bg-emerald-50", text: "text-emerald-600" },
        { label: "Absent", value: counts.ABSENT, bg: "bg-red-50", text: "text-red-500" },
        { label: "Not Marked", value: rows.length - counts.marked, bg: "bg-amber-50", text: "text-amber-600" },
      ]} />

      <Card noPadding>
        <div className="p-3 flex justify-end border-b border-slate-100">
          <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length}
            onClick={() => exportCsv(`student-attendance-${query}.csv`, rows, [
              { label: "Roll No", get: (r) => r.rollNumber }, { label: "Student", get: (r) => r.name },
              { label: "Class", get: (r) => `${r.className}-${r.sectionName}` }, { label: "Status", get: (r) => r.status || "Not Marked" },
            ])}>Export CSV</Button>
        </div>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No students found." />
      </Card>
    </div>
  );
}
