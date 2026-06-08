/**
 * Super Admin → School Details
 * Tabbed tenant control panel: Overview · Users · Subscription · Modules ·
 * Storage · Activity Logs · Settings.
 */
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2, ArrowLeft, LogIn, Users as UsersIcon, HardDrive, Layers,
  CreditCard, ScrollText, Settings as SettingsIcon, Mail, Phone, MapPin, Globe,
} from "lucide-react";
import {
  Card, Tabs, PageHeader, Button, Input, Select, DataTable, Pagination,
  Badge, ProgressBar, Skeleton, EmptyState, StatCard,
} from "../../components/ui";
import {
  useGetSchoolQuery, useGetSchoolUsersQuery, useGetSchoolSubscriptionQuery,
  useGetPlansQuery, useGetModulesQuery, useAssignSubscriptionMutation,
  useUpdateSchoolModulesMutation, useUpdateSchoolMutation, useSuspendSchoolMutation,
  useActivateSchoolMutation, useGetAuditLogsQuery, useLoginAsSchoolAdminMutation,
} from "../../redux/api/superAdminApi";
import {
  StatusBadge, PlanBadge, formatBytes, formatMoney, formatDate, formatDateTime,
} from "./_saShared";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "subscription", label: "Subscription" },
  { key: "modules", label: "Modules" },
  { key: "storage", label: "Storage" },
  { key: "activity", label: "Activity Logs" },
  { key: "settings", label: "Settings" },
];

