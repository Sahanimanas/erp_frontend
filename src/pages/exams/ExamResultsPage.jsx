/**
 * ExamResultsPage.jsx — class rankings for an exam + section
 * GET /exams, GET /sections, GET /exams/:examId/sections/:sectionId/rankings
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge } from "../../components/ui";
import { BarChart2 } from "lucide-react";
import apiClient from "../../services/axios";

export default function ExamResultsPage() {
  usePageTitle("Exam Results");
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [examId, setExamId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [e, s] = await Promise.all([apiClient.get("/exams?limit=100"), apiClient.get("/sections")]);
        if (e.data.success) { setExams(e.data.data || []); if (e.data.data?.[0]) setExamId(e.data.data[0].id); }
        if (s.data.success) { setSections(s.data.data || []); if (s.data.data?.[0]) setSectionId(s.data.data[0].id); }
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!examId || !sectionId) return;
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/exams/${examId}/sections/${sectionId}/rankings`);
      if (res.data.success) setRows(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.rankings || []));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load results");
    } finally { setLoading(false); }
  }, [examId, sectionId]);

  const examOptions = exams.map(e => ({ value: e.id, label: e.name }));
  const sectionOptions = sections.map(s => ({ value: s.id, label: `${s.class?.name || "Class"} - ${s.name}` }));

  return (
    <div>
      <PageHeader title="Exam Results" subtitle="Class rankings" icon={<BarChart2 size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Exam" value={examId} onChange={e => setExamId(e.target.value)} options={[{ value: "", label: "Select exam" }, ...examOptions]} className="w-56" />
          <Select label="Section" value={sectionId} onChange={e => setSectionId(e.target.value)} options={[{ value: "", label: "Select section" }, ...sectionOptions]} className="w-48" />
          <Button onClick={load} disabled={loading || !examId || !sectionId}>{loading ? "Loading…" : "View Results"}</Button>
        </div>
      </Card>
      <Card title="Rankings" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Rank", "Student", "Roll", "Total", "Percentage"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No marks entered for this exam/section yet.</td></tr>
              : rows.map((r, i) => (
                <tr key={r.studentId || i} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3"><Badge variant={i === 0 ? "success" : "default"}>#{r.rank ?? i + 1}</Badge></td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.name || r.studentName || (r.student?.user ? `${r.student.user.firstName} ${r.student.user.lastName}` : "—")}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{r.rollNumber || r.student?.rollNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.total ?? r.totalMarks ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{r.percentage != null ? `${r.percentage}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
