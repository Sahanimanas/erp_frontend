/**
 * Employee Leave → Leave Assign
 *
 * Pick an employee, then set how many days of each leave type they're entitled
 * to. A type with no saved row falls back to its default count and is flagged
 * "[Not Configured Yet]".
 *   GET/PUT /employees/:employeeId/leave-assignments
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Select, Button, Badge } from "../../../components/ui";
import { UserCog, Save } from "lucide-react";
import apiClient from "../../../services/axios";
import { EmployeeInfoCard, empOptions, validityLabel } from "./shared";

export default function LeaveAssignPage() {
  usePageTitle("Leave Assign");
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/employees?limit=500");
        if (res.data.success) setEmployees(res.data.data || []);
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load employees");
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!employeeId) { setRows([]); return; }
    setLoading(true);
    try {
      const res = await apiClient.get(`/employees/${employeeId}/leave-assignments`);
      if (res.data.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load leave assignment");
    } finally { setLoading(false); }
  }, [employeeId]);
  useEffect(() => { load(); }, [load]);

  const employee = employees.find((e) => e.id === employeeId);

  const setCount = (leaveTypeId, value) =>
    setRows((rs) => rs.map((r) => (r.leaveTypeId === leaveTypeId ? { ...r, count: value } : r)));

  const update = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put(`/employees/${employeeId}/leave-assignments`, {
        assignments: rows.map((r) => ({ leaveTypeId: r.leaveTypeId, count: Number(r.count) || 0 })),
      });
      if (res.data.success) setRows(res.data.data || []);
      toast.success("Leave assignment updated");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to update leave assignment");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Employee Leave Assign" subtitle="Set per-employee leave entitlements" icon={<UserCog size={18} />} />

      <Card title="Leave Assign">
        <div className="p-5">
          <div className="max-w-md">
            <Select label="Select Employee *" value={employeeId} options={empOptions(employees)}
              onChange={(e) => setEmployeeId(e.target.value)} />
          </div>
        </div>
      </Card>

      {employee && (
        <Card><EmployeeInfoCard employee={employee} /></Card>
      )}

      {employeeId && (
        <Card noPadding title="Leave Assigned Details" subtitle="Leave count granted to this employee">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Name", "Leave Validity", "Type", "Leave Count"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    No enabled leave types. Add them under Leave Type first.
                  </td></tr>
                ) : rows.map((r) => (
                  <tr key={r.leaveTypeId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{r.name}</span>
                      {!r.configured && <em className="ml-1.5 text-[11px] text-amber-600 not-italic">[Not Configured Yet]</em>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{validityLabel(r.validity)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.paid ? "success" : "warning"}>{r.paid ? "Paid" : "Unpaid"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={r.count}
                        onChange={(e) => setCount(r.leaveTypeId, e.target.value)}
                        className="w-24 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white
                                   focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <div className="px-5 py-4 flex justify-end border-t border-slate-100">
              <Button icon={<Save size={14} />} loading={saving} onClick={update}>Update</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
