/**
 * StudentProfilePage.jsx — full student profile
 * GET /students (picker), GET /students/:id (detail with parents/documents)
 * Accepts ?id=<studentId> to deep-link from the student list.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, Badge, Select, Button } from "../../components/ui";
import { User, FileDown } from "lucide-react";
import apiClient from "../../services/axios";
import { printRecord } from "../../utils/printPdf";
import { Loader } from "../../components/loaders/PageLoader";

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

  const dob = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
  const fields = student ? [
    ["Roll Number", student.rollNumber],
    ["Class / Section", `${student.section?.class?.name || "—"} / ${student.section?.name || "—"}`],
    ["Date of Birth", dob(student.dateOfBirth)],
    ["Gender", student.gender],
    ["Blood Group", student.bloodGroup || "—"],
    ["Email", student.user?.email || "—"],
    ["Phone", student.user?.phone || "—"],
    ["Admission No.", student.admissionNumber || "—"],
    ["Registration No.", student.registrationNo || "—"],
    ["Category", student.category || "—"],
    ["Caste", student.caste || "—"],
    ["Religion", student.religion || "—"],
    ["Aadhar", student.aadharNumber || "—"],
    ["PEN", student.penNumber || "—"],
    ["APAAR No.", student.apaarNo || "—"],
    ["Smart Card", student.smartCardNo || "—"],
    ["Height / Weight", `${student.height || "—"} / ${student.weight || "—"}`],
    ["Father Name", student.fatherName || "—"],
    ["Mother Name", student.motherName || "—"],
    ["Guardian", student.guardianName || "—"],
    ["Guardian Phone", student.guardianPhone || "—"],
    ["Father Aadhar", student.fatherAadhar || "—"],
    ["Mother Aadhar", student.motherAadhar || "—"],
    ["Father Occupation", student.fatherOccupation || "—"],
    ["Mother Occupation", student.motherOccupation || "—"],
    ["Father Qualification", student.fatherQualification || "—"],
    ["Mother Qualification", student.motherQualification || "—"],
    ["Guardian Email", student.guardianEmail || "—"],
    ["City / Pincode", `${student.city || "—"} / ${student.pincode || "—"}`],
    ["Current Address", student.address || "—"],
    ["Permanent Address", student.permanentAddress || "—"],
    ["Hostel", student.hostelAllotted ? (student.hostelName || "Yes") : "No"],
    ["Hostel Room", student.hostelRoomNo || "—"],
    ["Transport", student.transportAllotted ? "Yes" : "No"],
    ["Transport Route / Bus", `${student.transportRoute || "—"} / ${student.busNo || "—"}`],
    ["Fee Plan", student.feePlan || "—"],
    ["Remarks", student.remarks || "—"],
  ] : [];

  const education = Array.isArray(student?.educationHistory) ? student.educationHistory : [];
  const documents = Array.isArray(student?.documents) ? student.documents : [];

  const savePdf = () => {
    if (!student) return;
    printRecord({
      title: "Student Profile",
      subtitle: [name(student), `Roll ${student.rollNumber}`, `${student.section?.class?.name || ""}/${student.section?.name || ""}`].filter(Boolean).join("  ·  "),
      photo: student.photo,
      sections: [
        { heading: "Basic Information", rows: [
          ["Name", name(student)], ["Date of Birth", dob(student.dateOfBirth)], ["Gender", student.gender], ["Blood Group", student.bloodGroup],
          ["Email", student.user?.email], ["Phone", student.user?.phone], ["Smart Card", student.smartCardNo], ["Aadhar", student.aadharNumber],
          ["Religion", student.religion], ["Category", student.category], ["Caste", student.caste], ["Height", student.height], ["Weight", student.weight],
          ["PEN", student.penNumber], ["APAAR No", student.apaarNo], ["Remarks", student.remarks],
        ] },
        { heading: "Admission", rows: [
          ["Class", student.section?.class?.name], ["Section", student.section?.name], ["Roll Number", student.rollNumber],
          ["Admission No", student.admissionNumber], ["Registration No", student.registrationNo], ["Fee Plan", student.feePlan],
          ["Admission Date", dob(student.admissionDate)],
        ] },
        { heading: "Parent & Communication", rows: [
          ["Father Name", student.fatherName], ["Mother Name", student.motherName], ["Father Occupation", student.fatherOccupation], ["Mother Occupation", student.motherOccupation],
          ["Guardian Name", student.guardianName], ["Guardian Phone", student.guardianPhone], ["Guardian Email", student.guardianEmail],
          ["City", student.city], ["Pincode", student.pincode], ["Current Address", student.address], ["Permanent Address", student.permanentAddress],
        ] },
        { heading: "Hostel & Transport", rows: [
          ["Hostel", student.hostelAllotted ? "Yes" : "No"], ["Hostel Name", student.hostelName], ["Hostel Room", student.hostelRoomNo],
          ["Transport", student.transportAllotted ? "Yes" : "No"], ["Transport Route", student.transportRoute], ["Bus No", student.busNo],
        ] },
      ],
    });
  };

  return (
    <div>
      <PageHeader title="Student Profile" subtitle="Complete student record" icon={<User size={18} />}>
        {student && <Button variant="outline" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>}
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <Select label="Student" value={studentId} onChange={e => onPick(e.target.value)} options={options} className="max-w-md" />
      </Card>

      {loading ? (
        <Card><Loader label="Loading profile…" /></Card>
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

          {/* Prior education history */}
          {education.length > 0 && (
            <Card title="Academic / Prior Education" className="mt-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    {["Course / Class", "Passing Year", "Marks / Grade", "College / School"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {education.map((e, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-[12.5px] text-slate-700">{e.courseName || "—"}</td>
                        <td className="px-4 py-2 text-[12.5px] text-slate-600">{e.passingYear || "—"}</td>
                        <td className="px-4 py-2 text-[12.5px] text-slate-600">{e.marksOrGrade || "—"}</td>
                        <td className="px-4 py-2 text-[12.5px] text-slate-600">{e.schoolName || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Uploaded documents */}
          {documents.length > 0 && (
            <Card title="Documents" className="mt-5">
              <ul className="divide-y divide-slate-50">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-1 py-2 text-sm">
                    <span className="text-slate-700">{d.type || "Document"}</span>
                    {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-[12px] hover:underline">View / Download</a>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
