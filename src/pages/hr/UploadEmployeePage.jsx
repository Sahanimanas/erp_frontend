/**
 * Employee → Upload Employee (Excel/CSV import → /employees/import)
 * Columns (sample): Name, Phone, Email, City, Address, Permanent Address,
 * Joining Date, Employee Code, Department, Designation, Reporting To Email Id,
 * User Name, Password, Send Email For Login (Yes/No).
 * Department/Designation are matched by name (created if missing); Reporting To
 * is matched by an existing employee's email.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Badge } from "../../components/ui";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import apiClient from "../../services/axios";

// Friendly Excel header → backend key. Order defines the sample column order.
const HEADER_MAP = {
  "Name": "name",
  "Phone": "phone",
  "Email": "email",
  "City": "city",
  "Address": "address",
  "Permanent Address": "permanentAddress",
  "Joining Date": "dateOfJoining",
  "Employee Code": "employeeCode",
  "Department": "departmentName",
  "Designation": "designationName",
  "Reporting To Email Id": "reportingToEmail",
  "User Name": "userName",
  "Password": "password",
  "Send Email For Login (Yes/No)": "sendEmailForLogin",
};
const HEADERS = Object.keys(HEADER_MAP);

const SAMPLE_ROWS = [
  {
    "Name": "Ramesh Iyer", "Phone": "9876500001", "Email": "ramesh@staff.com", "City": "Pune",
    "Address": "12 MG Road", "Permanent Address": "12 MG Road", "Joining Date": "2022-06-01",
    "Employee Code": "EMP101", "Department": "Science", "Designation": "Senior Teacher",
    "Reporting To Email Id": "", "User Name": "ramesh", "Password": "Staff@123", "Send Email For Login (Yes/No)": "No",
  },
  {
    "Name": "Sunita Rao", "Phone": "9876500002", "Email": "sunita@staff.com", "City": "Pune",
    "Address": "5 Park Rd", "Permanent Address": "5 Park Rd", "Joining Date": "2023-04-15",
    "Employee Code": "EMP102", "Department": "Accounts", "Designation": "Accountant",
    "Reporting To Email Id": "ramesh@staff.com", "User Name": "sunita", "Password": "Staff@123", "Send Email For Login (Yes/No)": "No",
  },
];

// Map a raw parsed row (friendly headers) → backend keys, dropping blanks.
function toPayloadRow(raw) {
  const out = {};
  for (const [label, key] of Object.entries(HEADER_MAP)) {
    const v = raw[label];
    if (v !== undefined && v !== null && String(v).trim() !== "") out[key] = String(v).trim();
  }
  return out;
}

export default function UploadEmployeePage() {
  usePageTitle("Upload Employee");
  const [rows, setRows] = useState([]);     // raw parsed rows (friendly headers, for preview)
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [parsing, setParsing] = useState(false);

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
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
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
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: HEADERS });
    ws["!cols"] = HEADERS.map((h) => ({ wch: Math.max(14, h.length + 2) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employee-upload-sample.xlsx");
  };

  const upload = async () => {
    if (!rows.length) { toast.error("Choose an Excel file first"); return; }
    const employees = rows.map(toPayloadRow).filter((r) => r.name || r.email);
    if (!employees.length) { toast.error("No valid rows (Name or Email required)"); return; }
    setBusy(true);
    try {
      const res = await apiClient.post("/employees/import", { employees });
      setResult(res.data.data);
      toast.success(`Imported ${res.data.data.imported}${res.data.data.failed ? `, ${res.data.data.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e.response?.data?.error || "Import failed");
    } finally { setBusy(false); }
  };

  const previewCols = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <PageHeader title="Upload Employee" subtitle="Bulk-import staff from an Excel (.xlsx) or CSV file" icon={<Upload size={18} />} />
      <Card title="Upload Employee">
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm cursor-pointer hover:border-indigo-300">
              <FileSpreadsheet size={15} /> {fileName || "Select a .xlsx Excel file"}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
            </label>
            <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={downloadSample}>Download Sample Excel for Upload</Button>
            {parsing && <Badge variant="warning">Reading file…</Badge>}
            {rows.length > 0 && <Badge variant="info">{rows.length} rows parsed</Badge>}
          </div>
          <Button icon={<Upload size={14} />} loading={busy} disabled={!rows.length} onClick={upload}>Upload</Button>
          <p className="text-[11px] text-slate-400">
            Download the sample for the exact columns. <b>Name</b> and <b>Email</b> are required per row;
            <b> Department</b>/<b>Designation</b> are matched by name (created if new); <b>Reporting To Email Id</b> links to an existing employee. Joining Date as YYYY-MM-DD.
          </p>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card title="Preview" subtitle={`${rows.length} rows`}>
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
                <ul className="text-[11px] text-slate-500 list-disc pl-5">{result.errors?.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
