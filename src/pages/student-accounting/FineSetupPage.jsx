/**
 * FineSetupPage.jsx — late-fee fines per fee allocation
 * GET /sections, GET /fees/structures?sectionId
 * Fines are configured when a fee is allocated (Fees Allocation); this shows
 * the fine attached to each allocation for a chosen section.
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Badge } from "../../components/ui";
import { AlertTriangle } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FineSetupPage() {
  usePageTitle("Fine Setup");
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/sections");
        if (res.data.success) { setSections(res.data.data || []); if (res.data.data?.[0]) setSectionId(res.data.data[0].id); }
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!sectionId) { setFees([]); return; }
    setLoading(true); setError("");
    try {
      const res = await apiClient.get(`/fees/structures?sectionId=${sectionId}`);
      if (res.data.success) setFees(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load fines");
    } finally { setLoading(false); }
  }, [sectionId]);

  useEffect(() => { load(); }, [load]);

  const sectionOptions = sections.map(s => ({ value: s.id, label: `${s.class?.name || "Class"} - ${s.name}` }));

  return (
    <div>
      <PageHeader title="Fine Setup" subtitle="Late-fee fines per allocation" icon={<AlertTriangle size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded-lg text-xs">
        Fines are set when allocating a fee to a section in <strong>Fees Allocation</strong>. This page lists the configured fines.
      </div>
      <Card className="mb-5">
        <Select label="Section" value={sectionId} onChange={e => setSectionId(e.target.value)} options={sectionOptions} className="max-w-sm" />
      </Card>
      <Card title="Configured Fines" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Fee Group", "Due Date", "Fine (after due date)"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : fees.length === 0 ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No fee allocations for this section yet.</td></tr>
              : fees.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{f.group?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><Badge variant={Number(f.fine) > 0 ? "warning" : "default"}>{fmt(f.fine)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
