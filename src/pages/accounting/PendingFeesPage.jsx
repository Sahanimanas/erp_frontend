/**
 * PendingFeesPage.jsx — outstanding dues from GET /fees/pending-dues
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, ExportButton } from "../../components/ui";
import { AlertCircle } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PendingFeesPage() {
  usePageTitle("Pending Fees");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/fees/pending-dues");
        if (res.data.success) setRows(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load pending fees");
      } finally { setLoading(false); }
    })();
  }, []);

  const totalPending = rows.reduce((s, r) => s + Number(r.amount), 0);
  const studentName = (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : (r.studentId ? `#${String(r.studentId).slice(-6)}` : "—");

  return (
    <div>
      <PageHeader title="Pending Fees" subtitle="Outstanding dues" icon={<AlertCircle size={18} />}>
        <ExportButton filename="pending-fees.csv" rows={rows} columns={[
          { label: "Student", get: (r) => studentName(r) },
          { label: "Fee Group", get: (r) => r.fee?.group?.name || "—" },
          { label: "Amount", get: (r) => Number(r.amount || 0) },
          { label: "Due Date", get: (r) => r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—" },
          { label: "Status", get: (r) => r.status },
        ]} />
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5"><p className="text-xs text-slate-400 font-semibold mb-1">Total Outstanding</p><p className="text-3xl font-bold text-amber-600">{fmt(totalPending)}</p><p className="text-xs text-slate-400 mt-1">{rows.length} pending record(s)</p></Card>
      <Card title="Pending Dues" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Student", "Fee Group", "Amount", "Due Date", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No pending fees. 🎉</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{studentName(r)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.group?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
