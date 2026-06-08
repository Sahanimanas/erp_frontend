/**
 * Student → Search Student
 * Search by code / class filter / all, with a rich result table + CSV export.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Pagination, Badge, DateRangeFilter, ExportButton } from "../../components/ui";
import { Search, Eye } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { filterByDateRange } from "../../utils/exportExcel";

const MODES = [
  { value: "all", label: "All Students" },
  { value: "code", label: "By Student Code" },
  { value: "class", label: "By Class Filter" },
];

const EXPORT_COLS = [
  { label: "Roll No", get: (r) => r.rollNumber },
  { label: "Name", get: (r) => `${r.user?.firstName ?? ""} ${r.user?.lastName ?? ""}`.trim() },
  { label: "Class", get: (r) => r.section?.class?.name },
  { label: "Section", get: (r) => r.section?.name },
  { label: "Gender", get: (r) => r.gender },
  { label: "Phone", get: (r) => r.user?.phone },
  { label: "Email", get: (r) => r.user?.email },
  { label: "Admission No", get: (r) => r.admissionNumber },
];

export default function SearchStudentPage() {
  usePageTitle("Search Student");
  const navigate = useNavigate();
  const [mode, setMode] = useState("all");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [code, setCode] = useState("");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [query, setQuery] = useState({ page: 1, limit: 10 });

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data, isFetching } = useGetStudentsQuery({ ...query, page });

  const allRows = data?.data ?? [];
  const rows = filterByDateRange(allRows, (r) => r.admissionDate || r.createdAt, dateRange.from, dateRange.to);
  const total = data?.pagination?.total ?? 0;

  const runSearch = () => {
    const q = { limit: 10 };
    if (mode === "code") q.search = code;
    if (mode === "class") { if (classId) q.classId = classId; if (sectionId) q.sectionId = sectionId; }
    setPage(1);
    setQuery(q);
  };

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "user", label: "Name", sortable: false, render: (_v, r) => <span className="font-semibold text-slate-800">{r.user?.firstName} {r.user?.lastName}</span> },
    { key: "admissionNumber", label: "Adm. No", render: (v) => v || "—" },
    { key: "section", label: "Class", sortable: false, render: (_v, r) => `${r.section?.class?.name ?? "—"}-${r.section?.name ?? ""}` },
    { key: "gender", label: "Gender", render: (v) => v || "—" },
    { key: "phone", label: "Phone", sortable: false, render: (_v, r) => <span className="font-mono text-[11px]">{r.user?.phone || "—"}</span> },
    { key: "father", label: "Father", sortable: false, render: (_v, r) => r.parents?.find((p) => p.relationship === "Father")?.user?.firstName || r.parents?.[0]?.user?.firstName || "—" },
    { key: "status", label: "Status", sortable: false, render: (_v, r) => <Badge variant={r.user?.isActive === false ? "default" : "success"}>{r.user?.isActive === false ? "Inactive" : "Active"}</Badge> },
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
              <Input2 label="Student Code / Name / Phone" value={code} onChange={(e) => setCode(e.target.value)} />
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
        <div className="p-3 flex items-center justify-between border-b border-slate-100">
          <span className="text-[12px] text-slate-500 px-2">{rows.length} of {total} student(s)</span>
          <ExportButton filename="students.csv" rows={rows} columns={EXPORT_COLS} />
        </div>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No students found. Adjust the filters and search." />
        <Pagination page={page} total={total} pageSize={10} onPageChange={setPage} />
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
