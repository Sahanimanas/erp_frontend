/**
 * PreviousDuesPage.jsx — outstanding dues from GET /fees/pending-dues
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, Pagination } from "../../components/ui";
import { Clock } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const PAGE_SIZE = 10;

export default function PreviousDuesPage() {
  usePageTitle("Previous Dues");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get(`/fees/pending-dues?page=${page}&limit=${PAGE_SIZE}`);
        if (res.data.success) { setRows(res.data.data || []); setTotal(res.data.pagination?.total || 0); }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load dues");
      } finally { setLoading(false); }
    })();
  }, [page]);

  const studentName = (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : (r.studentId ? `#${String(r.studentId).slice(-6)}` : "—");
  const totalDue = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div>
      <PageHeader title="Previous Dues" subtitle="Outstanding balances" icon={<Clock size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5"><p className="text-xs text-slate-400 font-semibold mb-1">Dues on this page</p><p className="text-2xl font-bold text-amber-600">{fmt(totalDue)}</p></Card>
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Student", "Roll", "Fee Group", "Amount", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No outstanding dues. 🎉</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{studentName(r)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{r.student?.rollNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.group?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{fmt(r.amount)}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>
    </div>
  );
}
