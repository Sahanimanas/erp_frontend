/**
 * AttendanceReportsPage.jsx — attendance statistics over a date range
 * GET /attendance/statistics?startDate&endDate  →  { student: {PRESENT,ABSENT,...}, employee: {...} }
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, ProgressBar } from "../../components/ui";
import { UserCheck } from "lucide-react";
import apiClient from "../../services/axios";

const startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);

function Breakdown({ title, stats }) {
  const present = stats?.PRESENT || 0;
  const absent = stats?.ABSENT || 0;
  const late = stats?.LATE || 0;
  const leave = stats?.LEAVE || 0;
  const totalMarked = present + absent + late + leave + (stats?.HALF_DAY || 0);
  const rate = totalMarked ? Math.round((present / totalMarked) * 100) : 0;
  return (
    <Card title={title}>
      <ProgressBar value={rate} max={100} color="indigo" label={`${rate}% present`} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[["Present", present, "text-emerald-600"], ["Absent", absent, "text-red-600"], ["Late", late, "text-amber-600"], ["Leave", leave, "text-blue-600"]].map(([l, v, c]) => (
          <div key={l} className="bg-slate-50 rounded-lg p-3 text-center">
            <p className={`text-xl font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase">{l}</p>
          </div>
        ))}
      </div>
      {totalMarked === 0 && <p className="text-center text-slate-400 text-sm mt-4">No records in this period.</p>}
    </Card>
  );
}

export default function AttendanceReportsPage() {
  usePageTitle("Attendance Reports");
  const [range, setRange] = useState({ startDate: startOfMonth(), endDate: today() });
  const [data, setData] = useState({ student: {}, employee: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/attendance/statistics?startDate=${range.startDate}&endDate=${range.endDate}`);
      if (res.data.success) setData(res.data.data || { student: {}, employee: {} });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load report");
    } finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Attendance Reports" subtitle="Present/absent statistics" icon={<UserCheck size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
          <Input label="To" type="date" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading…" : "Generate"}</Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Breakdown title="Student Attendance" stats={data.student} />
        <Breakdown title="Staff Attendance" stats={data.employee} />
      </div>
    </div>
  );
}
