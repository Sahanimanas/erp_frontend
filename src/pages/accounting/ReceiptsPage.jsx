/**
 * ReceiptsPage.jsx — paid fee receipts (COMPLETED collections)
 * GET /fees/reports/collection?startDate&endDate
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { Receipt } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

export default function ReceiptsPage() {
  usePageTitle("Receipts");
  const [range, setRange] = useState({ startDate: firstOfYear(), endDate: today() });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/fees/reports/collection?startDate=${range.startDate}&endDate=${range.endDate}`);
      if (res.data.success) {
        const collections = res.data.data?.collections || [];
        setRows(collections.filter(c => c.status === "COMPLETED"));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load receipts");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, []);

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div>
      <PageHeader title="Receipts" subtitle="Issued fee receipts" icon={<Receipt size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Search"}</Button>
          <span className="ml-auto text-sm text-slate-500">Total: <span className="font-bold text-emerald-600">{fmt(total)}</span></span>
        </div>
      </Card>
      <Card title={`Receipts (${rows.length})`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Receipt No", "Amount", "Paid Date", "Remarks"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No receipts in this period.</td></tr>
              : rows.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600 font-semibold">{r.receiptNo || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.paidDate ? new Date(r.paidDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
