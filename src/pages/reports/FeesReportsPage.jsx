/**
 * FeesReportsPage.jsx — fee collection report over a date range
 * GET /fees/reports/collection?startDate&endDate
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Badge } from "../../components/ui";
import { DollarSign } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

export default function FeesReportsPage() {
  usePageTitle("Fees Reports");
  const [range, setRange] = useState({ startDate: firstOfYear(), endDate: today() });
  const [data, setData] = useState({ collections: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/fees/reports/collection?startDate=${range.startDate}&endDate=${range.endDate}`);
      if (res.data.success) setData(res.data.data || { collections: [] });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load report");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, []); // initial load

  const collections = data.collections || [];
  const completed = collections.filter(c => c.status === "COMPLETED");
  const collected = completed.reduce((s, c) => s + Number(c.amount), 0);
  const pending = collections.filter(c => c.status === "PENDING").reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div>
      <PageHeader title="Fees Reports" subtitle="Collection over a period" icon={<DollarSign size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Generate"}</Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Collected</p><p className="text-2xl font-bold text-emerald-600">{fmt(collected)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Pending</p><p className="text-2xl font-bold text-amber-600">{fmt(pending)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Transactions</p><p className="text-2xl font-bold text-slate-800">{collections.length}</p></Card>
      </div>
      <Card title="Collections" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Receipt", "Amount", "Status", "Paid Date"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : collections.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No collections in this period.</td></tr>
              : collections.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{c.receiptNo || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{fmt(c.amount)}</td>
                  <td className="px-4 py-3"><Badge variant={c.status === "COMPLETED" ? "success" : "warning"}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{c.paidDate ? new Date(c.paidDate).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
