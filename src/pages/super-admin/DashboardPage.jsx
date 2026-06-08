/**
 * Super Admin → Dashboard
 * Platform-wide KPIs + analytics charts.
 */
import { Link } from "react-router-dom";
import {
  Building2, CheckCircle2, Clock, AlertTriangle, Users,
  DollarSign, HardDrive, Activity, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { StatCard, Card, PageHeader, EmptyState, Skeleton } from "../../components/ui";
import { useGetAnalyticsQuery } from "../../redux/api/superAdminApi";
import { formatBytes, formatMoney, formatDate, StatusBadge } from "./_saShared";

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

const chartTooltip = {
  contentStyle: { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 },
  labelStyle: { fontWeight: 600, color: "#334155" },
};

function ChartCard({ title, subtitle, children }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="p-4 h-64">{children}</div>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const { data, isLoading, isError, refetch } = useGetAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon="⚠️"
        title="Couldn't load platform analytics"
        description="The analytics service is unreachable. Check that the backend is running."
        action={<button onClick={refetch} className="text-indigo-600 text-sm font-semibold">Retry</button>}
      />
    );
  }

  const cards = [
    { label: "Total Schools",        value: data.totalSchools,        icon: Building2,    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
    { label: "Active Schools",       value: data.activeSchools,       icon: CheckCircle2, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
    { label: "Trial Schools",        value: data.trialSchools,        icon: Clock,        gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { label: "Expired Subs",         value: data.expiredSubscriptions,icon: AlertTriangle,gradient: "bg-gradient-to-br from-red-500 to-red-600" },
    { label: "Total Users",          value: data.totalUsers,          icon: Users,        gradient: "bg-gradient-to-br from-violet-500 to-violet-600" },
    { label: "Monthly Revenue",      value: formatMoney(data.monthlyRevenue), icon: DollarSign, gradient: "bg-gradient-to-br from-amber-500 to-amber-600" },
    { label: "Storage Used",         value: formatBytes(data.storageUsed),    icon: HardDrive,  gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600" },
    { label: "Server Status",        value: data.serverStatus === "operational" ? "Operational" : data.serverStatus, icon: Activity, gradient: "bg-gradient-to-br from-teal-500 to-teal-600" },
  ];

  const c = data.charts || {};

  return (
    <div className="space-y-5">
      <PageHeader
        title="Platform Overview"
        subtitle="Real-time health and growth across all tenants"
        icon={<Building2 size={18} />}
      >
        <Link
          to="/super-admin/schools/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New School
        </Link>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="School Growth" subtitle="Cumulative tenants (last 6 months)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={c.schoolGrowth}>
              <defs>
                <linearGradient id="schoolFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip {...chartTooltip} />
              <Area type="monotone" dataKey="schools" stroke="#6366f1" strokeWidth={2} fill="url(#schoolFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Growth" subtitle="Monthly recurring revenue (₹)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={c.revenueGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip {...chartTooltip} formatter={(v) => formatMoney(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Subscriptions by Plan" subtitle="Tenant distribution across plans">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={c.subscriptionsByPlan}
                dataKey="count"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={2}
              >
                {(c.subscriptionsByPlan || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subscriptions by Status" subtitle="Active / trial / expired breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={c.subscriptionsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip {...chartTooltip} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent schools */}
      <Card
        title="Recently Onboarded Schools"
        action={<Link to="/super-admin/schools" className="text-indigo-600 text-xs font-semibold inline-flex items-center gap-1">View all <ArrowRight size={12} /></Link>}
      >
        <div className="divide-y divide-slate-50">
          {(data.recentSchools || []).length === 0 && (
            <p className="px-5 py-6 text-xs text-slate-400 text-center">No schools yet.</p>
          )}
          {(data.recentSchools || []).map((s) => (
            <Link
              key={s.id}
              to={`/super-admin/schools/${s.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {s.name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.email} · {formatDate(s.createdAt)}</p>
                </div>
              </div>
              <StatusBadge status={s.isActive ? "active" : "inactive"} />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
