/**
 * Student → Upload Student
 * Bulk-import students from an Excel (.xlsx) or CSV file into a selected class.
 * Supports the full student field set; the sample template lists every column.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge } from "../../components/ui";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useImportStudentsMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

// Every column the importer understands. `section` maps to the class section
// (A/B/…); booleans accept Yes/No/true/false/1/0.
const COLUMNS = [
  "firstName", "lastName", "rollNumber", "gender", "dateOfBirth", "phone", "email", "section",
  "admissionNumber", "registrationNo", "feePlan", "bloodGroup", "category", "caste", "religion",
  "motherTongue", "aadharNumber", "penNumber", "apaarNo", "smartCardNo", "height", "weight", "remarks",
  "fatherName", "motherName", "fatherAadhar", "motherAadhar", "fatherOccupation", "motherOccupation",
  "fatherQualification", "motherQualification", "guardianName", "guardianPhone", "guardianEmail",
  "address", "permanentAddress", "city", "pincode",
  "hostelAllotted", "hostelName", "hostelRoomNo", "transportAllotted", "transportRoute", "busNo",
];

const SAMPLE_ROWS = [
  {
    firstName: "John", lastName: "Doe", rollNumber: "R001", gender: "Male", dateOfBirth: "2012-04-01",
    phone: "9876500001", email: "", section: "A", admissionNumber: "ADM2001", registrationNo: "REG2001",
    feePlan: "REGULAR", bloodGroup: "O+", category: "General", caste: "", religion: "Hindu",
    motherTongue: "Hindi", aadharNumber: "111122223333", penNumber: "PEN001", apaarNo: "APAAR001",
    smartCardNo: "SC001", height: "4.5", weight: "32", remarks: "",
    fatherName: "Robert Doe", motherName: "Mary Doe", fatherAadhar: "444455556666", motherAadhar: "777788889999",
    fatherOccupation: "Engineer", motherOccupation: "Teacher", fatherQualification: "Graduate", motherQualification: "Post Graduate",
    guardianName: "", guardianPhone: "", guardianEmail: "", address: "12 Main St", permanentAddress: "12 Main St",
    city: "Pune", pincode: "411001", hostelAllotted: "No", hostelName: "", hostelRoomNo: "",
    transportAllotted: "Yes", transportRoute: "Route 5", busNo: "MH12-AB-1234",
  },
  {
    firstName: "Jane", lastName: "Roe", rollNumber: "R002", gender: "Female", dateOfBirth: "2012-08-15",
    phone: "9876500002", email: "", section: "A", admissionNumber: "ADM2002", registrationNo: "REG2002",
    feePlan: "REGULAR", bloodGroup: "A+", category: "OBC", caste: "", religion: "Hindu",
    motherTongue: "Marathi", aadharNumber: "222233334444", penNumber: "PEN002", apaarNo: "APAAR002",
    smartCardNo: "SC002", height: "4.6", weight: "30", remarks: "",
    fatherName: "Sam Roe", motherName: "Lisa Roe", fatherAadhar: "", motherAadhar: "",
    fatherOccupation: "Doctor", motherOccupation: "Homemaker", fatherQualification: "Doctorate", motherQualification: "Graduate",
    guardianName: "", guardianPhone: "", guardianEmail: "", address: "5 Park Rd", permanentAddress: "5 Park Rd",
    city: "Pune", pincode: "411002", hostelAllotted: "Yes", hostelName: "Block A", hostelRoomNo: "A-101",
    transportAllotted: "No", transportRoute: "", busNo: "",
  },
];

export default function UploadStudentPage() {
  usePageTitle("Upload Student");
  const [classId, setClassId] = useState("");
  const [year, setYear] = useState("");
  const [feePlan, setFeePlan] = useState("REGULAR");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [parsing, setParsing] = useState(false);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [importStudents, { isLoading }] = useImportStudentsMutation();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setResult(null);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // raw:false → cells come back as their displayed text (keeps dates/ids as strings)
      const json = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
      if (!json.length) { toast.error("The file has no data rows"); setRows([]); return; }
      setRows(json);
    } catch (err) {
      console.error(err);
      toast.error("Could not read the file. Use the sample template format.");
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  const downloadSample = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: COLUMNS });
    ws["!cols"] = COLUMNS.map(() => ({ wch: 16 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student-upload-sample.xlsx");
  };

  const upload = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    if (!rows.length) { toast.error("Choose an Excel file first"); return; }
    // Pass every column through; the backend picks the fields it knows and
    // coerces Yes/No → boolean. Page-level fee plan applies when a row omits it.
    const students = rows.map((r) => ({
      ...r,
      classId,
      sectionName: r.section || r.sectionName || "A",
      feePlan: r.feePlan || feePlan,
    }));
    try {
      const res = await importStudents(students).unwrap();
      setResult(res);
      toast.success(`Imported ${res.imported} student(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Import failed");
    }
  };

  const previewCols = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader title="Upload Student" subtitle="Bulk-import students from an Excel (.xlsx) or CSV file" icon={<Upload size={18} />} />

      <Card title="Select Session and Class">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={year} onChange={(e) => setYear(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan" value={feePlan} onChange={(e) => setFeePlan(e.target.value)}
            options={["REGULAR", "PROMOTION", "FREE_ADMISSION"].map((p) => ({ value: p, label: p }))} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm cursor-pointer hover:border-indigo-300">
              <FileSpreadsheet size={15} /> {fileName || "Select a .xlsx Excel file"}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
            </label>
            <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={downloadSample}>Download Sample Excel for Upload</Button>
            {parsing && <Badge variant="warning">Reading file…</Badge>}
            {rows.length > 0 && <Badge variant="info">{rows.length} rows parsed</Badge>}
          </div>
          <Button icon={<Upload size={14} />} loading={isLoading} disabled={!rows.length || !classId} onClick={upload}>Upload</Button>
          <p className="text-[11px] text-slate-400">Download the sample to see every supported column. <b>firstName</b>, <b>rollNumber</b>, <b>gender</b>, <b>dateOfBirth</b> (YYYY-MM-DD) and <b>section</b> are required per row; the rest are optional. Hostel/Transport accept Yes/No.</p>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card title="Preview" subtitle={`${rows.length} rows · ${previewCols.length} columns`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {previewCols.map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i}>{previewCols.map((h, j) => <td key={j} className="px-3 py-2 text-[12px] text-slate-600 whitespace-nowrap">{String(r[h] ?? "")}</td>)}</tr>
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
