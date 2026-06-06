/**
 * FeesPayInvoicePage.jsx — paid fee invoices/receipts
 * GET /fees/reports/collection?startDate&endDate (COMPLETED collections)
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Badge } from "../../components/ui";
import { FileText, Printer } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

export default function FeesPayInvoicePage() {
  usePageTitle("Fees Pay / Invoice");
  const [range, setRange] = useState({ startDate: firstOfYear(), endDate: today() });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/fees/reports/collection?startDate=${range.startDate}&endDate=${range.endDate}`);
      if (res.data.success) setRows((res.data.data?.collections || []).filter(c => c.status === "COMPLETED"));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load invoices");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, []);

  const studentName = (r) => r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : "—";

  return (
    <div>
      <PageHeader title="Fees Pay / Invoice" subtitle="Paid fee invoices" icon={<FileText size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} onClick={() => window.print()} disabled={rows.length === 0}>Print</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Search"}</Button>
        </div>
      </Card>
      <Card title={`Invoices (${rows.length})`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Invoice #", "Receipt", "Student", "Roll", "Amount", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No invoices in this period.</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">INV-{String(r.id).slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{r.receiptNo || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{studentName(r)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{r.student?.rollNumber || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{fmt(r.amount)}</td>
                  <td className="px-4 py-3"><Badge variant="success">Paid</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
