/**
 * StudentProfilePage.jsx — full student profile
 * GET /students (picker), GET /students/:id (detail with parents/documents)
 * Accepts ?id=<studentId> to deep-link from the student list.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, Badge, Select } from "../../components/ui";
import { User } from "lucide-react";
import apiClient from "../../services/axios";

export default function StudentProfilePage() {
  usePageTitle("Student Profile");
  const [params, setParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState(params.get("id") || "");
  const [student, setStudent] = useState(null);
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

  useEffect(() => {
    if (!studentId) { setStudent(null); return; }
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get(`/students/${studentId}`);
        if (res.data.success) setStudent(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load student");
        setStudent(null);
      } finally { setLoading(false); }
    })();
  }, [studentId]);

  const onPick = (id) => { setStudentId(id); setParams(id ? { id } : {}); };
  const name = (s) => s?.user ? `${s.user.firstName} ${s.user.lastName}` : "—";
  const options = [{ value: "", label: "Select student" }, ...students.map(s => ({ value: s.id, label: `${s.rollNumber} · ${name(s)}` }))];

  const fields = student ? [
    ["Roll Number", student.rollNumber],
    ["Class / Section", `${student.section?.class?.name || "—"} / ${student.section?.name || "—"}`],
    ["Date of Birth", student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN") : "—"],
    ["Gender", student.gender],
    ["Blood Group", student.bloodGroup || "—"],
    ["Email", student.user?.email || "—"],
    ["Phone", student.user?.phone || "—"],
    ["Admission No.", student.admissionNumber || "—"],
  ] : [];

  return (
    <div>
      <PageHeader title="Student Profile" subtitle="Complete student record" icon={<User size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <Select label="Student" value={studentId} onChange={e => onPick(e.target.value)} options={options} className="max-w-md" />
      </Card>

      {loading ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Loading…</div></Card>
      ) : !student ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Select a student to view their profile.</div></Card>
      ) : (
        <>
          <Card className="mb-5">
            <div className="flex items-center gap-4">
              <Avatar name={name(student)} size="lg" src={student.photo || undefined} />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{name(student)}</h3>
                <p className="text-xs text-slate-400">Roll {student.rollNumber}</p>
                <Badge variant="success" className="mt-1">{student.section?.class?.name || ""}/{student.section?.name || ""}</Badge>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Details">
              <div className="grid grid-cols-2 gap-3">
                {fields.map(([l, v]) => (
                  <div key={l} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{l}</p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5 break-words">{v || "—"}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Guardians">
              {(student.parents || []).length === 0 ? (
                <p className="text-slate-400 text-sm">No guardians linked.</p>
              ) : (
                <ul className="space-y-2">
                  {student.parents.map(p => (
                    <li key={p.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                      <Avatar name={p.user ? `${p.user.firstName} ${p.user.lastName}` : "?"} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.user ? `${p.user.firstName} ${p.user.lastName}` : "—"}</p>
                        <p className="text-[11px] text-slate-400">{p.relationship} · {p.user?.phone || p.user?.email || "—"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
