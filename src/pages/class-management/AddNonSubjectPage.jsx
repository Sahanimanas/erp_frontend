/**
 * Class Management → Add Non-Subject  ("Manage Non-Subject")
 * Co-curricular / non-academic items (Music, Dance…) scored separately.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, DataTable, Modal, EmptyState } from "../../components/ui";
import { Music, Plus } from "lucide-react";
import { useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useCmGetSessionsQuery, useCmGetClassesQuery, useCmGetNonSubjectsQuery, useCmSaveNonSubjectMutation } from "../../redux/api/classMgmtApi";
import { CmFilters } from "./_cmShared";

const EMPTY = { name: "", totalMarks: 100, displayOrder: 0, enabled: true };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function AddNonSubjectPage() {
  usePageTitle("Add Non-Subject");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [editing, setEditing] = useState(null);

  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: classes = [] } = useCmGetClassesQuery(academicYearId || undefined);
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: nonSubjects = [], isFetching } = useCmGetNonSubjectsQuery(classId, { skip: !classId });
  const [save, { isLoading: saving }] = useCmSaveNonSubjectMutation();

  const submit = async () => {
    if (!editing.name.trim()) return toast.error("Name is required");
    try { await save({ ...editing, classId }).unwrap(); toast.success(editing.id ? "Updated" : "Added"); setEditing(null); }
    catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  const COLUMNS = [
    { key: "displayOrder", label: "Order" },
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "totalMarks", label: "Total Marks" },
    { key: "createdAt", label: "Create Date", render: fmt },
    { key: "enabled", label: "Enabled", render: (v) => (v ? "Yes" : "No") },
    { key: "id", label: "Edit", sortable: false, render: (_v, r) => (
      <button onClick={() => setEditing({ id: r.id, name: r.name, totalMarks: r.totalMarks, displayOrder: r.displayOrder, enabled: r.enabled })}
        className="px-2 py-1 text-[11px] rounded bg-amber-50 text-amber-600">Edit</button>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Non-Subject" subtitle="Co-curricular items scored outside academics" icon={<Music size={18} />} />
      <Card title="Search Subject" noPadding>
        <CmFilters sessions={sessions} classes={classes} sections={sections}
          academicYearId={academicYearId} classId={classId} sectionId={sectionId}
          onYear={(v) => { setYear(v); setClassId(""); setSectionId(""); }} onClass={(v) => { setClassId(v); setSectionId(""); }} onSection={setSectionId} />
      </Card>

      <Card noPadding title="Non-Subject List" action={<Button size="sm" icon={<Plus size={13} />} disabled={!classId} onClick={() => setEditing({ ...EMPTY })}>Add New Non-Subject</Button>}>
        {!classId ? (
          <EmptyState icon="🎵" title="Pick a class" description="Select a class to manage its non-subjects." />
        ) : (
          <DataTable columns={COLUMNS} data={nonSubjects} loading={isFetching} emptyText="No non-subjects for this class yet." />
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Non-Subject" : "Add New Non-Subject"}>
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Enter name" />
              <Input label="Total Marks *" type="number" value={editing.totalMarks} onChange={(e) => setEditing({ ...editing, totalMarks: e.target.value })} placeholder="Enter total marks" />
              <Input label="Display Order" type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: e.target.value })} />
              <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none mt-6"><input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} className="w-4 h-4 accent-emerald-600" /> Enabled</label>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>Close</Button>
              <Button loading={saving} onClick={submit}>Submit</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
