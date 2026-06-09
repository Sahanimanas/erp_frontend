/**
 * TransferCertPage.jsx — generate a Transfer Certificate for a student
 * GET /students (picker) + GET /students/:id
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select } from "../../components/ui";
import { FileText, Printer } from "lucide-react";
import apiClient from "../../services/axios";

export default function TransferCertPage() {
  usePageTitle("Transfer Certificate");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/students?limit=500");
        if (res.data.success) setStudents(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load students");
      }
    })();
  }, []);

  const s = students.find(x => x.id === studentId);
  const name = (st) => st?.user ? `${st.user.firstName} ${st.user.lastName}` : "—";
  const options = [{ value: "", label: "Select student" }, ...students.map(st => ({ value: st.id, label: `${st.rollNumber} · ${name(st)}` }))];
  const todayStr = new Date().toLocaleDateString("en-IN");

  return (
    <div>
      <PageHeader title="Transfer Certificate" subtitle="Generate a TC" icon={<FileText size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} onClick={() => window.print()} disabled={!s}>Print</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <Select label="Student" value={studentId} onChange={e => setStudentId(e.target.value)} options={options} className="max-w-md" />
      </Card>

      {!s ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Select a student to generate their Transfer Certificate.</div></Card>
      ) : (
        <Card>
          <div className="max-w-2xl mx-auto py-6">
            <div className="text-center border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-800">GlobalSchoolMitra School</h2>
              <p className="text-xs text-slate-500">123 Education Street, New York</p>
              <p className="mt-3 inline-block border border-slate-300 rounded-md px-4 py-1 font-semibold text-slate-700">TRANSFER CERTIFICATE</p>
            </div>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>This is to certify that <strong>{name(s)}</strong>, bearing Roll Number <strong>{s.rollNumber}</strong>
                {s.admissionNumber ? <> (Admission No. <strong>{s.admissionNumber}</strong>)</> : null}, was a bona fide student of this institution.</p>
              <div className="grid grid-cols-2 gap-3 py-4">
                {[["Class / Section", `${s.section?.class?.name || "—"} / ${s.section?.name || "—"}`],
                  ["Date of Birth", s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("en-IN") : "—"],
                  ["Gender", s.gender || "—"],
                  ["Blood Group", s.bloodGroup || "—"],
                  ["Admission Date", s.admissionDate ? new Date(s.admissionDate).toLocaleDateString("en-IN") : "—"],
                  ["Date of Issue", todayStr]].map(([l, v]) => (
                  <div key={l} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{l}</p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <p>The student has no dues pending and their conduct was found to be satisfactory.</p>
              <div className="flex justify-between pt-12">
                <div className="text-center"><div className="w-40 border-t border-slate-400" /><p className="text-xs text-slate-500 mt-1">Class Teacher</p></div>
                <div className="text-center"><div className="w-40 border-t border-slate-400" /><p className="text-xs text-slate-500 mt-1">Principal</p></div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
