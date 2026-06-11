/**
 * MultipleImportPage.jsx
 * Module : admission
 * Page   : Multiple Import — bulk-import students from an Excel (.xlsx) or CSV
 *          file. Headers are matched flexibly; if the file has a Class column,
 *          the class is auto-created. Creates real Student records via
 *          /students/import (they then appear in Student Details, etc.).
 */
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge } from "../../components/ui";
import { Download, UploadCloud, FileSpreadsheet } from "lucide-react";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useImportStudentsMutation } from "../../redux/api/studentsApi";
import { aliasStudentRow, parseStudentsFile, downloadStudentSample } from "../../utils/studentImport";

const SECTIONS_AZ = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const instructions = [
  "Download the sample file and fill in the student details.",
  "Supported formats: Excel (.xlsx / .xls) and CSV.",
  "If your file has a Class column, the class is created automatically — you don't have to pick one.",
  "Dates (Date of Birth / Admission Date) should be Y-m-d, e.g. 2026-05-26 (missing dates default automatically).",
  "Gender: Male / Female / Other (defaults to Male if blank).",
];
const notes = [
  { label: "Headers are flexible", text: "— Student Name, Roll No, Father Name, Contact No, Class, Section are matched automatically." },
  { label: "Roll number optional", text: "— a unique Student Id / Registration No is used as the roll number when present." },
  { label: "", text: "Imported students show up immediately in Student Details, Online Admission List, fees-by-class and the dashboard — and admin can edit them." },
];

export default function MultipleImportPage() {
  usePageTitle("Multiple Import");
  const { data: classes = [] } = useGetClassesQuery();
  const [importStudents, { isLoading }] = useImportStudentsMutation();

  const [classId, setClassId] = useState("");
  const [section, setSection] = useState("");
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const onPick = async (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setParsing(true);
    try {
      const parsed = await parseStudentsFile(f);
      setRows(parsed);
      if (!parsed.length) toast.error("The file has no data rows");
    } catch (e) {
      console.error(e);
      toast.error("Could not read the file. Use the sample template format.");
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async () => {
    if (!rows.length) { toast.error("Upload a file with student rows"); return; }
    const students = rows.map(aliasStudentRow).map((r) => ({
      ...r,
      ...(classId ? { classId } : {}),
      sectionName: r.section || section || "A",
      feePlan: r.feePlan || "REGULAR",
    }));
    if (!classId && !students.some((s) => s.className || s.class)) {
      toast.error("Pick a class, or include a Class column in the file");
      return;
    }
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
    <div>
      <PageHeader title="Multiple Import" subtitle="Bulk-import students via Excel or CSV" icon={<UploadCloud size={18} />} />

      <Card>
        <div className="p-5 space-y-6">
          <div className="flex justify-end">
            <Button variant="secondary" icon={<Download size={14} />} onClick={() => downloadStudentSample()}>
              Download Sample Import File
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Instructions:</p>
              <ol className="space-y-1.5">
                {instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-2">
                    <span className="text-indigo-600 font-semibold flex-shrink-0">{i + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="text-xs text-slate-600">
                  {n.label && <span className="font-semibold text-indigo-600">{n.label}: </span>}
                  {n.text}
                </div>
              ))}
            </div>
          </div>

          {/* Class + Section (optional — taken from the file if blank) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Select label="Class (optional — from file if blank)" value={classId} onChange={(e) => setClassId(e.target.value)}
              options={[{ value: "", label: "From file / Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            <Select label="Default Section (used when a row has none)" value={section} onChange={(e) => setSection(e.target.value)}
              options={[{ value: "", label: "From file / Select" }, ...SECTIONS_AZ.map((s) => ({ value: s, label: s }))]} />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Excel / CSV File *</label>
            <div
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                ${file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}
              onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet size={34} className={file ? "text-indigo-600" : "text-slate-300"} />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-indigo-700">{file.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB {parsing ? "· reading…" : rows.length ? `· ${rows.length} rows` : ""}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Drag and drop an .xlsx / .csv file here, or click</p>
              )}
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { onPick(e.target.files[0]); e.target.value = ""; }} />
            </div>
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {previewCols.map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.slice(0, 8).map((r, i) => (
                    <tr key={i}>{previewCols.map((h, j) => <td key={j} className="px-3 py-1.5 text-[12px] text-slate-600 whitespace-nowrap">{String(r[h] ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 8 && <p className="px-3 py-1.5 text-[11px] text-slate-400">…and {rows.length - 8} more</p>}
            </div>
          )}

          {result && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-emerald-600 font-semibold">✓ Imported {result.imported}</p>
              {result.failed > 0 && (
                <>
                  <p className="text-sm text-red-500 font-semibold">✗ Failed {result.failed}</p>
                  <ul className="text-[11px] text-slate-500 list-disc pl-5">{result.errors?.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>
                </>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end items-center">
            {parsing && <Badge variant="warning">Reading file…</Badge>}
            {file && <Button variant="secondary" onClick={() => { setFile(null); setRows([]); setResult(null); }}>Clear</Button>}
            <Button loading={isLoading} disabled={!rows.length} onClick={handleUpload}>Import Students</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
