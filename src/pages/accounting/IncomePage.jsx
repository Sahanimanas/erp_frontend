/**
 * IncomePage.jsx — income summary from fee collections
 * GET /fees/reports/collection?startDate&endDate
 * NOTE: standalone income/expense ledger needs the accounting module (separate slice);
 * this surfaces realised fee income, the only income source currently modelled.
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { TrendingUp } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

export default function IncomePage() {
  usePageTitle("Income");
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
      setError(err.response?.data?.error || err.message || "Failed to load income");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, []);

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  // Group income by month
  const byMonth = {};
  rows.forEach(r => {
    const d = r.paidDate ? new Date(r.paidDate) : null;
    const key = d ? d.toLocaleString("en-US", { month: "short", year: "numeric" }) : "—";
    byMonth[key] = (byMonth[key] || 0) + Number(r.amount);
  });

  return (
    <div>
      <PageHeader title="Income" subtitle="Fee income (realised)" icon={<TrendingUp size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Generate"}</Button>
          <span className="ml-auto text-sm text-slate-500">Total Income: <span className="font-bold text-emerald-600 text-lg">{fmt(total)}</span></span>
        </div>
      </Card>
      <Card title="Income by Month" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Month", "Income"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={2} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : Object.keys(byMonth).length === 0 ? <tr><td colSpan={2} className="px-4 py-10 text-center text-slate-400">No income in this period.</td></tr>
              : Object.entries(byMonth).map(([m, v]) => (
                <tr key={m} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{m}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{fmt(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
