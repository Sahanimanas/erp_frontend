/**
 * Class Management → Add Class
 * Create/edit classes. Classes + their sections are the SAME records used by
 * Settings → Classes & Sections and every class/section dropdown, so anything
 * added here shows up there instantly (and vice-versa).
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable } from "../../components/ui";
import { School, Trash2 } from "lucide-react";
import { useCmGetSessionsQuery, useCmGetClassesQuery, useCmSaveClassMutation, useCmDeleteClassMutation, useCmGetDepartmentsQuery } from "../../redux/api/classMgmtApi";
import { sortClasses } from "./_cmShared";

const EMPTY = { name: "", academicYearId: "", departmentId: "", classType: "Yearly", classSequence: "", noOfSessions: 1, classCode: "", sections: "", description: "", enabled: true };

export default function AddClassPage() {
  usePageTitle("Add Class");
  const [form, setForm] = useState({ ...EMPTY });
  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: departments = [] } = useCmGetDepartmentsQuery();
  const { data: classes = [], isFetching } = useCmGetClassesQuery();
  const [save, { isLoading: saving }] = useCmSaveClassMutation();
  const [del] = useCmDeleteClassMutation();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Class name is required");
    const payload = { ...form, sections: form.sections.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) };
    try { await save(payload).unwrap(); toast.success(form.id ? "Class updated" : "Class added"); setForm({ ...EMPTY }); }
    catch (e) { toast.error(e?.data?.error || "Failed to save class"); }
  };
  const remove = async (r) => {
    if (!confirm(`Delete class "${r.name}"? Blocked if it has students.`)) return;
    try { await del(r.id).unwrap(); toast.success("Deleted"); } catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const COLUMNS = [
    { key: "academicYear", label: "Session", render: (v) => v?.name || "—" },
    { key: "name", label: "Class", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "classType", label: "Class Type", render: (v) => v || "—" },
    { key: "noOfSessions", label: "No. Of Sessions" },
    { key: "classCode", label: "Code", render: (v) => v || "N/A" },
    { key: "sectionNames", label: "Section", sortable: false, render: (v) => (v?.length ? v.join(", ") : "N/A") },
    { key: "enabled", label: "Status", render: (v) => (v ? "Enabled" : "Disabled") },
    { key: "id", label: "", sortable: false, render: (_v, r) => (
      <div className="flex gap-1">
        <button onClick={() => setForm({ id: r.id, name: r.name, academicYearId: r.academicYearId || "", departmentId: r.departmentId || "", classType: r.classType || "Yearly", classSequence: r.classSequence ?? "", noOfSessions: r.noOfSessions || 1, classCode: r.classCode || "", sections: (r.sectionNames || []).join(", "), description: r.description || "", enabled: r.enabled })}
          className="px-2 py-1 text-[11px] rounded bg-amber-50 text-amber-600">Edit</button>
        <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Add Class" subtitle="Create classes and their sections" icon={<School size={18} />} />
      <Card title={form.id ? "Edit Class" : "Add Class"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={form.academicYearId} onChange={(e) => set("academicYearId", e.target.value)}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Input label="Name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 1st, Nursery" />
          <Select label="Department" value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}
            options={[{ value: "", label: "Select..." }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          <Select label="Class Type" value={form.classType} onChange={(e) => set("classType", e.target.value)}
            options={[{ value: "Yearly", label: "Yearly" }, { value: "Semester", label: "Semester" }]} />
          <Input label="Class Sequence" type="number" value={form.classSequence} onChange={(e) => set("classSequence", e.target.value)} placeholder="e.g. 1" />
          <Input label="No. of Session" type="number" min={1} value={form.noOfSessions} onChange={(e) => set("noOfSessions", e.target.value)} />
          <Input label="Class Code" value={form.classCode} onChange={(e) => set("classCode", e.target.value)} placeholder="Enter course code" />
          <Input label="Class Section" value={form.sections} onChange={(e) => set("sections", e.target.value)} placeholder="A, B (comma separated)" />
          <Input label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Enter description" />
        </div>
        <div className="px-5 pb-5 flex items-center gap-4">
          <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="w-4 h-4 accent-emerald-600" /> Enabled</label>
          <div className="ml-auto flex gap-2">
            {form.id && <Button variant="secondary" size="sm" onClick={() => setForm({ ...EMPTY })}>Cancel</Button>}
            <Button size="sm" loading={saving} onClick={submit}>{form.id ? "Update" : "Add"}</Button>
          </div>
        </div>
      </Card>
      <Card noPadding title="All Class List">
        <DataTable columns={COLUMNS} data={sortClasses(classes)} loading={isFetching} emptyText="No classes yet." />
      </Card>
    </div>
  );
}
