/**
 * Platform → WhatsApp Usage (super admin).
 *
 * How many WhatsApp messages each school has sent over a window, read from the
 * counters the WhatsApp module already keeps. Every school is listed, including
 * ones that sent nothing — "who is not using it" is half the reason to look.
 */
import { useState } from "react";
import { MessageCircle, Building2, Link2Off, Download } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Badge, DataTable } from "../../components/ui";
import { useGetWhatsappUsageQuery, useGetWhatsappDailyQuery } from "../../redux/api/platformUsageApi";

const num = (v) => Number(v ?? 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

const PRESETS = [
  { label: "7 days", days: 6 },
  { label: "30 days", days: 29 },
  { label: "90 days", days: 89 },
];

/** A bare sparkline — enough to show the shape of a month without a chart lib. */
function Spark({ rows }) {
  if (!rows?.length) return null;
  const max = Math.max(...rows.map((r) => r.sent), 1);
  return (
    <div className="flex items-end gap-[2px] h-14">
      {rows.map((r) => (
        <div
          key={r.date}
          title={`${fmtDate(r.date)} — ${num(r.sent)} sent`}
          className="flex-1 min-w-[2px]"
          style={{
            height: `${Math.max(2, (r.sent / max) * 100)}%`,
            background: r.failed > 0 ? "var(--erp-warning)" : "var(--erp-primary)",
            opacity: r.sent ? 1 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

export default function WhatsappUsagePage() {
  usePageTitle("WhatsApp Usage");

  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(iso(new Date()));

  const range = { from, to };
  const { data, isFetching } = useGetWhatsappUsageQuery(range);
  const { data: daily = [] } = useGetWhatsappDailyQuery(range);

  const rows = data?.data ?? [];
  const totals = data?.totals ?? {
    sent: 0, failed: 0, delivered: 0, read: 0, linkedSchools: 0, activeSchools: 0, schools: 0,
  };

  const exportCsv = () => {
    const head = ["School", "Linked", "Sent", "Delivered", "Read", "Failed", "Delivery %", "Last activity"];
    const body = rows.map((r) => [
      r.schoolName, r.linked ? "Yes" : "No", r.sent, r.delivered, r.read, r.failed,
      r.deliveryRate ?? "", r.lastActivity ? fmtDate(r.lastActivity) : "",
    ]);
    const csv = [head, ...body]
      .map((line) => line.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-usage-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="WhatsApp Usage"
        subtitle="How many messages each school has sent"
        icon={<MessageCircle />}
      >
        <Button variant="secondary" onClick={exportCsv} icon={<Download size={14} />}>Export CSV</Button>
      </PageHeader>

      {/* ── Window ─────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="px-4 py-3 flex flex-wrap items-end gap-3">
          <div className="w-[160px]">
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-[160px]">
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant={from === daysAgo(p.days) && to === iso(new Date()) ? "primary" : "secondary"}
                onClick={() => { setFrom(daysAgo(p.days)); setTo(iso(new Date())); }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Totals ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: "Messages sent", value: num(totals.sent), tone: "var(--erp-primary)" },
          { label: "Delivered", value: num(totals.delivered), tone: "var(--erp-success)" },
          { label: "Read", value: num(totals.read), tone: "var(--erp-info)" },
          { label: "Failed", value: num(totals.failed), tone: "var(--erp-danger)" },
          {
            label: "Schools using it",
            value: `${totals.activeSchools} / ${totals.schools}`,
            tone: "var(--erp-text)",
          },
        ].map((k) => (
          <div key={k.label} className="bg-white px-4 py-3"
               style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
            <p className="text-[11px] text-slate-600">{k.label}</p>
            <p className="text-[18px] font-bold mt-0.5" style={{ color: k.tone }}>{k.value}</p>
          </div>
        ))}
      </div>

      {daily.length > 0 && (
        <Card title="Day by day" subtitle="Whole platform · amber days had failures" className="mb-4">
          <div className="px-4 py-4">
            <Spark rows={daily} />
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-slate-600">{fmtDate(daily[0]?.date)}</span>
              <span className="text-[11px] text-slate-600">{fmtDate(daily[daily.length - 1]?.date)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* ── Per school ─────────────────────────────────────────────────── */}
      <Card
        title="School-wise usage"
        subtitle={`${rows.length} schools · ${totals.linkedSchools} have WhatsApp linked`}
        noPadding
      >
        <DataTable
          loading={isFetching}
          emptyText="No schools"
          columns={[
            {
              key: "schoolName",
              label: "School",
              render: (_v, r) => (
                <span className="inline-flex items-center gap-2">
                  <Building2 size={13} className="text-slate-500 shrink-0" />
                  <span className="font-semibold">{r.schoolName}</span>
                  {r.isActive === false && <Badge variant="danger">Inactive</Badge>}
                </span>
              ),
            },
            {
              key: "linked",
              label: "WhatsApp",
              render: (_v, r) =>
                r.linked ? (
                  <Badge variant="success">Linked</Badge>
                ) : (
                  // Not linked and zero messages are different problems: one is
                  // "never set up", the other is "set up but unused".
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: "var(--erp-muted)" }}>
                    <Link2Off size={12} /> Not linked
                  </span>
                ),
            },
            {
              key: "sent",
              label: "Sent",
              render: (_v, r) => <span className="font-bold">{num(r.sent)}</span>,
            },
            { key: "delivered", label: "Delivered", render: (_v, r) => num(r.delivered) },
            { key: "read", label: "Read", render: (_v, r) => num(r.read) },
            {
              key: "failed",
              label: "Failed",
              render: (_v, r) =>
                r.failed > 0
                  ? <span className="font-semibold" style={{ color: "var(--erp-danger)" }}>{num(r.failed)}</span>
                  : "—",
            },
            {
              key: "deliveryRate",
              label: "Delivery",
              render: (_v, r) =>
                r.deliveryRate == null ? (
                  "—"
                ) : (
                  <Badge variant={r.deliveryRate >= 90 ? "success" : r.deliveryRate >= 70 ? "warning" : "danger"}>
                    {r.deliveryRate}%
                  </Badge>
                ),
            },
            { key: "lastActivity", label: "Last sent", render: (_v, r) => fmtDate(r.lastActivity) },
          ]}
          data={rows}
        />
      </Card>
    </div>
  );
}
