/**
 * Super Admin → Audit Logs
 * Platform-wide trail of privileged actions (who · what · when · IP).
 */
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { Card, DataTable, Pagination, PageHeader, Select, Badge } from "../../components/ui";
import { useGetAuditLogsQuery } from "../../redux/api/superAdminApi";
import { formatDateTime } from "./_saShared";

const ACTIONS = [
  "", "SCHOOL_CREATED", "SCHOOL_UPDATED", "SCHOOL_ACTIVATED", "SCHOOL_SUSPENDED",
  "SCHOOL_DELETED", "PLAN_CREATED", "PLAN_UPDATED", "SUBSCRIPTION_ASSIGNED",
  "MODULES_UPDATED", "DOMAIN_ADDED", "DOMAIN_VERIFIED", "DOMAIN_REMOVED",
  "IMPERSONATE_SCHOOL_ADMIN",
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, isLoading, isFetching } = useGetAuditLogsQuery({ page, limit: 20, ...(action && { action }) });

  const rows = data?.rows ?? [];
  const total = data?.pagination?.total ?? 0;

  const columns = [
    { key: "action", label: "Action", render: (v) => <Badge variant="indigo">{v}</Badge> },
    { key: "school", label: "School", sortable: false, render: (_v, r) => r.school?.name || "—" },
    { key: "entity", label: "Entity", render: (v, r) => `${v}${r.entityId ? ` · ${String(r.entityId).slice(-6)}` : ""}` },
    { key: "user", label: "Actor", sortable: false, render: (_v, r) => (r.user ? `${r.user.firstName} ${r.user.lastName} (${r.user.role})` : "—") },
    { key: "ipAddress", label: "IP", render: (v) => <span className="font-mono text-[11px]">{v || "—"}</span> },
    { key: "createdAt", label: "Timestamp", render: (v) => formatDateTime(v) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" subtitle="Every privileged platform action, recorded" icon={<ScrollText size={18} />} />
      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <Select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            options={ACTIONS.map((a) => ({ value: a, label: a || "All Actions" }))}
            className="w-64"
          />
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading || isFetching} emptyText="No audit events yet." />
        <Pagination page={page} total={total} pageSize={20} onPageChange={setPage} />
      </Card>
    </div>
  );
}
