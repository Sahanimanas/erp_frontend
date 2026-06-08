/**
 * Attendance → Download/View Student Attendance
 * Section attendance summary over a date range (present/absent/%) + CSV export.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Badge } from "../../components/ui";
import { Download, Search } from "lucide-react";
import {
  useGetClassesQuery, useGetSectionsQuery, useGetSectionAttendanceSummaryQuery,
} from "../../redux/api/attendanceApi";
import { exportCsv } from "./_attShared";

export default function DownloadStudentAttendancePage() {
  usePageTitle("Download Student Attendance");
  const [classId, setClassId] = useState("");
  const [form, setForm] = useState({ sectionId: "", startDate: "", endDate: "" });
  const [query, setQuery] = useState(null);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: rows = [], isFetching } = useGetSectionAttendanceSummaryQuery(query ?? {}, { skip: !query });

  const submit = () => {
    if (!form.sectionId || !form.startDate || !form.endDate) { toast.error("Select section and date range"); return; }
    setQuery({ ...form });
  };

  const pctVariant = (p) => (p >= 75 ? "success" : p >= 50 ? "warning" : "danger");
  const columns = [
    { key: "rollNumber", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "name", label: "Student" },
    { key: "present", label: "Present" },
    { key: "absent", label: "Absent" },
    { key: "total", label: "Total Days" },
    { key: "percentage", label: "%", render: (v) => <Badge variant={pctVariant(v)}>{v}%</Badge> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Download / View Student Attendance" subtitle="Section summary across a date range" icon={<Download size={18} />} />
      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setForm((f) => ({ ...f, sectionId: "" })); }}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section *" value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}
            options={[{ value: "", label: classId ? "Select Section" : "Pick a class first" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date *</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date *</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
        <div className="px-5 pb-5"><Button icon={<Search size={14} />} onClick={submit}>Submit</Button></div>
      </Card>

      {query && (
        <Card noPadding>
          <div className="p-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[12px] text-slate-500 px-2">{rows.length} student(s)</span>
            <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length}
              onClick={() => exportCsv("student-attendance-summary.csv", rows, [
                { label: "Roll No", get: (r) => r.rollNumber }, { label: "Student", get: (r) => r.name },
                { label: "Present", get: (r) => r.present }, { label: "Absent", get: (r) => r.absent },
                { label: "Total", get: (r) => r.total }, { label: "Percentage", get: (r) => `${r.percentage}%` },
              ])}>Export CSV</Button>
          </div>
          <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No attendance found for this range." />
        </Card>
      )}
    </div>
  );
}
