/**
 * Super Admin → Create School (onboarding wizard, single page)
 * Three sections: Basic details · Domain (live subdomain check) · Subscription.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Check, X, Loader2, Copy, ArrowLeft } from "lucide-react";
import { Card, Input, Select, Button, PageHeader, Modal } from "../../components/ui";
import {
  useCreateSchoolMutation, useCheckSubdomainMutation, useGetPlansQuery, useGetModulesQuery,
} from "../../redux/api/superAdminApi";
import { ROOT_DOMAIN, formatBytes, formatMoney } from "./_saShared";

const EMPTY = {
  name: "", schoolCode: "", email: "", phone: "",
  address: "", city: "", state: "", country: "India", logo: "",
  subdomain: "",
  planId: "", isTrial: false, expiryDate: "",
  adminFirstName: "", adminLastName: "", adminEmail: "",
};

export default function CreateSchoolPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [enabledModules, setEnabledModules] = useState([]);
  const [subState, setSubState] = useState({ status: "idle", reason: "", fqdn: "" });
  const [created, setCreated] = useState(null);
  const debounceRef = useRef();

  const { data: plansData } = useGetPlansQuery();
  const { data: modules } = useGetModulesQuery();
  const [checkSubdomain] = useCheckSubdomainMutation();
  const [createSchool, { isLoading }] = useCreateSchoolMutation();

  const plans = plansData?.rows ?? [];
  const selectedPlan = plans.find((p) => p.id === form.planId);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Default enabled modules to the plan's feature flags when a plan is picked.
  useEffect(() => {
    if (selectedPlan?.featureFlags?.length) setEnabledModules(selectedPlan.featureFlags);
  }, [form.planId]); // eslint-disable-line

  // Live subdomain availability (debounced).
  const runCheck = useCallback((value) => {
    if (!value) { setSubState({ status: "idle", reason: "", fqdn: "" }); return; }
    setSubState({ status: "checking", reason: "", fqdn: "" });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkSubdomain(value).unwrap();
        setSubState({
          status: res.available ? "available" : "taken",
          reason: res.reason || "",
          fqdn: res.fqdn || `${value}.${ROOT_DOMAIN}`,
        });
      } catch {
        setSubState({ status: "taken", reason: "Could not validate subdomain", fqdn: "" });
      }
    }, 400);
  }, [checkSubdomain]);

  const onSubdomain = (e) => {
    // Sanitize as the user types: lowercase, strip invalid chars.
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, subdomain: value }));
    runCheck(value);
  };

  const toggleModule = (key) =>
    setEnabledModules((m) => (m.includes(key) ? m.filter((x) => x !== key) : [...m, key]));

  const canSubmit =
    form.name.trim() && form.email.trim() && form.subdomain && subState.status === "available";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Fill the required fields and pick an available subdomain");
      return;
    }
    try {
      const payload = {
        ...form,
        planId: form.planId || undefined,
        expiryDate: form.expiryDate || undefined,
        enabledModules,
        adminEmail: form.adminEmail || form.email,
      };
      const school = await createSchool(payload).unwrap();
      toast.success("School created");
      setCreated(school);
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create school");
    }
  };

  const SubdomainHint = () => {
    if (subState.status === "checking") return <span className="flex items-center gap-1 text-slate-400 text-[11px]"><Loader2 size={12} className="animate-spin" /> Checking…</span>;
    if (subState.status === "available") return <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold"><Check size={12} /> Available</span>;
    if (subState.status === "taken") return <span className="flex items-center gap-1 text-red-500 text-[11px] font-semibold"><X size={12} /> {subState.reason || "Unavailable"}</span>;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <PageHeader title="Create School" subtitle="Onboard a new tenant onto the platform" icon={<Building2 size={18} />}>
        <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate("/super-admin/schools")}>Back</Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Basic details ── */}
        <Card title="Basic Details" subtitle="School identity & contact">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="School Name *" value={form.name} onChange={set("name")} placeholder="Greenwood High" />
            <Input label="School Code" value={form.schoolCode} onChange={set("schoolCode")} placeholder="GWH-001" />
            <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="admin@greenwood.com" />
            <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="9876543210" />
            <Input label="Address" value={form.address} onChange={set("address")} className="md:col-span-2" />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
            <Input label="Country" value={form.country} onChange={set("country")} />
            <Input label="Logo URL" value={form.logo} onChange={set("logo")} placeholder="https://…" />
          </div>
        </Card>

        {/* ── Domain ── */}
        <Card title="Domain" subtitle="Custom subdomain on the platform">
          <div className="p-5 space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">Subdomain *</label>
            <div className="flex items-stretch gap-0 max-w-md">
              <input
                value={form.subdomain}
                onChange={onSubdomain}
                placeholder="greenwood"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-l-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <span className="inline-flex items-center px-3 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-[12px] text-slate-500 font-mono">
                .{ROOT_DOMAIN}
              </span>
            </div>
            <div className="h-4"><SubdomainHint /></div>
            <p className="text-[11px] text-slate-400">
              Lowercase letters, numbers and hyphens only. Reserved names (admin, api, www…) are blocked.
            </p>
          </div>
        </Card>

        {/* ── Subscription ── */}
        <Card title="Subscription" subtitle="Plan, limits & enabled modules">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Plan"
                value={form.planId}
                onChange={set("planId")}
                options={[{ value: "", label: "Select plan…" }, ...plans.map((p) => ({ value: p.id, label: `${p.name} · ${formatMoney(p.price)}/mo` }))]}
              />
              <Select
                label="Billing Type"
                value={form.isTrial ? "trial" : "paid"}
                onChange={(e) => setForm((f) => ({ ...f, isTrial: e.target.value === "trial" }))}
                options={[{ value: "paid", label: "Paid (Active)" }, { value: "trial", label: "Free Trial" }]}
              />
              <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={set("expiryDate")} />
            </div>

            {selectedPlan && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PlanStat label="Student Limit" value={selectedPlan.maxStudents?.toLocaleString()} />
                <PlanStat label="User Limit" value={selectedPlan.maxUsers?.toLocaleString()} />
                <PlanStat label="Storage" value={formatBytes(selectedPlan.storageLimit)} />
                <PlanStat label="Price" value={`${formatMoney(selectedPlan.price)}/mo`} />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">Enabled Modules</label>
              <div className="flex flex-wrap gap-2">
                {(modules ?? []).map((m) => {
                  const on = enabledModules.includes(m.key);
                  return (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => toggleModule(m.key)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                        on ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">No modules selected = all modules enabled.</p>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Admin First Name" value={form.adminFirstName} onChange={set("adminFirstName")} placeholder="School" />
              <Input label="Admin Last Name" value={form.adminLastName} onChange={set("adminLastName")} placeholder="Admin" />
              <Input label="Admin Email" type="email" value={form.adminEmail} onChange={set("adminEmail")} placeholder="defaults to school email" />
            </div>
            <p className="text-[11px] text-slate-400">A School Admin account is created automatically. A temporary password is generated and shown once.</p>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/super-admin/schools")}>Cancel</Button>
          <Button type="submit" loading={isLoading} disabled={!canSubmit}>Create School</Button>
        </div>
      </form>

      {/* Success modal with the generated admin credentials */}
      <Modal open={!!created} onClose={() => navigate("/super-admin/schools")} title="School created 🎉" size="md">
        {created && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">{created.name}</span> is live at{" "}
              <span className="font-mono text-indigo-600">{created.domain?.domain}</span>.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">School Admin Login</p>
              <CredRow label="Email" value={created.adminUser?.email} />
              {created.adminUser?.temporaryPassword && (
                <CredRow label="Temp Password" value={created.adminUser.temporaryPassword} mono />
              )}
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                ⚠ Save this password now — it won't be shown again.
              </p>
            </div>

            {/* Whether the welcome email actually went out. Without this the
                operator would assume the school was notified and never hand the
                password over — the failure is silent otherwise. */}
            {created.credentialsEmail && (
              created.credentialsEmail.sent ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
                  ✓ Login details emailed to <b>{created.credentialsEmail.to}</b>.
                </p>
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                  ⚠ Could not email the login details to <b>{created.credentialsEmail.to}</b> — share them manually.
                  {created.credentialsEmail.error ? <span className="block mt-0.5 text-[11px] text-amber-600">{created.credentialsEmail.error}</span> : null}
                </p>
              )
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setForm(EMPTY); setSubState({ status: "idle" }); setCreated(null); }}>Create Another</Button>
              <Button onClick={() => navigate(`/super-admin/schools/${created.id}`)}>View School</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PlanStat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-[13px] font-bold text-slate-700">{value ?? "—"}</p>
    </div>
  );
}

function CredRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-[12.5px] text-slate-800 ${mono ? "font-mono font-bold" : ""}`}>{value}</span>
        <button
          type="button"
          onClick={() => { navigator.clipboard?.writeText(value); toast.success("Copied"); }}
          className="text-slate-400 hover:text-indigo-600"
        >
          <Copy size={13} />
        </button>
      </span>
    </div>
  );
}
