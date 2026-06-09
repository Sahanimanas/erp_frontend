/**
 * Student → Search Student
 * Search by code / class filter / all, with a full-detail result table + CSV export.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Pagination, Badge, DateRangeFilter, ExportButton } from "../../components/ui";
import { Search, Eye } from "lucide-react";
import { useGetStudentsQuery, useLazyGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";

const MODES = [
  { value: "all", label: "All Students" },
  { value: "code", label: "By Student Code" },
  { value: "class", label: "By Class Filter" },
];

const PAGE_SIZES = [
  { value: "10", label: "Show 10 rows" },
  { value: "25", label: "Show 25 rows" },
  { value: "50", label: "Show 50 rows" },
  { value: "100", label: "Show 100 rows" },
  { value: "10000", label: "Show all rows" },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const fullName = (u) => `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "N/A";
const parentName = (r, rel) => {
  const scalar = rel === "father" ? r.fatherName : r.motherName;
  if (scalar) return scalar;
  const p = r.parents?.find((x) => x.relationship?.toLowerCase() === rel) ?? null;
  return p ? fullName(p.user) : "N/A";
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "N/A");
const session = (r) => r.section?.class?.academicYear?.name ?? "N/A";

const EXPORT_COLS = [
  { label: "Reg No", get: (r) => r.registrationNo },
  { label: "Admission No", get: (r) => r.admissionNumber },
  { label: "Roll No", get: (r) => r.rollNumber },
  { label: "Name", get: (r) => fullName(r.user) },
  { label: "Session", get: (r) => r.section?.class?.academicYear?.name },
  { label: "Class", get: (r) => r.section?.class?.name },
  { label: "Section", get: (r) => r.section?.name },
  { label: "Birth Date", get: (r) => fmtDate(r.dateOfBirth) },
  { label: "Join Date", get: (r) => fmtDate(r.admissionDate) },
  { label: "Gender", get: (r) => r.gender },
  { label: "Father Name", get: (r) => parentName(r, "father") },
  { label: "Mother Name", get: (r) => parentName(r, "mother") },
  { label: "Guardian Name", get: (r) => r.guardianName },
  { label: "Phone", get: (r) => r.user?.phone },
  { label: "Guardian Phone", get: (r) => r.guardianPhone },
  { label: "Email", get: (r) => r.user?.email },
  { label: "Religion", get: (r) => r.religion },
  { label: "Category", get: (r) => r.category },
  { label: "Caste", get: (r) => r.caste },
  { label: "Mother Tongue", get: (r) => r.motherTongue },
  { label: "PEN", get: (r) => r.penNumber },
  { label: "APAAR No", get: (r) => r.apaarNo },
  { label: "Aadhar", get: (r) => r.aadharNumber },
  { label: "Father Aadhar", get: (r) => r.fatherAadhar },
  { label: "Mother Aadhar", get: (r) => r.motherAadhar },
  { label: "Smart Card No", get: (r) => r.smartCardNo },
  { label: "Blood Group", get: (r) => r.bloodGroup },
  { label: "Height", get: (r) => r.height },
  { label: "Weight", get: (r) => r.weight },
  { label: "Fee Plan", get: (r) => r.feePlan },
  { label: "Father Occupation", get: (r) => r.fatherOccupation },
  { label: "Mother Occupation", get: (r) => r.motherOccupation },
  { label: "Father Qualification", get: (r) => r.fatherQualification },
  { label: "Mother Qualification", get: (r) => r.motherQualification },
  { label: "Guardian Email", get: (r) => r.guardianEmail },
  { label: "Address", get: (r) => r.address },
  { label: "Permanent Address", get: (r) => r.permanentAddress },
  { label: "City", get: (r) => r.city },
  { label: "Pincode", get: (r) => r.pincode },
  { label: "Hostel", get: (r) => (r.hostelAllotted ? "Yes" : "No") },
  { label: "Hostel Name", get: (r) => r.hostelName },
  { label: "Hostel Room", get: (r) => r.hostelRoomNo },
  { label: "Transport", get: (r) => (r.transportAllotted ? "Yes" : "No") },
  { label: "Transport Route", get: (r) => r.transportRoute },
  { label: "Bus No", get: (r) => r.busNo },
  { label: "Remarks", get: (r) => r.remarks },
];

export default function SearchStudentPage() {
  usePageTitle("Search Student");
  const navigate = useNavigate();
  const [mode, setMode] = useState("all");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [code, setCode] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [query, setQuery] = useState({ page: 1, limit: 10 });

  const limit = Number(pageSize);
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data, isFetching } = useGetStudentsQuery({ ...query, page, limit });
  const [fetchAllStudents] = useLazyGetStudentsQuery();

  // For "Export all data": re-run the active query with a huge limit so every
  // matching student (across all pages) is included, not just the current page.
  const exportAll = async () => {
    const res = await fetchAllStudents({ ...query, page: 1, limit: 100000 }).unwrap();
    return res?.data ?? [];
  };

  // The server applies every active filter (search / class / section / date
  // range), so the rows it returns are already filtered — render them directly.
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const runSearch = () => {
    const q = { limit };
    if (mode === "code" && code.trim()) q.search = code.trim();
    if (mode === "class") { if (classId) q.classId = classId; if (sectionId) q.sectionId = sectionId; }
    if (dateRange.from) q.admissionFrom = dateRange.from;
    if (dateRange.to) q.admissionTo = dateRange.to;
    setPage(1);
    setQuery(q);
  };

  const onPageSizeChange = (e) => {
    setPageSize(e.target.value);
    setPage(1);
    setQuery((q) => ({ ...q, limit: Number(e.target.value) }));
  };

  const txt = (v) => (v ?? "N/A") || "N/A";

  const columns = [
    { key: "registrationNo", label: "Reg No", sortValue: (r) => r.registrationNo, render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v || "N/A"}</span> },
    { key: "admissionNumber", label: "Adm No", sortValue: (r) => r.admissionNumber, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "rollNumber", label: "Roll No", sortValue: (r) => r.rollNumber, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "name", label: "Name", sortValue: (r) => fullName(r.user), render: (_v, r) => <span className="font-semibold text-slate-800 whitespace-nowrap">{fullName(r.user)}</span> },
    { key: "session", label: "Session", sortValue: (r) => session(r), render: (_v, r) => session(r) },
    { key: "class", label: "Class", sortValue: (r) => r.section?.class?.name, render: (_v, r) => txt(r.section?.class?.name) },
    { key: "section", label: "Section", sortValue: (r) => r.section?.name, render: (_v, r) => txt(r.section?.name) },
    { key: "dateOfBirth", label: "Birth Date", sortValue: (r) => r.dateOfBirth, render: (v) => <span className="whitespace-nowrap">{fmtDate(v)}</span> },
    { key: "admissionDate", label: "Join Date", sortValue: (r) => r.admissionDate, render: (v) => <span className="whitespace-nowrap">{fmtDate(v)}</span> },
    { key: "gender", label: "Gender", sortValue: (r) => r.gender, render: (v) => txt(v) },
    { key: "father", label: "Father Name", sortValue: (r) => parentName(r, "father"), render: (_v, r) => <span className="whitespace-nowrap">{parentName(r, "father")}</span> },
    { key: "mother", label: "Mother Name", sortValue: (r) => parentName(r, "mother"), render: (_v, r) => <span className="whitespace-nowrap">{parentName(r, "mother")}</span> },
    { key: "phone", label: "Phone", sortValue: (r) => r.user?.phone, render: (_v, r) => <span className="font-mono text-[11px]">{r.user?.phone || "N/A"}</span> },
    { key: "email", label: "Email", sortValue: (r) => r.user?.email, render: (_v, r) => <span className="text-[11px]">{r.user?.email || "N/A"}</span> },
    { key: "religion", label: "Religion", sortValue: (r) => r.religion, render: (v) => txt(v) },
    { key: "category", label: "Category", sortValue: (r) => r.category, render: (v) => txt(v) },
    { key: "caste", label: "Caste", sortValue: (r) => r.caste, render: (v) => txt(v) },
    { key: "motherTongue", label: "Mother Tongue", sortValue: (r) => r.motherTongue, render: (v) => txt(v) },
    { key: "penNumber", label: "PEN", sortValue: (r) => r.penNumber, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "aadharNumber", label: "Aadhar", sortValue: (r) => r.aadharNumber, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "fatherAadhar", label: "Father Aadhar", sortValue: (r) => r.fatherAadhar, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "motherAadhar", label: "Mother Aadhar", sortValue: (r) => r.motherAadhar, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "guardianName", label: "Guardian", sortValue: (r) => r.guardianName, render: (_v, r) => <span className="whitespace-nowrap">{txt(r.guardianName)}</span> },
    { key: "guardianPhone", label: "Guardian Phone", sortValue: (r) => r.guardianPhone, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "smartCardNo", label: "Smart Card", sortValue: (r) => r.smartCardNo, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "bloodGroup", label: "Blood Group", sortValue: (r) => r.bloodGroup, render: (v) => txt(v) },
    { key: "city", label: "City", sortValue: (r) => r.city, render: (v) => txt(v) },
    { key: "address", label: "Address", sortValue: (r) => r.address, render: (v) => <span className="whitespace-nowrap">{txt(v)}</span> },
    { key: "permanentAddress", label: "Permanent Address", sortValue: (r) => r.permanentAddress, render: (v) => <span className="whitespace-nowrap">{txt(v)}</span> },
    { key: "apaarNo", label: "APAAR", sortValue: (r) => r.apaarNo, render: (v) => <span className="font-mono text-[11px]">{v || "N/A"}</span> },
    { key: "feePlan", label: "Fee Plan", sortValue: (r) => r.feePlan, render: (v) => txt(v) },
    { key: "fatherOccupation", label: "Father Occ.", sortValue: (r) => r.fatherOccupation, render: (v) => <span className="whitespace-nowrap">{txt(v)}</span> },
    { key: "motherOccupation", label: "Mother Occ.", sortValue: (r) => r.motherOccupation, render: (v) => <span className="whitespace-nowrap">{txt(v)}</span> },
    { key: "pincode", label: "Pincode", sortValue: (r) => r.pincode, render: (v) => txt(v) },
    { key: "hostelAllotted", label: "Hostel", sortValue: (r) => (r.hostelAllotted ? 1 : 0), render: (v, r) => v ? <Badge variant="success">{r.hostelName || "Yes"}</Badge> : <span className="text-slate-400">No</span> },
    { key: "transportAllotted", label: "Transport", sortValue: (r) => (r.transportAllotted ? 1 : 0), render: (v, r) => v ? <Badge variant="success">{r.busNo || "Yes"}</Badge> : <span className="text-slate-400">No</span> },
    { key: "status", label: "Status", sortValue: (r) => (r.user?.isActive === false ? "Inactive" : "Active"), render: (_v, r) => <Badge variant={r.user?.isActive === false ? "default" : "success"}>{r.user?.isActive === false ? "Inactive" : "Active"}</Badge> },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <button onClick={() => navigate(`/students/profile?id=${r.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Eye size={14} /></button>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Search Student" subtitle="Find and view student profiles" icon={<Search size={18} />} />

      <Card title="Search Student Profile">
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-4">
            {MODES.map((m) => (
              <label key={m.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="mode" checked={mode === m.value} onChange={() => setMode(m.value)} className="accent-indigo-600" />
                {m.label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {mode === "code" && (
              <Input2 label="Student Code / Name / Phone" value={code} onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }} placeholder="Reg / Roll / Name / Phone" />
            )}
            {mode === "class" && (
              <>
                <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
                  options={[{ value: "", label: "All Classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
                <Select label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}
                  options={[{ value: "", label: classId ? "All Sections" : "Pick a class" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
              </>
            )}
            <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} label="Admission" />
            <Button icon={<Search size={14} />} onClick={runSearch}>Search</Button>
          </div>
        </div>
      </Card>

      <Card noPadding>
        <div className="p-3 flex items-center justify-between gap-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <select value={pageSize} onChange={onPageSizeChange}
              className="px-3 py-1.5 text-[12px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
              {PAGE_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <span className="text-[12px] text-slate-500">{rows.length} of {total} student(s)</span>
          </div>
          <ExportButton filename="students.csv" rows={rows} columns={EXPORT_COLS} fetchAll={exportAll} />
        </div>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No students found. Adjust the filters and search." />
        <Pagination page={page} total={total} pageSize={limit} onPageChange={setPage} />
      </Card>
    </div>
  );
}

// Local labelled input (avoids pulling the shared Input where a raw field reads cleaner)
function Input2({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
    </div>
  );
}
