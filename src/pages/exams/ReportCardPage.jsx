/**
 * ReportCardPage.jsx — per-student exam performance
 * GET /students (picker), GET /exams/students/:studentId/performance
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Badge, Avatar, ExportButton } from "../../components/ui";
import { FileText } from "lucide-react";
import apiClient from "../../services/axios";

export default function ReportCardPage() {
  usePageTitle("Report Cards");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/students?limit=500");
        if (res.data.success) setStudents(res.data.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!studentId) { setPerf(null); return; }
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/exams/students/${studentId}/performance`);
      if (res.data.success) setPerf(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load performance");
      setPerf(null);
    } finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const selected = students.find(s => s.id === studentId);
  const name = (s) => s?.user ? `${s.user.firstName} ${s.user.lastName}` : "—";
  const options = [{ value: "", label: "Select student" }, ...students.map(s => ({ value: s.id, label: `${s.rollNumber} · ${name(s)}` }))];
  const exams = perf?.exams || perf?.results || (Array.isArray(perf) ? perf : []);
  const exportColumns = [
    { label: "Exam", get: (e) => e.examName || e.name || "" },
    { label: "Obtained", get: (e) => e.obtained ?? e.totalObtained ?? e.marks ?? "" },
    { label: "Total", get: (e) => e.total ?? e.totalMarks ?? "" },
    { label: "Percentage", get: (e) => (e.percentage != null ? `${e.percentage}%` : "") },
    { label: "Grade", get: (e) => e.grade || "" },
  ];

  return (
    <div>
      <PageHeader title="Report Cards" subtitle="Student exam performance" icon={<FileText size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <Select label="Student" value={studentId} onChange={e => setStudentId(e.target.value)} options={options} className="max-w-md" />
      </Card>

      {selected && (
        <Card className="mb-5">
          <div className="flex items-center gap-4">
            <Avatar name={name(selected)} size="lg" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{name(selected)}</h3>
              <p className="text-xs text-slate-400">Roll {selected.rollNumber} · {selected.section?.class?.name || ""}/{selected.section?.name || ""}</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Performance" noPadding>
        <div className="flex justify-end p-3 border-b border-slate-100">
          <ExportButton filename="report-card.csv" rows={exams} columns={exportColumns} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Exam", "Obtained", "Total", "Percentage", "Grade"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : !studentId ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Select a student to view their report card.</td></tr>
              : exams.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No exam results recorded for this student.</td></tr>
              : exams.map((e, i) => (
                <tr key={e.examId || i} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{e.examName || e.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{e.obtained ?? e.totalObtained ?? e.marks ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{e.total ?? e.totalMarks ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{e.percentage != null ? `${e.percentage}%` : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="default">{e.grade || "—"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
