/**
 * Student → Upload Student
 * Bulk-import students from a CSV file into a selected class. Columns:
 *   firstName,lastName,rollNumber,gender,dateOfBirth,phone,admissionNumber,section
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge } from "../../components/ui";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useImportStudentsMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const SAMPLE = "firstName,lastName,rollNumber,gender,dateOfBirth,phone,admissionNumber,section\nJohn,Doe,R001,Male,2012-04-01,9876500001,ADM2001,A\nJane,Roe,R002,Female,2012-08-15,9876500002,ADM2002,A";

// Minimal CSV parser (handles quoted values).
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, i, a) => i < a.length - 1) ?? line.split(",");
    const row = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? "").replace(/^"|"$/g, "").trim(); });
    return row;
  });
}

export default function UploadStudentPage() {
  usePageTitle("Upload Student");
  const [classId, setClassId] = useState("");
  const [year, setYear] = useState("");
  const [feePlan, setFeePlan] = useState("REGULAR");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [importStudents, { isLoading }] = useImportStudentsMutation();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try { setRows(parseCsv(String(reader.result))); setResult(null); }
      catch { toast.error("Could not parse CSV"); }
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "student-upload-sample.csv"; a.click();
  };

  const upload = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    if (!rows.length) { toast.error("Choose a CSV file first"); return; }
    const students = rows.map((r) => ({
      firstName: r.firstName, lastName: r.lastName, rollNumber: r.rollNumber,
      gender: r.gender, dateOfBirth: r.dateOfBirth, phone: r.phone,
      admissionNumber: r.admissionNumber, classId, sectionName: r.section || "A",
    }));
    try {
      const res = await importStudents(students).unwrap();
      setResult(res);
      toast.success(`Imported ${res.imported} student(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Import failed");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader title="Upload Student" subtitle="Bulk-import students from a CSV file" icon={<Upload size={18} />} />

      <Card title="Select Session and Class">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={year} onChange={(e) => setYear(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan" value={feePlan} onChange={(e) => setFeePlan(e.target.value)}
            options={["REGULAR", "PROMOTION"].map((p) => ({ value: p, label: p }))} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm cursor-pointer hover:border-indigo-300">
              <FileSpreadsheet size={15} /> {fileName || "Choose CSV file"}
              <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
            </label>
            <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={downloadSample}>Download Sample CSV</Button>
            {rows.length > 0 && <Badge variant="info">{rows.length} rows parsed</Badge>}
          </div>
          <Button icon={<Upload size={14} />} loading={isLoading} disabled={!rows.length || !classId} onClick={upload}>Upload</Button>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card title="Preview" subtitle={`${rows.length} rows`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {Object.keys(rows[0]).map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="px-3 py-2 text-[12px] text-slate-600">{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && <p className="px-4 py-2 text-[11px] text-slate-400">…and {rows.length - 10} more</p>}
        </Card>
      )}

      {result && (
        <Card title="Import Result">
          <div className="p-5 space-y-2">
            <p className="text-sm text-emerald-600 font-semibold">✓ Imported {result.imported}</p>
            {result.failed > 0 && (
              <>
                <p className="text-sm text-red-500 font-semibold">✗ Failed {result.failed}</p>
                <ul className="text-[11px] text-slate-500 list-disc pl-5 space-y-0.5">
                  {result.errors?.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
