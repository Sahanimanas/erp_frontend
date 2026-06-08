/**
 * Attendance → View Employee Attendance
 * Search one employee's attendance over a date range.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable } from "../../components/ui";
import { Search, Download } from "lucide-react";
import {
  useGetEmployeesDailyQuery, useGetEmployeeAttendanceRangeQuery,
} from "../../redux/api/attendanceApi";
import { StatusBadge, today, fmtDate, exportCsv } from "./_attShared";

export default function ViewEmployeeAttendancePage() {
  usePageTitle("View Employee Attendance");
  const { data: employees = [] } = useGetEmployeesDailyQuery(today());
  const [form, setForm] = useState({ employeeId: "", startDate: "", endDate: "" });
  const [query, setQuery] = useState(null);

  const { data: rows = [], isFetching } = useGetEmployeeAttendanceRangeQuery(query ?? {}, { skip: !query });

  const submit = () => {
    if (!form.employeeId || !form.startDate || !form.endDate) {
      toast.error("Select an employee and date range");
      return;
    }
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
      <PageHeader title="View Employee Attendance" subtitle="Per-employee attendance history" icon={<Search size={18} />} />
      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select
            label="Employee *"
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            options={[{ value: "", label: "Select…" }, ...employees.map((e) => ({ value: e.employeeId, label: e.name }))]}
          />
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
          <div className="p-3 flex justify-end border-b border-slate-100">
            <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length}
              onClick={() => exportCsv("employee-attendance.csv", rows, [
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
