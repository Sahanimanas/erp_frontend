/**
 * Transport → Manage Stoppage
 *
 * The reference system pins stops on an embedded Google Map. That needs a Maps
 * JS API key this project doesn't carry, so coordinates are entered directly
 * (or pasted from a map) and each pinned stop links out to the map instead.
 * Lat/lng stay optional — a stop can be named now and pinned later.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, DataTable, Badge, ExportButton } from "../../components/ui";
import { MapPin, Save, Pencil, X, Trash2, ExternalLink } from "lucide-react";
import {
  useGetStoppagesQuery,
  useUpsertStoppageMutation,
  useDeleteStoppageMutation,
} from "../../redux/api/transportApi";

const BLANK = { id: "", name: "", latitude: "", longitude: "", enabled: true };

export default function ManageStoppagePage() {
  usePageTitle("Manage Stoppage");
  const { data: stoppages = [], isFetching } = useGetStoppagesQuery();
  const [upsert, { isLoading }] = useUpsertStoppageMutation();
  const [remove] = useDeleteStoppageMutation();

  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEditing = Boolean(form.id);

  /** Accepts "25.84, 85.66" pasted straight out of Google Maps. */
  const pastePair = (e) => {
    const parts = String(e.target.value).split(",").map((s) => s.trim());
    if (parts.length === 2 && parts.every((p) => p !== "" && Number.isFinite(Number(p)))) {
      setForm((f) => ({ ...f, latitude: parts[0], longitude: parts[1] }));
    }
  };

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Stop name is required");
    try {
      await upsert(form).unwrap();
      toast.success(isEditing ? "Stoppage updated" : "Stoppage added");
      setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to save stoppage"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete stoppage "${row.name}"?`)) return;
    try {
      await remove(row.id).unwrap();
      toast.success("Stoppage deleted");
      if (form.id === row.id) setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to delete stoppage"); }
  };

  const columns = [
    { key: "name", label: "Stop Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "latitude", label: "Latitude", render: (v) => (v == null ? "N/A" : v) },
    { key: "longitude", label: "Longitude", render: (v) => (v == null ? "N/A" : v) },
    {
      key: "map", label: "Map", sortable: false, render: (_v, r) => (
        r.latitude != null && r.longitude != null ? (
          <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-[12px] font-semibold">
            View <ExternalLink size={11} />
          </a>
        ) : <span className="text-slate-400 text-[12px]">Not pinned</span>
      ),
    },
    { key: "createdAt", label: "Create Date", render: (v) => (v ? new Date(v).toLocaleString() : "—") },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "green" : "default"}>{v ? "Yes" : "No"}</Badge> },
    {
      key: "actions", label: "Actions", sortable: false, render: (_v, r) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="secondary" icon={<Pencil size={12} />} onClick={() => setForm({
            id: r.id, name: r.name,
            latitude: r.latitude == null ? "" : String(r.latitude),
            longitude: r.longitude == null ? "" : String(r.longitude),
            enabled: r.enabled,
          })}>Edit</Button>
          <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Vehicle Stoppage" subtitle="Transport" icon={<MapPin size={18} />} />

      <Card title={isEditing ? "Edit Vehicle Stoppage" : "Add Vehicle Stoppage"}>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Stop Name *" value={form.name} onChange={set("name")} placeholder="Enter Stop Name" />
            <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-[13px] font-semibold text-slate-700">Enabled</span>
            </label>
          </div>
          <Input label="Paste coordinates (optional)" onChange={pastePair}
            placeholder="Paste “25.8498572, 85.6666046” from Google Maps to fill both fields" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={set("latitude")} placeholder="Optional" />
            <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={set("longitude")} placeholder="Optional" />
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          {isEditing && <Button variant="secondary" icon={<X size={14} />} onClick={() => setForm(BLANK)}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={isLoading} onClick={submit}>Submit</Button>
        </div>
      </Card>

      <Card
        noPadding
        title="All Vehicle Stoppage"
        action={
          <ExportButton
            filename="transport-stoppages.csv"
            rows={stoppages}
            columns={[
              { label: "Stop Name", get: (r) => r.name },
              { label: "Latitude", get: (r) => r.latitude ?? "" },
              { label: "Longitude", get: (r) => r.longitude ?? "" },
              { label: "Enabled", get: (r) => (r.enabled ? "Yes" : "No") },
            ]}
          />
        }
      >
        <DataTable columns={columns} data={stoppages} loading={isFetching} emptyText="No stoppages yet." />
      </Card>
    </div>
  );
}
