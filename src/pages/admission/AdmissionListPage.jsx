/**
 * Admission → Online Admission List
 * Students admitted through this portal (created via Create Admission / Add
 * Student). Create Admission writes a real Student record, so this lists those
 * students — searchable, exportable, and click-through to the profile.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Badge, SearchInput, ExportButton } from "../../components/ui";
import { GraduationCap, Eye } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";

const fullName = (u) => `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "—";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const EXPORT_COLS = [
  { label: "Reg No", get: (r) => r.registrationNo || r.admissionNumber },
  { label: "Student", get: (r) => fullName(r.user) },
  { label: "Phone", get: (r) => r.user?.phone },
  { label: "Class", get: (r) => `${r.section?.class?.name ?? ""}-${r.section?.name ?? ""}` },
  { label: "Status", get: (r) => (r.user?.isActive === false ? "Inactive" : "Active") },
  { label: "Admission Date", get: (r) => fmtDate(r.admissionDate) },
];

export default function AdmissionListPage() {
  usePageTitle("Online Admission List");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isFetching } = useGetStudentsQuery({ ...(search.trim() ? { search: search.trim() } : {}), limit: 500 });
  const rows = data?.data ?? [];

  const columns = [
    { key: "name", label: "Student", sortValue: (r) => fullName(r.user),
      render: (_v, r) => (
        <div>
          <p className="font-semibold text-slate-800 text-[12.5px]">{fullName(r.user)}</p>
          <p className="text-[10px] text-slate-400">Roll {r.rollNumber || "—"}</p>
        </div>
      ) },
    { key: "phone", label: "Phone", sortValue: (r) => r.user?.phone, render: (_v, r) => <span className="font-mono text-[11px]">{r.user?.phone || "—"}</span> },
    { key: "class", label: "Class", sortValue: (r) => r.section?.class?.name, render: (_v, r) => `${r.section?.class?.name ?? "—"}-${r.section?.name ?? ""}` },
    { key: "source", label: "Source", sortable: false, render: () => <Badge variant="info">Create Admission</Badge> },
    { key: "registrationNo", label: "Reg. No", sortValue: (r) => r.registrationNo, render: (_v, r) => <span className="font-mono text-[11px] text-indigo-600">{r.registrationNo || r.admissionNumber || "—"}</span> },
    { key: "status", label: "Status", sortValue: (r) => (r.user?.isActive === false ? "Inactive" : "Active"),
      render: (_v, r) => <Badge variant={r.user?.isActive === false ? "default" : "success"}>{r.user?.isActive === false ? "Inactive" : "Active"}</Badge> },
    { key: "admissionDate", label: "Date", sortValue: (r) => r.admissionDate, render: (v) => <span className="whitespace-nowrap text-[12px] text-slate-600">{fmtDate(v)}</span> },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <button onClick={() => navigate(`/students/profile?id=${r.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Eye size={14} /></button>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Online Admission List" subtitle="Students admitted to the school" icon={<GraduationCap size={18} />}>
        <ExportButton filename="admissions.csv" rows={rows} columns={EXPORT_COLS} />
      </PageHeader>

      <Card noPadding>
        <div className="p-3 border-b border-slate-100 flex items-center gap-3">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, reg no…" className="flex-1" />
          <span className="text-[12px] text-slate-500 whitespace-nowrap px-2">{rows.length} admitted</span>
        </div>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No admissions yet. Use Create Admission to admit a student." />
      </Card>
    </div>
  );
}
