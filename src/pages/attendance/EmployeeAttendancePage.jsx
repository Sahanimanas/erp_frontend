/**
 * Attendance → Employee Attendance (mark)
 * Roster grid for a date: Name · Designation · Department · Status · In · Out.
 * Bulk "Update Attendance" saves every row in one call.
 */
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Avatar, Skeleton, EmptyState, ExportButton } from "../../components/ui";
import { UserCheck, Save } from "lucide-react";
import {
  useGetEmployeesDailyQuery, useMarkEmployeesBulkMutation,
} from "../../redux/api/attendanceApi";
import { StatusPicker, today } from "./_attShared";

export default function EmployeeAttendancePage() {
  usePageTitle("Employee Attendance");
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState({}); // employeeId -> { status, inTime, outTime }

  const { data: rows = [], isFetching } = useGetEmployeesDailyQuery(date);
  const [saveBulk, { isLoading: saving }] = useMarkEmployeesBulkMutation();

  // Seed editable state from the roster whenever date/data changes.
  useEffect(() => {
    const seed = {};
    rows.forEach((r) => {
      seed[r.employeeId] = {
        status: r.status || "PRESENT",
        inTime: r.inTime || "",
        outTime: r.outTime || "",
      };
    });
    setMarks(seed);
  }, [rows]);

  const set = (id, patch) => setMarks((m) => ({ ...m, [id]: { ...m[id], ...patch } }));
  const markAll = (status) => setMarks((m) => {
    const next = { ...m };
    rows.forEach((r) => { next[r.employeeId] = { ...next[r.employeeId], status }; });
    return next;
  });

  const counts = useMemo(() => {
    const c = {};
    Object.values(marks).forEach((v) => { c[v.status] = (c[v.status] || 0) + 1; });
    return c;
  }, [marks]);

  const save = async () => {
    const records = rows.map((r) => ({ employeeId: r.employeeId, ...marks[r.employeeId] }));
    try {
      const res = await saveBulk({ date, records }).unwrap();
      toast.success(`Saved ${res.saved} record(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Failed to save attendance");
    }
  };

  const displayDate = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <PageHeader title="Employee Attendance" subtitle={`Attendance status for ${displayDate}`} icon={<UserCheck size={18} />}>
        <Button variant="success" icon={<Save size={14} />} loading={saving} disabled={!rows.length} onClick={save}>
          Update Attendance
        </Button>
      </PageHeader>

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex gap-2 ml-auto">
            <ExportButton filename="employee-attendance.csv" rows={rows} columns={[
              { label: "Employee", get: (r) => r.name },
              { label: "Employee Code", get: (r) => r.employeeCode || "—" },
              { label: "Designation", get: (r) => r.designation || "—" },
              { label: "Department", get: (r) => r.department || "—" },
              { label: "Status", get: (r) => marks[r.employeeId]?.status || "—" },
              { label: "In Time", get: (r) => marks[r.employeeId]?.inTime || "—" },
              { label: "Out Time", get: (r) => marks[r.employeeId]?.outTime || "—" },
            ]} />
            <Button size="sm" variant="success" disabled={!rows.length} onClick={() => markAll("PRESENT")}>All Present</Button>
            <Button size="sm" variant="danger" disabled={!rows.length} onClick={() => markAll("ABSENT")}>All Absent</Button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 text-[12px]">
            <span className="font-semibold text-slate-600">{rows.length} employees</span>
            <span className="text-emerald-600">Present: {counts.PRESENT || 0}</span>
            <span className="text-red-500">Absent: {counts.ABSENT || 0}</span>
            <span className="text-amber-500">Late: {counts.LATE || 0}</span>
            <span className="text-blue-500">Leave: {counts.LEAVE || 0}</span>
          </div>
        )}

        {isFetching ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="🧑‍🏫" title="No employees" description="Add staff to mark attendance." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Employee", "Designation", "Department", "Status", "In Time", "Out Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => {
                  const m = marks[r.employeeId] || {};
                  return (
                    <tr key={r.employeeId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-800 text-[12.5px]">{r.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{r.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.designation || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.department || "—"}</td>
                      <td className="px-4 py-2.5"><StatusPicker value={m.status} onChange={(s) => set(r.employeeId, { status: s })} /></td>
                      <td className="px-4 py-2.5">
                        <input type="time" value={m.inTime || ""} onChange={(e) => set(r.employeeId, { inTime: e.target.value })}
                          className="px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400" />
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="time" value={m.outTime || ""} onChange={(e) => set(r.employeeId, { outTime: e.target.value })}
                          className="px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
