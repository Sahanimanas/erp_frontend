/**
 * Fee Management → Manage Transport Route Fee
 * Pick a route (or add one) and set its monthly fee.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, DataTable, Badge, ExportButton } from "../../components/ui";
import { Bus, Save, Plus } from "lucide-react";
import { useGetRoutesQuery, useUpsertRouteMutation } from "../../redux/api/feeMgmtApi";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function TransportRouteFeePage() {
  usePageTitle("Transport Route Fee");
  const { data: routes = [], isFetching } = useGetRoutesQuery();
  const [upsert, { isLoading }] = useUpsertRouteMutation();

  const [routeId, setRouteId] = useState("");
  const [newName, setNewName] = useState("");
  const [fee, setFee] = useState("");

  const selected = routes.find((r) => r.id === routeId);

  const saveExisting = async () => {
    if (!selected) { toast.error("Select a route"); return; }
    try {
      await upsert({ id: selected.id, name: selected.name, fee: Number(fee) || 0 }).unwrap();
      toast.success("Route fee saved");
    } catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  const addRoute = async () => {
    if (!newName.trim()) { toast.error("Route name required"); return; }
    try {
      await upsert({ name: newName, fee: 0 }).unwrap();
      toast.success("Route added");
      setNewName("");
    } catch (e) { toast.error(e?.data?.error || "Failed to add route"); }
  };

  const columns = [
    { key: "name", label: "Route", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "fee", label: "Monthly Fee", render: (v) => <Badge variant="cyan">{money(v)}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Transport Route Fee" subtitle="Set the fee for each transport route" icon={<Bus size={18} />} />

      <Card title="Search Transport Route Fee">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select label="Select Route" value={routeId} onChange={(e) => { setRouteId(e.target.value); const r = routes.find((x) => x.id === e.target.value); setFee(r ? String(Number(r.fee)) : ""); }}
            options={[{ value: "", label: "Select…" }, ...routes.map((r) => ({ value: r.id, label: r.name }))]} />
          <Input label="Monthly Fee (₹)" type="number" value={fee} onChange={(e) => setFee(e.target.value)} disabled={!routeId} />
          <Button icon={<Save size={14} />} loading={isLoading} disabled={!routeId} onClick={saveExisting}>Save Route Fee</Button>
        </div>
      </Card>

      <Card title="Add Route">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input label="New Route Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="SCHOOL TO BAZAR SAMITI" className="md:col-span-2" />
          <Button variant="secondary" icon={<Plus size={14} />} loading={isLoading} onClick={addRoute}>Add Route</Button>
        </div>
      </Card>

      <Card
        noPadding
        title="Routes"
        action={
          <ExportButton
            filename="transport-route-fees.csv"
            rows={routes}
            columns={[
              { label: "Route", get: (r) => r.name },
              { label: "Monthly Fee", get: (r) => Number(r.fee || 0) },
            ]}
          />
        }
      >
        <DataTable columns={columns} data={routes} loading={isFetching} emptyText="No transport routes yet." />
      </Card>
    </div>
  );
}
