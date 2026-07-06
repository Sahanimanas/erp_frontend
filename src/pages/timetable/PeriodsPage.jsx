/**
 * Time Table Management → Periods
 * Define the school day's periods (name + start/end time). These are the rows
 * of every class timetable.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Input, Modal } from "../../components/ui";
import { Clock, Plus, Edit2, Trash2 } from "lucide-react";
import { useGetPeriodsQuery, useUpsertPeriodMutation, useDeletePeriodMutation } from "../../redux/api/academicApi";

const EMPTY = { name: "", startTime: "09:00", endTime: "09:45" };

export default function PeriodsPage() {
  usePageTitle("Periods");
  const { data: periods = [], isFetching } = useGetPeriodsQuery();
  const [upsertPeriod, { isLoading: saving }] = useUpsertPeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const [editing, setEditing] = useState(null);

  const save = async () => {
    if (!editing.name.trim() || !editing.startTime || !editing.endTime) { toast.error("Name, start and end time are required"); return; }
    if (editing.endTime <= editing.startTime) { toast.error("End time must be after start time"); return; }
    try {
      await upsertPeriod(editing).unwrap();
      toast.success(editing.id ? "Period updated" : "Period added");
      setEditing(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save period"); }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? Its timetable slots will be removed for every class.`)) return;
    try { await deletePeriod(p.id).unwrap(); toast.success("Period deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete period"); }
  };

  const COLUMNS = [
    { key: "name", label: "Period", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "startTime", label: "Start Time" },
    { key: "endTime", label: "End Time" },
    {
      key: "id", label: "Actions", sortable: false, render: (_, r) => (
        <div className="flex gap-1">
          <button title="Edit" onClick={() => setEditing({ id: r.id, name: r.name, startTime: r.startTime, endTime: r.endTime })} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13} /></button>
          <button title="Delete" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Periods" subtitle="Define the school day's periods for the timetable" icon={<Clock size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setEditing({ ...EMPTY })}>Add Period</Button>
      </PageHeader>
      <Card noPadding>
        <DataTable columns={COLUMNS} data={periods} loading={isFetching} emptyText='No periods yet. Add "Period 1 (09:00–09:45)", "Lunch Break", …' />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Period" : "Add Period"}>
        {editing && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Period 1" />
              <Input label="Start Time *" type="time" value={editing.startTime} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} />
              <Input label="End Time *" type="time" value={editing.endTime} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} />
            </div>
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
