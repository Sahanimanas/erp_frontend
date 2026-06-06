/**
 * MonthlyReportPage.jsx — monthly student attendance per section
 * GET /attendance/sections/:sectionId/monthly?sectionId&month&year
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge } from "../../components/ui";
import { Calendar } from "lucide-react";
import apiClient from "../../services/axios";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const now = new Date();

export default function MonthlyReportPage() {
  usePageTitle("Monthly Report");
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/sections");
        if (res.data.success) {
          const list = res.data.data || [];
          setSections(list);
          if (list[0]) setSectionId(list[0].id);
        }
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/attendance/sections/${sectionId}/monthly?sectionId=${sectionId}&month=${month}&year=${year}`);
      if (res.data.success) setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load report");
    } finally { setLoading(false); }
  }, [sectionId, month, year]);

  const sectionOptions = [{ value: "", label: "Select section" }, ...sections.map(s => ({ value: s.id, label: `${s.class?.name || "Class"} - ${s.name}` }))];
  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
  const yearOptions = [year - 1, year, year + 1].map(y => ({ value: y, label: String(y) }));

  return (
    <div>
      <PageHeader title="Monthly Report" subtitle="Student attendance by section" icon={<Calendar size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Section" value={sectionId} onChange={e => setSectionId(e.target.value)} options={sectionOptions} className="w-48" />
          <Select label="Month" value={month} onChange={e => setMonth(Number(e.target.value))} options={monthOptions} className="w-40" />
          <Select label="Year" value={year} onChange={e => setYear(Number(e.target.value))} options={yearOptions} className="w-32" />
          <Button onClick={load} disabled={loading || !sectionId}>{loading ? "Loading…" : "Generate"}</Button>
        </div>
      </Card>
      <Card title="Attendance Summary" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Roll", "Student", "Present", "Absent", "Total", "%"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Select filters and click Generate.</td></tr>
              : rows.map(r => (
                <tr key={r.studentId} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{r.rollNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.name}</td>
                  <td className="px-4 py-3 text-emerald-600">{r.present}</td>
                  <td className="px-4 py-3 text-red-600">{r.absent}</td>
                  <td className="px-4 py-3 text-slate-600">{r.total}</td>
                  <td className="px-4 py-3"><Badge variant={r.percentage >= 75 ? "success" : r.percentage >= 50 ? "warning" : "danger"}>{r.percentage}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
