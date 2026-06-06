/**
 * FinancialReportsPage.jsx — income summary derived from fee collections
 * GET /fees/reports/collection?startDate&endDate
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, ProgressBar } from "../../components/ui";
import { BarChart2 } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const firstOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

export default function FinancialReportsPage() {
  usePageTitle("Financial Reports");
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

  useEffect(() => { load(); }, []);

  const collections = data.collections || [];
  const income = collections.filter(c => c.status === "COMPLETED").reduce((s, c) => s + Number(c.amount), 0);
  const receivable = collections.filter(c => c.status === "PENDING").reduce((s, c) => s + Number(c.amount), 0);
  const gross = income + receivable;
  const realised = gross ? Math.round((income / gross) * 100) : 0;

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Income realisation" icon={<BarChart2 size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Generate"}</Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Income (realised)</p><p className="text-2xl font-bold text-emerald-600">{fmt(income)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Receivable</p><p className="text-2xl font-bold text-amber-600">{fmt(receivable)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Gross Billed</p><p className="text-2xl font-bold text-slate-800">{fmt(gross)}</p></Card>
      </div>
      <Card title="Realisation Rate">
        <div className="py-2">
          <ProgressBar value={realised} max={100} color="emerald" label={`${realised}% of billed fees collected`} />
          {!loading && collections.length === 0 && <p className="text-center text-slate-400 text-sm mt-6">No financial activity in this period.</p>}
        </div>
      </Card>
    </div>
  );
}