export default function SchoolDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const active = params.get("tab") || "overview";
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  const { data: school, isLoading, isError } = useGetSchoolQuery(id);
  const [loginAs, { isLoading: impersonating }] = useLoginAsSchoolAdminMutation();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-96" /></div>;
  if (isError || !school) {
    return <EmptyState icon="🏫" title="School not found" description="It may have been deleted." action={<Button onClick={() => navigate("/super-admin/schools")}>Back to Schools</Button>} />;
  }

  const sub = school.subscriptions?.[0];

  const handleLoginAs = async () => {
    try {
      const res = await loginAs(id).unwrap();
      try { await navigator.clipboard.writeText(res.accessToken); } catch { /* ignore */ }
      toast.success("Impersonation token copied to clipboard");
    } catch (e) {
      toast.error(e?.data?.error || "Could not impersonate");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title={school.name} subtitle={school.primaryDomain || `${school.slug}.schoolerp.com`} icon={<Building2 size={18} />}>
        <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate("/super-admin/schools")}>Back</Button>
        <Button icon={<LogIn size={15} />} loading={impersonating} onClick={handleLoginAs}>Login as Admin</Button>
      </PageHeader>

      {/* Identity strip */}
      <Card>
        <div className="p-5 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
              {school.name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-slate-800">{school.name}</h2>
                <StatusBadge status={school.derivedStatus} />
              </div>
              <p className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={12} /> {school.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PlanBadge plan={sub?.plan?.name} />
            {sub && <Badge variant="default">Renews {formatDate(sub.endDate)}</Badge>}
          </div>
        </div>
      </Card>

      <Tabs tabs={TABS} active={active} onChange={setTab} />

      {active === "overview" && <OverviewTab school={school} sub={sub} />}
      {active === "users" && <UsersTab schoolId={id} />}
      {active === "subscription" && <SubscriptionTab schoolId={id} sub={sub} />}
      {active === "modules" && <ModulesTab school={school} />}
      {active === "storage" && <StorageTab school={school} sub={sub} />}
      {active === "activity" && <ActivityTab schoolId={id} />}
      {active === "settings" && <SettingsTab school={school} />}
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────
function OverviewTab({ school, sub }) {
  const info = [
    { icon: Mail, label: "Email", value: school.email },
    { icon: Phone, label: "Phone", value: school.phone || "—" },
    { icon: MapPin, label: "Location", value: [school.city, school.state, school.country].filter(Boolean).join(", ") || "—" },
    { icon: Globe, label: "Subdomain", value: school.primaryDomain || `${school.slug}.schoolerp.com` },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Students" value={school._count?.students ?? 0} icon={UsersIcon} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard label="Teachers" value={school.teacherCount ?? 0} icon={UsersIcon} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard label="Total Users" value={school._count?.users ?? 0} icon={UsersIcon} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard label="Storage Used" value={formatBytes(school.storageUsed)} icon={HardDrive} gradient="bg-gradient-to-br from-cyan-500 to-cyan-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="School Information">
          <div className="p-5 space-y-3">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center"><Icon size={15} /></div>
                <div><p className="text-[11px] text-slate-400">{label}</p><p className="text-[13px] text-slate-700 font-medium">{value}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Subscription">
          <div className="p-5 space-y-3">
            <Row label="Plan" value={<PlanBadge plan={sub?.plan?.name} />} />
            <Row label="Status" value={<StatusBadge status={school.derivedStatus} />} />
            <Row label="Price" value={sub?.plan ? `${formatMoney(sub.plan.price)} / ${sub.plan.billingCycle}` : "—"} />
            <Row label="Started" value={formatDate(sub?.startDate)} />
            <Row label="Expires" value={formatDate(sub?.endDate)} />
            <Row label="Created" value={formatDate(school.createdAt)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Users ───────────────────────────────────────────────────────────────────
function UsersTab({ schoolId }) {
  const [role, setRole] = useState("");
  const { data: users, isLoading } = useGetSchoolUsersQuery({ id: schoolId, role });
  const columns = [
    { key: "firstName", label: "Name", render: (_v, r) => `${r.firstName} ${r.lastName}` },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (v) => <Badge variant="indigo">{v}</Badge> },
    { key: "isActive", label: "Status", render: (v) => <StatusBadge status={v ? "active" : "inactive"} /> },
    { key: "lastLogin", label: "Last Login", render: (v) => (v ? formatDateTime(v) : "Never") },
  ];
  return (
    <Card noPadding>
      <div className="p-4 border-b border-slate-100 flex gap-3">
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "", label: "All Roles" },
            { value: "SCHOOL_ADMIN", label: "Admins" },
            { value: "PRINCIPAL", label: "Principals" },
            { value: "TEACHER", label: "Teachers" },
            { value: "ACCOUNTANT", label: "Accountants" },
            { value: "STUDENT", label: "Students" },
            { value: "PARENT", label: "Parents" },
          ]}
          className="w-48"
        />
      </div>
      <DataTable columns={columns} data={users ?? []} loading={isLoading} emptyText="No users for this filter." />
    </Card>
  );
}

// ── Subscription ──────────────────────────────────────────────────────────────
function SubscriptionTab({ schoolId, sub }) {
  const { data: plansData } = useGetPlansQuery();
  const [assign, { isLoading }] = useAssignSubscriptionMutation();
  const plans = plansData?.rows ?? [];
  const [planId, setPlanId] = useState(sub?.planId || "");
  const [status, setStatus] = useState(sub?.status || "ACTIVE");
  const [endDate, setEndDate] = useState(sub?.endDate ? new Date(sub.endDate).toISOString().slice(0, 10) : "");

  const submit = async (preset) => {
    let nextEnd = endDate;
    if (preset === "renew") {
      const base = sub?.endDate && new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
      base.setFullYear(base.getFullYear() + 1);
      nextEnd = base.toISOString().slice(0, 10);
      setEndDate(nextEnd);
    }
    if (!planId || !nextEnd) { toast.error("Pick a plan and expiry date"); return; }
    try {
      await assign({ schoolId, planId, endDate: nextEnd, status }).unwrap();
      toast.success(preset === "renew" ? "Subscription renewed" : "Subscription updated");
    } catch (e) {
      toast.error(e?.data?.error || "Failed to update subscription");
    }
  };

  const currentIdx = plans.findIndex((p) => p.id === (sub?.planId));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Current Plan" className="lg:col-span-1">
        <div className="p-5 space-y-3">
          <PlanBadge plan={sub?.plan?.name} />
          <p className="text-2xl font-bold text-slate-800">{sub?.plan ? formatMoney(sub.plan.price) : "—"}<span className="text-xs text-slate-400 font-normal"> / {sub?.plan?.billingCycle || "mo"}</span></p>
          <Row label="Status" value={<StatusBadge status={sub ? sub.status?.toLowerCase() : "pending"} />} />
          <Row label="Expires" value={formatDate(sub?.endDate)} />
          <Row label="Max Students" value={sub?.plan?.maxStudents?.toLocaleString() ?? "—"} />
          <Row label="Storage" value={sub?.plan ? formatBytes(sub.plan.storageLimit) : "—"} />
        </div>
      </Card>

      <Card title="Change Subscription" subtitle="Upgrade, downgrade or renew" className="lg:col-span-2">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Plan"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              options={[{ value: "", label: "Select…" }, ...plans.map((p) => ({ value: p.id, label: `${p.name} · ${formatMoney(p.price)}` }))]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={["TRIAL", "ACTIVE", "INACTIVE", "EXPIRED", "PENDING", "CANCELLED"].map((s) => ({ value: s, label: s }))}
            />
            <Input label="Expiry Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          {planId && currentIdx !== -1 && (
            <p className="text-[12px] text-slate-500">
              {plans.findIndex((p) => p.id === planId) > currentIdx
                ? "⬆ This is an upgrade." : plans.findIndex((p) => p.id === planId) < currentIdx
                ? "⬇ This is a downgrade." : "Same plan tier."}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button loading={isLoading} onClick={() => submit("change")}>Apply Change</Button>
            <Button variant="success" loading={isLoading} onClick={() => submit("renew")}>Renew +1 Year</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Modules ──────────────────────────────────────────────────────────────────
function ModulesTab({ school }) {
  const { data: modules } = useGetModulesQuery();
  const [update, { isLoading }] = useUpdateSchoolModulesMutation();
  const [enabled, setEnabled] = useState(school.enabledModules ?? []);
  const allOn = enabled.length === 0;

  const toggle = (key) => setEnabled((m) => (m.includes(key) ? m.filter((x) => x !== key) : [...m, key]));

  const save = async () => {
    try {
      await update({ id: school.id, modules: enabled }).unwrap();
      toast.success("Modules updated");
    } catch (e) {
      toast.error(e?.data?.error || "Failed to update modules");
    }
  };

  return (
    <Card title="Feature Modules" subtitle={allOn ? "All modules enabled (no restrictions)" : `${enabled.length} module(s) enabled`}>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(modules ?? []).map((m) => {
            const on = allOn || enabled.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggle(m.key)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  on ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-slate-800">{m.label}</p>
                  <span className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${on ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"}`}>
                    <span className="w-4 h-4 rounded-full bg-white shadow" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{m.description}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setEnabled([])} className="text-[12px] text-slate-500 hover:text-indigo-600 font-semibold">Reset to all enabled</button>
          <Button loading={isLoading} onClick={save}>Save Modules</Button>
        </div>
      </div>
    </Card>
  );
}

// ── Storage ──────────────────────────────────────────────────────────────────
function StorageTab({ school, sub }) {
  const used = Number(school.storageUsed) || 0;
  const limit = Number(sub?.plan?.storageLimit) || 0;
  const pct = limit ? (used / limit) * 100 : 0;
  const color = pct > 90 ? "red" : pct > 70 ? "amber" : "emerald";
  return (
    <Card title="Storage Usage">
      <div className="p-5 space-y-5">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-slate-800">{formatBytes(used)}</p>
          <p className="text-sm text-slate-400 mb-1">of {limit ? formatBytes(limit) : "unlimited"}</p>
        </div>
        <ProgressBar value={used} max={limit || used || 1} color={color} height="h-3" label="Consumed" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <PlanStat label="Used" value={formatBytes(used)} />
          <PlanStat label="Limit" value={limit ? formatBytes(limit) : "—"} />
          <PlanStat label="Remaining" value={limit ? formatBytes(Math.max(0, limit - used)) : "—"} />
        </div>
      </div>
    </Card>
  );
}

// ── Activity Logs ─────────────────────────────────────────────────────────────
function ActivityTab({ schoolId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAuditLogsQuery({ schoolId, page, limit: 15 });
  const rows = data?.rows ?? [];
  const total = data?.pagination?.total ?? 0;
  const columns = [
    { key: "action", label: "Action", render: (v) => <Badge variant="indigo">{v}</Badge> },
    { key: "entity", label: "Entity", render: (v, r) => `${v}${r.entityId ? ` · ${String(r.entityId).slice(-6)}` : ""}` },
    { key: "user", label: "By", render: (_v, r) => (r.user ? `${r.user.firstName} ${r.user.lastName}` : "—") },
    { key: "ipAddress", label: "IP", render: (v) => <span className="font-mono text-[11px]">{v || "—"}</span> },
    { key: "createdAt", label: "When", render: (v) => formatDateTime(v) },
  ];
  return (
    <Card noPadding>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyText="No activity recorded yet." />
      <Pagination page={page} total={total} pageSize={15} onPageChange={setPage} />
    </Card>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsTab({ school }) {
  const [update, { isLoading }] = useUpdateSchoolMutation();
  const [suspend] = useSuspendSchoolMutation();
  const [activate] = useActivateSchoolMutation();
  const [form, setForm] = useState({
    name: school.name || "", email: school.email || "", phone: school.phone || "",
    address: school.address || "", city: school.city || "", state: school.state || "",
    country: school.country || "", website: school.website || "", principalName: school.principalName || "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    try {
      await update({ id: school.id, ...form }).unwrap();
      toast.success("School updated");
    } catch (e) {
      toast.error(e?.data?.error || "Update failed");
    }
  };

  const toggleActive = async () => {
    try {
      if (school.isActive) { await suspend(school.id).unwrap(); toast.success("School suspended"); }
      else { await activate(school.id).unwrap(); toast.success("School activated"); }
    } catch (e) {
      toast.error(e?.data?.error || "Action failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="School Settings">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="School Name" value={form.name} onChange={set("name")} />
          <Input label="Email" value={form.email} onChange={set("email")} />
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
          <Input label="Website" value={form.website} onChange={set("website")} />
          <Input label="Address" value={form.address} onChange={set("address")} className="md:col-span-2" />
          <Input label="City" value={form.city} onChange={set("city")} />
          <Input label="State" value={form.state} onChange={set("state")} />
          <Input label="Country" value={form.country} onChange={set("country")} />
          <Input label="Principal Name" value={form.principalName} onChange={set("principalName")} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button loading={isLoading} onClick={save}>Save Changes</Button>
        </div>
      </Card>

      <Card title="Danger Zone" className="border-red-100">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-slate-800">{school.isActive ? "Suspend this school" : "Reactivate this school"}</p>
            <p className="text-[12px] text-slate-400">{school.isActive ? "Blocks all tenant logins immediately." : "Restores tenant access."}</p>
          </div>
          <Button variant={school.isActive ? "warning" : "success"} onClick={toggleActive}>
            {school.isActive ? "Suspend" : "Activate"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-slate-400">{label}</span>
      <span className="text-[13px] text-slate-700 font-medium">{value}</span>
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
