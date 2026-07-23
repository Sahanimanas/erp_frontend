/**
 * Class Management → Manage Syllabus  ("All Class Syllabus List")
 */
import { usePageTitle } from "../../hooks";
import toast from "react-hot-toast";
import { PageHeader, Card, DataTable } from "../../components/ui";
import { FileText, Trash2, Paperclip } from "lucide-react";
import { useCmGetSyllabusListQuery, useCmDeleteSyllabusMutation } from "../../redux/api/classMgmtApi";

const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export default function ManageSyllabusPage() {
  usePageTitle("Manage Syllabus");
  const { data: rows = [], isFetching } = useCmGetSyllabusListQuery();
  const [del] = useCmDeleteSyllabusMutation();

  const remove = async (r) => {
    if (!confirm(`Delete syllabus "${r.title}"?`)) return;
    try { await del(r.id).unwrap(); toast.success("Deleted"); } catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const COLUMNS = [
    { key: "sessionName", label: "Session", render: (v) => v || "—" },
    { key: "className", label: "Class", render: (v) => v || "—" },
    { key: "title", label: "Title", render: (v, r) => (
      <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">{v}
        {Array.isArray(r.attachments) && r.attachments.length > 0 && <Paperclip size={12} className="text-slate-400" />}
      </span>
    ) },
    { key: "createdAt", label: "Create Date", render: fmt },
    { key: "enabled", label: "Enabled", render: (v) => (v ? "Yes" : "No") },
    { key: "id", label: "", sortable: false, render: (_v, r) => (
      <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Syllabus" subtitle="All class syllabus entries" icon={<FileText size={18} />} />
      <Card noPadding title="All Class Syllabus List">
        <DataTable columns={COLUMNS} data={rows} loading={isFetching} emptyText="No syllabus created yet." />
      </Card>
    </div>
  );
}
