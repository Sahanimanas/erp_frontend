/**
 * Exam Management → Manage Exam
 * Session-scoped exam terms: list / add / edit / delete for the picked session.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SearchInput, Input, Select, Modal, Badge } from "../../components/ui";
import { ClipboardList, Plus, Edit2, Trash2 } from "lucide-react";
import { useCreateExamMutation, useUpdateExamMutation, useDeleteExamMutation } from "../../redux/api/examMgmtApi";
import { useSessionExams, EXAM_TYPES, typeLabel, fmtDate, STATUS_BADGE, sessionOptions } from "./_examShared";

const EMPTY = { name: "", type: "UNIT_TEST", startDate: "", endDate: "" };

export default function ManageExamPage() {
  usePageTitle("Manage Exam");
  const { years, session, setSession, exams, examsLoading } = useSessionExams();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | {id?, ...form}

  const [createExam, { isLoading: creating }] = useCreateExamMutation();
  const [updateExam, { isLoading: updating }] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();

  const filtered = exams.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (!editing.name || !editing.startDate || !editing.endDate) {
      toast.error("Name, start and end dates are required");
      return;
    }
    try {
      if (editing.id) {
        await updateExam({ id: editing.id, name: editing.name, type: editing.type, startDate: editing.startDate, endDate: editing.endDate }).unwrap();
        toast.success("Exam updated");
      } else {
        await createExam({ name: editing.name, type: editing.type, startDate: editing.startDate, endDate: editing.endDate, academicYearId: session }).unwrap();
        toast.success("Exam created");
      }
      setEditing(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save exam"); }
  };

  const remove = async (exam) => {
    if (!confirm(`Delete exam "${exam.name}"? Its schedule and seating will be removed.`)) return;
    try { await deleteExam(exam.id).unwrap(); toast.success("Exam deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete exam"); }
  };

  const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  const COLUMNS = [
    { key: "name", label: "Exam Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "type", label: "Exam Type", render: (v) => typeLabel(v) },
    { key: "academicYear", label: "Session", sortable: false, render: (v) => v?.name || "-" },
    { key: "startDate", label: "From Date", render: (v) => fmtDate(v) },
    { key: "endDate", label: "To Date", render: (v) => fmtDate(v) },
    { key: "_count", label: "Papers", sortable: false, render: (v) => <span className="font-semibold text-indigo-600">{v?.schedules ?? 0}</span> },
    { key: "status", label: "Status", render: (v) => <Badge variant={STATUS_BADGE[v] || "default"} dot>{v}</Badge> },
    {
      key: "id", label: "Actions", sortable: false, render: (_, r) => (
        <div className="flex gap-1">
          <button title="Edit" onClick={() => setEditing({ id: r.id, name: r.name, type: r.type, startDate: toInputDate(r.startDate), endDate: toInputDate(r.endDate) })} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13} /></button>
          <button title="Delete" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Manage Exam" subtitle="Create and maintain examination terms per session" icon={<ClipboardList size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} disabled={!session} onClick={() => setEditing({ ...EMPTY })}>Add Exam</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 items-end">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)} options={sessionOptions(years)} className="w-44" />
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams..." className="w-52" />
          <span className="ml-auto text-[11px] text-slate-500">{examsLoading ? "Loading..." : `${filtered.length} exam(s)`}</span>
        </div>
        <DataTable columns={COLUMNS} data={filtered} loading={examsLoading} emptyText="No exams in this session yet. Click Add Exam." />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Exam" : "Add Exam"}>
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Exam Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Half Yearly Exam" />
              <Select label="Exam Type *" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} options={EXAM_TYPES} />
              <Input label="From Date *" type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
              <Input label="To Date *" type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" loading={creating || updating} onClick={save}>{editing.id ? "Update" : "Save"}</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
