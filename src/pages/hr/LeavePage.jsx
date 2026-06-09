/**
 * LeavePage.jsx — staff leave records
 * GET /employees (staff picker), GET /employees/:id/leaves
 * Approve/Reject: PATCH /employees/:id/leaves/:leaveId/{approve|reject}
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Badge, Button, ExportButton } from "../../components/ui";
import { CalendarDays } from "lucide-react";
import apiClient from "../../services/axios";

const statusVariant = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

export default function LeavePage() {
  usePageTitle("Leave Management");
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/employees?limit=500");
        if (res.data.success) {
          const list = res.data.data || [];
          setEmployees(list);
          if (list[0]) setEmployeeId(list[0].id);
        }
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/employees/${employeeId}/leaves`);
      if (res.data.success) setLeaves(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load leaves");
    } finally { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { load(); }, [load]);

  const act = async (leaveId, action) => {
    try {
      await apiClient.patch(`/employees/${employeeId}/leaves/${leaveId}/${action}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} leave`);
    }
  };

  const name = (e) => e.user ? `${e.user.firstName} ${e.user.lastName}` : (e.employeeCode || "—");
  const empOptions = employees.map(e => ({ value: e.id, label: `${name(e)} (${e.employeeCode || "—"})` }));

  const exportColumns = [
    { label: "Type", get: (l) => l.leaveType?.name || "" },
    { label: "From", get: (l) => l.startDate ? new Date(l.startDate).toLocaleDateString("en-IN") : "" },
    { label: "To", get: (l) => l.endDate ? new Date(l.endDate).toLocaleDateString("en-IN") : "" },
    { label: "Days", get: (l) => l.days },
    { label: "Reason", get: (l) => l.reason || "" },
    { label: "Status", get: (l) => l.status },
  ];

  return (
    <div>
      <PageHeader title="Leave Management" subtitle="Staff leave records" icon={<CalendarDays size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <Select label="Employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} options={empOptions} className="max-w-sm" />
      </Card>
      <Card title="Leave Applications" noPadding action={<ExportButton filename="leave-applications.csv" rows={leaves} columns={exportColumns} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Type", "From", "To", "Days", "Reason", "Status", "Action"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : leaves.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No leave records for this employee.</td></tr>
              : leaves.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-700">{l.leaveType?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{l.startDate ? new Date(l.startDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{l.endDate ? new Date(l.endDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{l.days}</td>
                  <td className="px-4 py-3 text-slate-500">{l.reason}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[l.status] || "default"}>{l.status}</Badge></td>
                  <td className="px-4 py-3">
                    {l.status === "PENDING" ? (
                      <div className="flex gap-1.5">
                        <Button size="xs" onClick={() => act(l.id, "approve")}>Approve</Button>
                        <Button size="xs" variant="secondary" onClick={() => act(l.id, "reject")}>Reject</Button>
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
