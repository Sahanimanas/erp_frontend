/**
 * CollectFeesPage.jsx — collect fees for a section + fee group
 * GET /sections, /fees/groups, /fees/types
 * GET /students?sectionId, GET /fees/structures?sectionId
 * POST /fees/collections { studentId, feeId, amount }
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge, Avatar, ExportButton } from "../../components/ui";
import { DollarSign, Search } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function CollectFeesPage() {
  usePageTitle("Collect Fees");
  const [sections, setSections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [filter, setFilter] = useState({ sectionId: "", groupId: "" });
  const [students, setStudents] = useState([]);
  const [fee, setFee] = useState(null);      // the Fee (structure) for section+group
  const [collected, setCollected] = useState({}); // studentId -> receiptNo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, g, t] = await Promise.all([apiClient.get("/sections"), apiClient.get("/fees/groups"), apiClient.get("/fees/types")]);
        if (s.data.success) setSections(s.data.data || []);
        if (g.data.success) setGroups(g.data.data || []);
        if (t.data.success) setTypes(t.data.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const groupTotal = (groupId) => types.filter(t => t.groupId === groupId).reduce((s, t) => s + Number(t.amount), 0);

  const doFilter = useCallback(async () => {
    if (!filter.sectionId || !filter.groupId) { setError("Select a section and fee group"); return; }
    setLoading(true); setError(""); setSearched(true); setCollected({});
    try {
      const [stu, fees] = await Promise.all([
        apiClient.get(`/students?sectionId=${filter.sectionId}&limit=500`),
        apiClient.get(`/fees/structures?sectionId=${filter.sectionId}`),
      ]);
      setStudents(stu.data.success ? (stu.data.data || []) : []);
      const matched = (fees.data.data || []).find(f => f.groupId === filter.groupId) || null;
      setFee(matched);
      if (!matched) setError("No fee is allocated to this section for the selected group. Allocate it first in Fees Allocation.");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load students");
    } finally { setLoading(false); }
  }, [filter]);

  const collect = async (studentId) => {
    if (!fee) return;
    setError("");
    try {
      const res = await apiClient.post("/fees/collections", { studentId, feeId: fee.id, amount: groupTotal(filter.groupId) });
      if (res.data.success) setCollected(c => ({ ...c, [studentId]: res.data.data?.receiptNo || "PAID" }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to collect fee");
    }
  };

  const amount = groupTotal(filter.groupId);
  const sectionOptions = [{ value: "", label: "Select section" }, ...sections.map(s => ({ value: s.id, label: `${s.class?.name || "Class"} - ${s.name}` }))];
  const groupOptions = [{ value: "", label: "Select group" }, ...groups.map(g => ({ value: g.id, label: g.name }))];
  const name = (s) => s.user ? `${s.user.firstName} ${s.user.lastName}` : "—";

  return (
    <div>
      <PageHeader title="Collect Fees" subtitle="Record fee payments" icon={<DollarSign size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5" title="Select Ground">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select label="Section *" value={filter.sectionId} onChange={e => setFilter(f => ({ ...f, sectionId: e.target.value }))} options={sectionOptions} />
          <Select label="Fee Group *" value={filter.groupId} onChange={e => setFilter(f => ({ ...f, groupId: e.target.value }))} options={groupOptions} />
          <Button icon={<Search size={13} />} onClick={doFilter} disabled={loading}>{loading ? "Loading…" : "Filter"}</Button>
        </div>
        {filter.groupId ? <p className="text-xs text-slate-500 mt-3">Payable for this group: <span className="font-bold text-slate-700">{fmt(amount)}</span></p> : null}
      </Card>

      {searched && (
        <Card
          title={`Students (${students.length})`}
          noPadding
          action={
            <ExportButton
              filename="collect-fees.csv"
              rows={students}
              columns={[
                { label: "Roll", get: (s) => s.rollNumber },
                { label: "Student", get: (s) => name(s) },
                { label: "Payable", get: () => amount },
                { label: "Status", get: (s) => (collected[s.id] ? "Paid" : "Due") },
                { label: "Receipt No", get: (s) => (collected[s.id] && collected[s.id] !== "PAID" ? collected[s.id] : "") },
              ]}
            />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Roll", "Student", "Payable", "Status", "Action"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
                : students.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No students in this section.</td></tr>
                : students.map(s => {
                  const paid = collected[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-[11px] text-indigo-600">{s.rollNumber}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={name(s)} size="sm" /><span className="font-medium text-slate-700">{name(s)}</span></div></td>
                      <td className="px-4 py-3 font-medium text-slate-700">{fmt(amount)}</td>
                      <td className="px-4 py-3">{paid ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Due</Badge>}</td>
                      <td className="px-4 py-3">
                        {paid ? <span className="text-[11px] font-mono text-emerald-600">{paid}</span>
                          : <Button size="xs" disabled={!fee} onClick={() => collect(s.id)}>Collect</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
