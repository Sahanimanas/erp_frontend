/**
 * ExamReportsPage.jsx — list of exams from GET /exams
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge } from "../../components/ui";
import { FileText } from "lucide-react";
import apiClient from "../../services/axios";

export default function ExamReportsPage() {
  usePageTitle("Exam Reports");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/exams?limit=100");
        if (res.data.success) setExams(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load exams");
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Exam Reports" subtitle="Examinations overview" icon={<FileText size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Exam", "Type", "Start", "End"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : exams.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No exams created yet.</td></tr>
              : exams.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{e.name}</td>
                  <td className="px-4 py-3"><Badge variant="default">{(e.type || "").replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{e.startDate ? new Date(e.startDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{e.endDate ? new Date(e.endDate).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
