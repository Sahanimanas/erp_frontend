/**
 * Attendance → View All Employee Attendance
 * All employees' attendance across a date range.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable } from "../../components/ui";
import { Users, Search, Download } from "lucide-react";
import { useGetEmployeeAttendanceRangeQuery } from "../../redux/api/attendanceApi";
import { StatusBadge, fmtDate, exportCsv } from "./_attShared";

export default function ViewAllEmployeeAttendancePage() {
  usePageTitle("View All Employee Attendance");
  const [form, setForm] = useState({ startDate: "", endDate: "" });
  const [query, setQuery] = useState(null);

  const { data: rows = [], isFetching } = useGetEmployeeAttendanceRangeQuery(query ?? {}, { skip: !query });

  const submit = () => {
    if (!form.startDate || !form.endDate) { toast.error("Select a date range"); return; }
    setQuery({ ...form });
  };

  const columns = [
    { key: "date", label: "Date", render: (v) => fmtDate(v) },
    { key: "name", label: "Employee" },
    { key: "designation", label: "Designation", render: (v) => v || "—" },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "inTime", label: "In", render: (v) => v || "—" },
    { key: "outTime", label: "Out", render: (v) => v || "—" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="View All Employee Attendance" subtitle="Every employee, across a date range" icon={<Users size={18} />} />
      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
          <Button icon={<Search size={14} />} onClick={submit}>Submit</Button>
        </div>
      </Card>

      {query && (
        <Card noPadding>
          <div className="p-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[12px] text-slate-500 px-2">{rows.length} record(s)</span>
            <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length}
              onClick={() => exportCsv("all-employee-attendance.csv", rows, [
                { label: "Date", get: (r) => fmtDate(r.date) }, { label: "Employee", get: (r) => r.name },
                { label: "Status", get: (r) => r.status }, { label: "In", get: (r) => r.inTime }, { label: "Out", get: (r) => r.outTime },
              ])}>Export CSV</Button>
          </div>
          <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No attendance for this range." />
        </Card>
      )}
    </div>
  );
}
