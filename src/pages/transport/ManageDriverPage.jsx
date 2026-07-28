/**
 * Transport → Manage Driver Detail
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Textarea, DataTable, Badge, ExportButton } from "../../components/ui";
import { UserCog, Save, Pencil, X, Trash2 } from "lucide-react";
import {
  useGetDriversQuery,
  useUpsertDriverMutation,
  useDeleteDriverMutation,
} from "../../redux/api/transportApi";

const BLANK = { id: "", name: "", licenseNo: "", phone: "", email: "", age: "", address: "", enabled: true };

export default function ManageDriverPage() {
  usePageTitle("Manage Driver Detail");
  const { data: drivers = [], isFetching } = useGetDriversQuery();
  const [upsert, { isLoading }] = useUpsertDriverMutation();
  const [remove] = useDeleteDriverMutation();

  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEditing = Boolean(form.id);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.licenseNo.trim()) return toast.error("Driving licence no is required");
    try {
      await upsert(form).unwrap();
      toast.success(isEditing ? "Driver updated" : "Driver added");
      setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to save driver"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete driver "${row.name}"?`)) return;
    try {
      await remove(row.id).unwrap();
      toast.success("Driver deleted");
      if (form.id === row.id) setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to delete driver"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "licenseNo", label: "Driving License No" },
    { key: "phone", label: "Phone", render: (v) => v || "N/A" },
    { key: "email", label: "Email", render: (v) => v || "N/A" },
    { key: "age", label: "Age", render: (v) => (v ?? "N/A") },
    { key: "createdAt", label: "Create Date", render: (v) => (v ? new Date(v).toLocaleString() : "—") },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "green" : "default"}>{v ? "Yes" : "No"}</Badge> },
    {
      key: "actions", label: "Actions", sortable: false, render: (_v, r) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="secondary" icon={<Pencil size={12} />} onClick={() => setForm({
            id: r.id, name: r.name, licenseNo: r.licenseNo, phone: r.phone || "",
            email: r.email || "", age: r.age == null ? "" : String(r.age),
            address: r.address || "", enabled: r.enabled,
          })}>Edit</Button>
          <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Driver Details" subtitle="Transport" icon={<UserCog size={18} />} />

      <Card title={isEditing ? "Edit Driver Details" : "Add Driver Details"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={set("name")} placeholder="Enter Name" />
          <Input label="Driving License No *" value={form.licenseNo} onChange={set("licenseNo")} placeholder="Enter Driving Licence" />
          <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="Enter Phone" />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="Enter Email" />
          <Input label="Age (Number)" type="number" min="0" value={form.age} onChange={set("age")} placeholder="0" />
          <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-[13px] font-semibold text-slate-700">Enabled</span>
          </label>
          <div className="md:col-span-2">
            <Textarea label="Address" value={form.address} onChange={set("address")} placeholder="Enter Address" />
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          {isEditing && <Button variant="secondary" icon={<X size={14} />} onClick={() => setForm(BLANK)}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={isLoading} onClick={submit}>Submit</Button>
        </div>
      </Card>

      <Card
        noPadding
        title="All Driver List"
        action={
          <ExportButton
            filename="transport-drivers.csv"
            rows={drivers}
            columns={[
              { label: "Name", get: (r) => r.name },
              { label: "Driving License No", get: (r) => r.licenseNo },
              { label: "Phone", get: (r) => r.phone || "" },
              { label: "Email", get: (r) => r.email || "" },
              { label: "Age", get: (r) => r.age ?? "" },
            ]}
          />
        }
      >
        <DataTable columns={columns} data={drivers} loading={isFetching} emptyText="No drivers yet." />
      </Card>
    </div>
  );
}
