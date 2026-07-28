/**
 * Transport → Manage Vehicle Detail
 * Add/edit the school's fleet. Vehicle number is unique per school, so
 * re-submitting an existing number updates that bus instead of erroring.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, DataTable, Badge, ExportButton } from "../../components/ui";
import { Bus, Save, Pencil, X, Trash2 } from "lucide-react";
import {
  useGetVehiclesQuery,
  useUpsertVehicleMutation,
  useDeleteVehicleMutation,
} from "../../redux/api/transportApi";

const BLANK = { id: "", name: "", vehicleNumber: "", vehicleModel: "", gpsDeviceId: "", seatCapacity: "0", enabled: true };

export default function ManageVehiclePage() {
  usePageTitle("Manage Vehicle Detail");
  const { data: vehicles = [], isFetching } = useGetVehiclesQuery();
  const [upsert, { isLoading }] = useUpsertVehicleMutation();
  const [remove] = useDeleteVehicleMutation();

  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEditing = Boolean(form.id);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.vehicleNumber.trim()) return toast.error("Vehicle number is required");
    try {
      await upsert({ ...form, seatCapacity: Number(form.seatCapacity) || 0 }).unwrap();
      toast.success(isEditing ? "Vehicle updated" : "Vehicle added");
      setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to save vehicle"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete vehicle "${row.name}"?`)) return;
    try {
      await remove(row.id).unwrap();
      toast.success("Vehicle deleted");
      if (form.id === row.id) setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to delete vehicle"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "vehicleNumber", label: "Vehicle Number" },
    { key: "vehicleModel", label: "Vehicle Model", render: (v) => v || "N/A" },
    { key: "gpsDeviceId", label: "GPS Device Id", render: (v) => v || "N/A" },
    { key: "seatCapacity", label: "Seat Capacity" },
    { key: "createdAt", label: "Create Date", render: (v) => (v ? new Date(v).toLocaleString() : "—") },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "green" : "default"}>{v ? "Yes" : "No"}</Badge> },
    {
      key: "actions", label: "Actions", sortable: false, render: (_v, r) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="secondary" icon={<Pencil size={12} />} onClick={() => setForm({
            id: r.id, name: r.name, vehicleNumber: r.vehicleNumber,
            vehicleModel: r.vehicleModel || "", gpsDeviceId: r.gpsDeviceId || "",
            seatCapacity: String(r.seatCapacity ?? 0), enabled: r.enabled,
          })}>Edit</Button>
          <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Vehicle Details" subtitle="Transport" icon={<Bus size={18} />} />

      <Card title={isEditing ? "Edit Vehicle Details" : "Add Vehicle Details"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={set("name")} placeholder="Enter Name" />
          <Input label="Vehicle Number *" value={form.vehicleNumber} onChange={set("vehicleNumber")} placeholder="Enter Vehicle Number" />
          <Input label="Vehicle Model" value={form.vehicleModel} onChange={set("vehicleModel")} placeholder="Enter Vehicle Model" />
          <Input label="GPS Device Id" value={form.gpsDeviceId} onChange={set("gpsDeviceId")} placeholder="Enter GPS Device Id" />
          <Input label="Seat Capacity (Number) *" type="number" min="0" value={form.seatCapacity} onChange={set("seatCapacity")} />
          <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-[13px] font-semibold text-slate-700">Enabled</span>
          </label>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          {isEditing && <Button variant="secondary" icon={<X size={14} />} onClick={() => setForm(BLANK)}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={isLoading} onClick={submit}>Submit</Button>
        </div>
      </Card>

      <Card
        noPadding
        title="All Vehicle List"
        action={
          <ExportButton
            filename="transport-vehicles.csv"
            rows={vehicles}
            columns={[
              { label: "Name", get: (r) => r.name },
              { label: "Vehicle Number", get: (r) => r.vehicleNumber },
              { label: "Vehicle Model", get: (r) => r.vehicleModel || "" },
              { label: "GPS Device Id", get: (r) => r.gpsDeviceId || "" },
              { label: "Seat Capacity", get: (r) => r.seatCapacity },
              { label: "Enabled", get: (r) => (r.enabled ? "Yes" : "No") },
            ]}
          />
        }
      >
        <DataTable columns={columns} data={vehicles} loading={isFetching} emptyText="No vehicles yet." />
      </Card>
    </div>
  );
}
