/**
 * Employee → Upload Employee (CSV import → /employees/import)
 * Columns: name,email,phone,employeeCode,role,gender,qualification,fatherName,bloodGroup,rfidNumber
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Badge } from "../../components/ui";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import apiClient from "../../services/axios";

const SAMPLE = "name,email,phone,employeeCode,role,gender,qualification\nRamesh Iyer,ramesh@staff.com,9876500001,EMP101,TEACHER,Male,M.Sc B.Ed\nSunita Rao,sunita@staff.com,9876500002,EMP102,ACCOUNTANT,Female,B.Com";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? "").trim(); });
    return row;
  });
}

export default function UploadEmployeePage() {
  usePageTitle("Upload Employee");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => { try { setRows(parseCsv(String(reader.result))); setResult(null); } catch { toast.error("Could not parse CSV"); } };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "employee-upload-sample.csv"; a.click();
  };

  const upload = async () => {
    if (!rows.length) { toast.error("Choose a CSV file first"); return; }
    setBusy(true);
    try {
      const res = await apiClient.post("/employees/import", { employees: rows });
      setResult(res.data.data);
      toast.success(`Imported ${res.data.data.imported}${res.data.data.failed ? `, ${res.data.data.failed} failed` : ""}`);
    } catch (e) { toast.error(e.response?.data?.error || "Import failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <PageHeader title="Upload Employee" subtitle="Bulk-import staff from a CSV file" icon={<Upload size={18} />} />
      <Card title="Upload Employee">
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm cursor-pointer hover:border-indigo-300">
              <FileSpreadsheet size={15} /> {fileName || "Choose CSV file"}
              <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
            </label>
            <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={downloadSample}>Download Sample Excel for Upload</Button>
            {rows.length > 0 && <Badge variant="info">{rows.length} rows parsed</Badge>}
          </div>
          <Button icon={<Upload size={14} />} loading={busy} disabled={!rows.length} onClick={upload}>Upload</Button>
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
        </Card>
      )}

      {result && (
        <Card title="Import Result">
          <div className="p-5 space-y-2">
            <p className="text-sm text-emerald-600 font-semibold">✓ Imported {result.imported}</p>
            {result.failed > 0 && (
              <>
                <p className="text-sm text-red-500 font-semibold">✗ Failed {result.failed}</p>
                <ul className="text-[11px] text-slate-500 list-disc pl-5">{result.errors?.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
