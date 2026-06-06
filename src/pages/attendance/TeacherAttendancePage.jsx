/**
 * TeacherAttendancePage.jsx — mark staff attendance
 * GET /employees, POST /attendance/employees { employeeId, date, status }
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Avatar, Badge } from "../../components/ui";
import { Briefcase, Save } from "lucide-react";
import apiClient from "../../services/axios";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY"];

export default function TeacherAttendancePage() {
  usePageTitle("Teacher Attendance");
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState({}); // employeeId -> status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/employees?limit=500");
        if (res.data.success) {
          const list = res.data.data || [];
          setEmployees(list);
          const init = {};
          list.forEach(e => { init[e.id] = "PRESENT"; });
          setMarks(init);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load staff");
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true); setError(""); setDone("");
    try {
      const results = await Promise.allSettled(
        employees.map(e => apiClient.post("/attendance/employees", { employeeId: e.id, date, status: marks[e.id] }))
      );
      const failed = results.filter(r => r.status === "rejected").length;
      if (failed) setError(`${failed} record(s) failed to save.`);
      setDone(`Saved attendance for ${employees.length - failed} staff on ${date}.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save attendance");
    } finally { setSaving(false); }
  };

  const name = (e) => e.user ? `${e.user.firstName} ${e.user.lastName}` : (e.employeeCode || "—");

  return (
    <div>
      <PageHeader title="Teacher Attendance" subtitle="Mark staff attendance" icon={<Briefcase size={18} />}>
        <Button size="sm" icon={<Save size={13} />} onClick={save} disabled={saving || loading || employees.length === 0}>{saving ? "Saving…" : "Save Attendance"}</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      {done && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 mb-4 rounded-lg text-sm">{done}</div>}
      <Card className="mb-4">
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} className="max-w-xs" />
      </Card>
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Employee", "Code", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : employees.length === 0 ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No staff found.</td></tr>
              : employees.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={name(e)} size="sm" /><span className="font-medium text-slate-700">{name(e)}</span></div></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{e.employeeCode || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {STATUSES.map(s => (
                        <button key={s} type="button" onClick={() => setMarks(m => ({ ...m, [e.id]: s }))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${marks[e.id] === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
