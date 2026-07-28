/**
 * Transport → Manage Transport Route
 *
 * The one place transport routes are managed — operational detail (from/to,
 * vehicle, driver, staff) AND the monthly fee. The fee feeds the payments
 * ledger: a student on this route is billed this amount per selected transport
 * month, so editing it changes what riders owe.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge, ExportButton } from "../../components/ui";
import { Route as RouteIcon, Save, Pencil, X, Trash2 } from "lucide-react";
import {
  useGetTransportRoutesQuery,
  useUpsertTransportRouteMutation,
  useDeleteTransportRouteMutation,
  useGetVehiclesQuery,
  useGetDriversQuery,
} from "../../redux/api/transportApi";
import { useGetEmployeesQuery } from "../../redux/api/otherApis";

const BLANK = { id: "", name: "", routeFrom: "", routeTo: "", vehicleId: "", driverId: "", staffId: "", fee: "0", enabled: true };
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const empName = (e) => [e?.user?.firstName, e?.user?.lastName].filter(Boolean).join(" ").trim() || e?.employeeCode || "—";

export default function ManageTransportRoutePage() {
  usePageTitle("Manage Transport Route");
  const { data: routes = [], isFetching } = useGetTransportRoutesQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();
  const { data: drivers = [] } = useGetDriversQuery();
  // Staff dropdown — /hr/employees is paginated, so ask for a large page.
  const { data: empRes } = useGetEmployeesQuery({ page: 1, limit: 500 });
  const employees = empRes?.data ?? [];

  const [upsert, { isLoading }] = useUpsertTransportRouteMutation();
  const [remove] = useDeleteTransportRouteMutation();

  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEditing = Boolean(form.id);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Route name is required");
    try {
      await upsert({ ...form, fee: Number(form.fee) || 0 }).unwrap();
      toast.success(isEditing ? "Route updated" : "Route added");
      setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to save route"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete route "${row.name}"? Its stoppages will be removed too.`)) return;
    try {
      await remove(row.id).unwrap();
      toast.success("Route deleted");
      if (form.id === row.id) setForm(BLANK);
    } catch (e) { toast.error(e?.data?.error || "Failed to delete route"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "routeFrom", label: "Route From", render: (v) => v || "N/A" },
    { key: "routeTo", label: "Route To", render: (v) => v || "N/A" },
    { key: "vehicleName", label: "Vehicle Name", render: (v) => v || "N/A" },
    { key: "driverName", label: "Driver Name", render: (v) => v || "N/A" },
    { key: "staffName", label: "Staff Name", render: (v) => v || "N/A" },
    { key: "fee", label: "Monthly Fee", render: (v) => <Badge variant="cyan">{money(v)}</Badge> },
    { key: "stoppageCount", label: "Stops", render: (v) => v ?? 0 },
    { key: "studentCount", label: "Students", render: (v) => v ?? 0 },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "green" : "default"}>{v ? "Yes" : "No"}</Badge> },
    {
      key: "actions", label: "Actions", sortable: false, render: (_v, r) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="secondary" icon={<Pencil size={12} />} onClick={() => setForm({
            id: r.id, name: r.name, routeFrom: r.routeFrom || "", routeTo: r.routeTo || "",
            vehicleId: r.vehicleId || "", driverId: r.driverId || "", staffId: r.staffId || "",
            fee: String(Number(r.fee) || 0), enabled: r.enabled,
          })}>Edit</Button>
          <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Transport Route" subtitle="Transport" icon={<RouteIcon size={18} />} />

      <Card title={isEditing ? "Edit Transport Route" : "Add Transport Route"}
        subtitle="The monthly fee set here is what riders on this route are billed per transport month.">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Route Name *" value={form.name} onChange={set("name")} placeholder="Enter Name" />
          <Input label="Route From" value={form.routeFrom} onChange={set("routeFrom")} placeholder="Enter Route From" />
          <Input label="Route To" value={form.routeTo} onChange={set("routeTo")} placeholder="Enter Route To" />
          <Select label="Select Vehicle" value={form.vehicleId} onChange={set("vehicleId")}
            options={[{ value: "", label: "Select…" }, ...vehicles.map((v) => ({ value: v.id, label: `${v.name} (${v.vehicleNumber})` }))]} />
          <Select label="Select Driver" value={form.driverId} onChange={set("driverId")}
            options={[{ value: "", label: "Select…" }, ...drivers.map((d) => ({ value: d.id, label: d.name }))]} />
          <Select label="Assign Employee For Route" value={form.staffId} onChange={set("staffId")}
            options={[{ value: "", label: "Select…" }, ...employees.map((e) => ({ value: e.id, label: empName(e) }))]} />
          <Input label="Monthly Fee (₹)" type="number" min="0" value={form.fee} onChange={set("fee")} placeholder="0" />
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
        title="All Transport Route List"
        action={
          <ExportButton
            filename="transport-routes.csv"
            rows={routes}
            columns={[
              { label: "Name", get: (r) => r.name },
              { label: "Route From", get: (r) => r.routeFrom || "" },
              { label: "Route To", get: (r) => r.routeTo || "" },
              { label: "Vehicle", get: (r) => r.vehicleName || "" },
              { label: "Driver", get: (r) => r.driverName || "" },
              { label: "Staff", get: (r) => r.staffName || "" },
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
