/**
 * StudentReportsPage.jsx — student analytics derived from GET /students
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge } from "../../components/ui";
import { Users } from "lucide-react";
import apiClient from "../../services/axios";

export default function StudentReportsPage() {
  usePageTitle("Student Reports");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/students?limit=1000");
        if (res.data.success) setStudents(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load report");
      } finally { setLoading(false); }
    })();
  }, []);

  const total = students.length;
  const male = students.filter(s => s.gender === "MALE").length;
  const female = students.filter(s => s.gender === "FEMALE").length;
  const byClass = {};
  students.forEach(s => { const c = s.section?.class?.name || "—"; byClass[c] = (byClass[c] || 0) + 1; });

  const cards = [
    { label: "Total Students", value: total, color: "bg-indigo-50 text-indigo-600" },
    { label: "Male", value: male, color: "bg-blue-50 text-blue-600" },
    { label: "Female", value: female, color: "bg-pink-50 text-pink-600" },
    { label: "Classes", value: Object.keys(byClass).length, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div>
      <PageHeader title="Student Reports" subtitle="Enrollment analytics" icon={<Users size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      {loading ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Loading…</div></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {cards.map(c => (
              <Card key={c.label}>
                <div className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold mb-2 ${c.color}`}>{c.label}</div>
                <p className="text-3xl font-bold text-slate-800">{c.value}</p>
              </Card>
            ))}
          </div>
          <Card title="Students by Class">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Class", "Students", "Share"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(byClass).sort((a,b)=>b[1]-a[1]).map(([cls, n]) => (
                    <tr key={cls} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-slate-700">{cls}</td>
                      <td className="px-4 py-3 text-slate-700">{n}</td>
                      <td className="px-4 py-3"><Badge variant="default">{total ? Math.round((n/total)*100) : 0}%</Badge></td>
                    </tr>
                  ))}
                  {total === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No students yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
