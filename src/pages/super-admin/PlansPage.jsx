/**
 * Super Admin → Subscription Plans
 * Catalog of plans with create/edit. Limits & feature flags per plan.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Plus, Pencil, Check } from "lucide-react";
import { Card, PageHeader, Button, Modal, Input, Select, Badge, Skeleton } from "../../components/ui";
import {
  useGetPlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useGetModulesQuery,
} from "../../redux/api/superAdminApi";
import { formatMoney, formatBytes } from "./_saShared";

const GB = 1024 * 1024 * 1024;
const blank = { name: "", price: 0, billingCycle: "monthly", maxUsers: 100, maxStudents: 1000, storageGb: 10, featureFlags: [] };

export default function PlansPage() {
  const { data, isLoading } = useGetPlansQuery();
  const { data: modules } = useGetModulesQuery();
  const [createPlan, { isLoading: creating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: updating }] = useUpdatePlanMutation();

  const [editing, setEditing] = useState(null); // plan id or "new" or null
  const [form, setForm] = useState(blank);

  const plans = data?.rows ?? [];

  const openNew = () => { setForm(blank); setEditing("new"); };
  const openEdit = (p) => {
    setForm({
      name: p.name, price: p.price, billingCycle: p.billingCycle,
      maxUsers: p.maxUsers, maxStudents: p.maxStudents,
      storageGb: Math.round(Number(p.storageLimit) / GB),
      featureFlags: p.featureFlags || [],
    });
    setEditing(p.id);
  };

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleFlag = (key) => setForm((f) => ({
    ...f, featureFlags: f.featureFlags.includes(key) ? f.featureFlags.filter((x) => x !== key) : [...f.featureFlags, key],
  }));

  const submit = async () => {
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      billingCycle: form.billingCycle,
      maxUsers: Number(form.maxUsers),
      maxStudents: Number(form.maxStudents),
      storageLimit: Math.round(Number(form.storageGb) * GB),
      featureFlags: form.featureFlags,
    };
    if (!payload.name) { toast.error("Plan name is required"); return; }
    try {
      if (editing === "new") { await createPlan(payload).unwrap(); toast.success("Plan created"); }
      else { await updatePlan({ id: editing, ...payload }).unwrap(); toast.success("Plan updated"); }
      setEditing(null);
    } catch (e) {
      toast.error(e?.data?.error || "Failed to save plan");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Subscription Plans" subtitle="Pricing tiers & feature entitlements" icon={<CreditCard size={18} />}>
        <Button icon={<Plus size={15} />} onClick={openNew}>New Plan</Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-slate-800">{p.name}</h3>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil size={13} /></button>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-800">
                  {formatMoney(p.price)}<span className="text-xs text-slate-400 font-normal"> / {p.billingCycle}</span>
                </p>
                <div className="mt-4 space-y-2 text-[12.5px] text-slate-600">
                  <Feature ok>{Number(p.maxStudents).toLocaleString()} students</Feature>
                  <Feature ok>{Number(p.maxUsers).toLocaleString()} users</Feature>
                  <Feature ok>{formatBytes(p.storageLimit)} storage</Feature>
                  <Feature ok>{(p.featureFlags?.length || 0)} modules</Feature>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(p.featureFlags || []).map((f) => <Badge key={f} variant="default">{f}</Badge>)}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400">
                {p._count?.subscriptions ?? 0} active subscription(s)
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Create Plan" : "Edit Plan"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Plan Name" value={form.name} onChange={setF("name")} placeholder="Professional" />
            <Select label="Billing Cycle" value={form.billingCycle} onChange={setF("billingCycle")}
              options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
            <Input label="Price (₹)" type="number" value={form.price} onChange={setF("price")} />
            <Input label="Storage (GB)" type="number" value={form.storageGb} onChange={setF("storageGb")} />
            <Input label="Max Students" type="number" value={form.maxStudents} onChange={setF("maxStudents")} />
            <Input label="Max Users" type="number" value={form.maxUsers} onChange={setF("maxUsers")} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">Included Modules</label>
            <div className="flex flex-wrap gap-2">
              {(modules ?? []).map((m) => {
                const on = form.featureFlags.includes(m.key);
                return (
                  <button key={m.key} type="button" onClick={() => toggleFlag(m.key)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${on ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={creating || updating} onClick={submit}>{editing === "new" ? "Create Plan" : "Save Plan"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Feature({ ok, children }) {
  return (
    <div className="flex items-center gap-2">
      <Check size={13} className={ok ? "text-emerald-500" : "text-slate-300"} />
      <span>{children}</span>
    </div>
  );
}
