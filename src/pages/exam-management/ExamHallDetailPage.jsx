/**
 * Exam Management → Exam Hall Detail
 * CRUD for the school's exam halls (name, room no, capacity).
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Input, Modal } from "../../components/ui";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { useGetHallsQuery, useUpsertHallMutation, useDeleteHallMutation } from "../../redux/api/examMgmtApi";

const EMPTY = { name: "", roomNo: "", capacity: 40 };

export default function ExamHallDetailPage() {
  usePageTitle("Exam Hall Detail");
  const { data: halls = [], isFetching } = useGetHallsQuery();
  const [upsertHall, { isLoading: saving }] = useUpsertHallMutation();
  const [deleteHall] = useDeleteHallMutation();
  const [editing, setEditing] = useState(null);

  const save = async () => {
    if (!editing.name) { toast.error("Hall name is required"); return; }
    try {
      await upsertHall(editing).unwrap();
      toast.success(editing.id ? "Hall updated" : "Hall added");
      setEditing(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save hall"); }
  };

  const remove = async (hall) => {
    if (!confirm(`Delete hall "${hall.name}"?`)) return;
    try { await deleteHall(hall.id).unwrap(); toast.success("Hall deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete hall"); }
  };

  const COLUMNS = [
    { key: "name", label: "Hall Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "roomNo", label: "Room No", render: (v) => v || "-" },
    { key: "capacity", label: "Capacity", render: (v) => <span className="font-semibold">{v || "Unlimited"}</span> },
    { key: "totalSeatsAllocated", label: "Seats Allocated", render: (v) => <span className="font-semibold text-indigo-600">{v ?? 0}</span> },
    {
      key: "id", label: "Actions", sortable: false, render: (_, r) => (
        <div className="flex gap-1">
          <button title="Edit" onClick={() => setEditing({ id: r.id, name: r.name, roomNo: r.roomNo || "", capacity: r.capacity })} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13} /></button>
          <button title="Delete" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Exam Hall Detail" subtitle="Manage examination halls and their capacity" icon={<Building2 size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setEditing({ ...EMPTY })}>Add Hall</Button>
      </PageHeader>
      <Card noPadding>
        <DataTable columns={COLUMNS} data={halls} loading={isFetching} emptyText='No halls yet. Click "Add Hall" to create Main Hall A, etc.' />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Hall" : "Add Hall"}>
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Hall Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Main Hall A" />
              <Input label="Room No" value={editing.roomNo} onChange={(e) => setEditing({ ...editing, roomNo: e.target.value })} placeholder="101" />
              <Input label="Capacity" type="number" min="0" value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: e.target.value })} placeholder="40" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Capacity 0 = unlimited (no seat cap when auto-generating the sitting plan).</p>
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" loading={saving} onClick={save}>{editing.id ? "Update" : "Save"}</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
