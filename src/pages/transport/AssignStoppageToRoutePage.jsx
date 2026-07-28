/**
 * Transport → Assign Stoppage To Route
 * Pick a route, then add its stops with a pickup time, running order and
 * start/stop/end type.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge, ExportButton } from "../../components/ui";
import { MapPinned, Save, Trash2, ExternalLink } from "lucide-react";
import {
  useGetTransportRoutesQuery,
  useGetStoppagesQuery,
  useGetRouteStoppagesQuery,
  useAddRouteStoppageMutation,
  useDeleteRouteStoppageMutation,
} from "../../redux/api/transportApi";

const STOP_TYPES = [
  { value: "START_POINT", label: "Start Point" },
  { value: "STOPPAGE_POINT", label: "Stoppage Point" },
  { value: "END_POINT", label: "End Point" },
];
const typeLabel = (v) => STOP_TYPES.find((t) => t.value === v)?.label || v;

export default function AssignStoppageToRoutePage() {
  usePageTitle("Assign Stoppage To Route");
  const { data: routes = [] } = useGetTransportRoutesQuery();
  const { data: stoppages = [] } = useGetStoppagesQuery();

  const [routeId, setRouteId] = useState("");
  // Skip the query until a route is chosen — otherwise it fetches every route's
  // stops just to throw them away.
  const { data: rows = [], isFetching } = useGetRouteStoppagesQuery(routeId, { skip: !routeId });

  const [add, { isLoading }] = useAddRouteStoppageMutation();
  const [remove] = useDeleteRouteStoppageMutation();

  const [stoppageId, setStoppageId] = useState("");
  const [time, setTime] = useState("");
  const [sequenceNo, setSequenceNo] = useState("");
  const [stopType, setStopType] = useState("STOPPAGE_POINT");
  const [enabled, setEnabled] = useState(true);

  const reset = () => { setStoppageId(""); setTime(""); setSequenceNo(""); setStopType("STOPPAGE_POINT"); setEnabled(true); };

  const submit = async () => {
    if (!routeId) return toast.error("Select a route first");
    if (!stoppageId) return toast.error("Select a stoppage");
    try {
      await add({ routeId, stoppageId, time, sequenceNo: Number(sequenceNo) || 0, stopType, enabled }).unwrap();
      toast.success("Stoppage assigned to route");
      reset();
    } catch (e) { toast.error(e?.data?.error || "Failed to assign stoppage"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Remove "${row.stoppage?.name}" from this route?`)) return;
    try {
      await remove(row.id).unwrap();
      toast.success("Stoppage removed from route");
    } catch (e) { toast.error(e?.data?.error || "Failed to remove stoppage"); }
  };

  const columns = [
    { key: "sl", label: "Sl. No" },
    { key: "route", label: "Route Name", render: (_v, r) => r.route?.name || "—" },
    { key: "stoppage", label: "Stoppage Name", render: (_v, r) => <span className="font-semibold text-slate-800">{r.stoppage?.name || "—"}</span> },
    { key: "time", label: "Time", render: (v) => v || "—" },
    { key: "sequenceNo", label: "Sequence" },
    { key: "stopType", label: "Stop Type", render: (v) => <Badge variant={v === "START_POINT" ? "green" : v === "END_POINT" ? "amber" : "default"}>{typeLabel(v)}</Badge> },
    { key: "enabled", label: "Enabled", render: (v) => (v ? "Yes" : "No") },
    {
      key: "map", label: "Map", sortable: false, render: (_v, r) => (
        r.stoppage?.latitude != null && r.stoppage?.longitude != null ? (
          <a href={`https://www.google.com/maps?q=${r.stoppage.latitude},${r.stoppage.longitude}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-[12px] font-semibold">
            View <ExternalLink size={11} />
          </a>
        ) : <span className="text-slate-400 text-[12px]">Not pinned</span>
      ),
    },
    {
      key: "actions", label: "Actions", sortable: false, render: (_v, r) => (
        <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Remove</Button>
      ),
    },
  ];

  // Stops already on this route shouldn't be offered again — re-adding one just
  // edits it, which is confusing in an "Add" form.
  const used = new Set(rows.map((r) => r.stoppageId));
  const available = stoppages.filter((s) => !used.has(s.id));

  // DataTable's render gets (value, row) only — no index — and it sorts rows
  // internally, so the serial has to be a real field on the row.
  const tableRows = rows.map((r, i) => ({ ...r, sl: i + 1 }));

  return (
    <div className="space-y-4">
      <PageHeader title="Assign Stoppage To Route" subtitle="Transport" icon={<MapPinned size={18} />} />

      <Card title="Assign Stoppage To Route">
        <div className="p-5">
          <Select label="Route Name *" value={routeId} onChange={(e) => setRouteId(e.target.value)}
            options={[{ value: "", label: "Select…" }, ...routes.map((r) => ({ value: r.id, label: r.name }))]} />
        </div>
      </Card>

      {routeId && (
        <>
          <Card title="Add Stoppage To Route">
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Select Stoppage *" value={stoppageId} onChange={(e) => setStoppageId(e.target.value)}
                options={[
                  { value: "", label: available.length ? "Select…" : "All stoppages already added" },
                  ...available.map((s) => ({ value: s.id, label: s.name })),
                ]} />
              <Input label="Select Time *" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <Input label="Sequence No *" type="number" min="0" value={sequenceNo} onChange={(e) => setSequenceNo(e.target.value)} placeholder="0" />
              <Select label="Stoppage Type *" value={stopType} onChange={(e) => setStopType(e.target.value)} options={STOP_TYPES} />
              <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-[13px] font-semibold text-slate-700">Enabled</span>
              </label>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <Button icon={<Save size={14} />} loading={isLoading} onClick={submit}>Submit</Button>
            </div>
          </Card>

          <Card
            noPadding
            title="Transport Route Stoppage List"
            action={
              <ExportButton
                filename="route-stoppages.csv"
                rows={rows}
                columns={[
                  { label: "Route", get: (r) => r.route?.name || "" },
                  { label: "Stoppage", get: (r) => r.stoppage?.name || "" },
                  { label: "Time", get: (r) => r.time || "" },
                  { label: "Sequence", get: (r) => r.sequenceNo },
                  { label: "Stop Type", get: (r) => typeLabel(r.stopType) },
                ]}
              />
            }
          >
            <DataTable columns={columns} data={tableRows} loading={isFetching} emptyText="No stoppages on this route yet." />
          </Card>
        </>
      )}
    </div>
  );
}
