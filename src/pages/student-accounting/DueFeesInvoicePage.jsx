/**
 * DueFeesInvoicePage.jsx — printable due-fees invoices from GET /fees/pending-dues
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Badge, ExportButton } from "../../components/ui";
import { AlertCircle, Printer } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DueFeesInvoicePage() {
  usePageTitle("Due Fees Invoice");
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
        setError(err.response?.data?.error || err.message || "Failed to load invoices");
      } finally { setLoading(false); }
    })();
  }, []);

  const studentName = (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : "—";
  const grandTotal = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div>
      <PageHeader title="Due Fees Invoice" subtitle="Outstanding fee invoices" icon={<AlertCircle size={18} />}>
        <ExportButton
          filename="due-fees-invoices.csv"
          rows={rows}
          columns={[
            { label: "Invoice #", get: (r) => `INV-${String(r.id).slice(-6).toUpperCase()}` },
            { label: "Student", get: (r) => studentName(r) },
            { label: "Class/Sec", get: (r) => `${r.student?.section?.class?.name || "—"}/${r.student?.section?.name || "—"}` },
            { label: "Fee Group", get: (r) => r.fee?.group?.name || "—" },
            { label: "Due Date", get: (r) => (r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—") },
            { label: "Amount", get: (r) => Number(r.amount || 0) },
          ]}
        />
        <Button size="sm" icon={<Printer size={13} />} onClick={() => window.print()} disabled={rows.length === 0}>Print</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5"><p className="text-xs text-slate-400 font-semibold mb-1">Total Outstanding</p><p className="text-2xl font-bold text-red-600">{fmt(grandTotal)}</p><p className="text-xs text-slate-400 mt-1">{rows.length} invoice(s)</p></Card>
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Invoice #", "Student", "Class/Sec", "Fee Group", "Due Date", "Amount"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No due invoices.</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">INV-{String(r.id).slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{studentName(r)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.student?.section?.class?.name || "—"}/{r.student?.section?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.group?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.fee?.dueDate ? new Date(r.fee.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 font-medium text-red-600">{fmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
