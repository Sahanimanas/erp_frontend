/**
 * Subject Management → Subjects
 * School-wide subject master: add / edit / delete (name + code + description).
 * These subjects are then mapped to classes and used by exam schedules,
 * timetables and marks.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SearchInput, Input, Modal } from "../../components/ui";
import { BookOpen, Plus, Edit2, Trash2 } from "lucide-react";
import {
  useGetSubjectsQuery, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation,
} from "../../redux/api/academicApi";

const EMPTY = { name: "", code: "", description: "" };

export default function SubjectListPage() {
  usePageTitle("Subjects");
  const { data: subjects = [], isFetching } = useGetSubjectsQuery();
  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const filtered = subjects.filter(
    (s) => !search || `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!editing.name.trim() || !editing.code.trim()) { toast.error("Name and code are required"); return; }
    try {
      if (editing.id) {
        await updateSubject({ id: editing.id, name: editing.name, code: editing.code, description: editing.description }).unwrap();
        toast.success("Subject updated");
      } else {
        await createSubject({ name: editing.name, code: editing.code, description: editing.description }).unwrap();
        toast.success("Subject created");
      }
      setEditing(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save subject"); }
  };

  const remove = async (s) => {
    if (!confirm(`Delete subject "${s.name}"? It will disappear from class mappings, schedules and timetables.`)) return;
    try { await deleteSubject(s.id).unwrap(); toast.success("Subject deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete subject"); }
  };

  const COLUMNS = [
    { key: "name", label: "Subject", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "code", label: "Code", render: (v) => <span className="font-mono text-[11px] text-indigo-600 font-semibold">{v}</span> },
    { key: "description", label: "Description", render: (v) => v || "-" },
    { key: "classSubjects", label: "Mapped Classes", sortable: false, render: (v) => <span className="font-semibold text-indigo-600">{v?.length ?? 0}</span> },
    {
      key: "id", label: "Actions", sortable: false, render: (_, r) => (
        <div className="flex gap-1">
          <button title="Edit" onClick={() => setEditing({ id: r.id, name: r.name, code: r.code, description: r.description || "" })} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13} /></button>
          <button title="Delete" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Manage the school's subject master" icon={<BookOpen size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setEditing({ ...EMPTY })}>Add Subject</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject / code..." className="w-52" />
          <span className="ml-auto text-[11px] text-slate-500">{isFetching ? "Loading..." : `${filtered.length} subject(s)`}</span>
        </div>
        <DataTable columns={COLUMNS} data={filtered} loading={isFetching} emptyText='No subjects yet. Click "Add Subject" to create Mathematics, English, …' />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Subject" : "Add Subject"}>
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Subject Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Mathematics" />
              <Input label="Code *" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="MATH" />
              <div className="col-span-2">
                <Input label="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Optional description" />
              </div>
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
