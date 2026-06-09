/**
 * FeesReminderPage.jsx — students with pending dues (reminder targets)
 * GET /fees/pending-dues
 * NOTE: actually dispatching SMS/email reminders needs the notifications/queue
 * module (separate slice); this surfaces who would be reminded.
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, ExportButton } from "../../components/ui";
import { Bell } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FeesReminderPage() {
  usePageTitle("Fees Reminder");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/fees/pending-dues?limit=200");
        if (res.data.success) setRows(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load reminders");
      } finally { setLoading(false); }
    })();
  }, []);

  const studentName = (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : "—";

  return (
    <div>
      <PageHeader title="Fees Reminder" subtitle="Pending-due reminder targets" icon={<Bell size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded-lg text-xs">
        {rows.length} student(s) currently have pending dues and would receive a reminder.
      </div>
      <Card
        noPadding
        action={
          <ExportButton
            filename="fees-reminders.csv"
            rows={rows}
            columns={[
              { label: "Student", get: (r) => studentName(r) },
              { label: "Roll", get: (r) => r.student?.rollNumber || "—" },
              { label: "Fee Group", get: (r) => r.fee?.group?.name || "—" },
              { label: "Due Date", get: (r) => (r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—") },
              { label: "Amount", get: (r) => Number(r.amount || 0) },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Student", "Roll", "Fee Group", "Due Date", "Amount"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No reminders needed. 🎉</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{studentName(r)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{r.student?.rollNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.group?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{fmt(r.amount)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
