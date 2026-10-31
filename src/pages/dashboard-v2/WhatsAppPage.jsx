/**
 * Dashboard v2 · WhatsApp Sent Report — messages the school sent on WhatsApp
 * in a period (sent, delivered, read, failed) from the WhatsApp module's daily
 * counters, plus each fee reminder of a fee-bill run with its status.
 */
import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetWhatsappReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, SchoolWideNote, GradientStat, StatGrid, BarsPanel, DataPanel, Segmented, Hint,
  BLUE, ORANGE, num, pctText, fmtDate, dayLabel, usePeriod, byDayOrMonth,
} from "./_ui";

const STATUS = {
  SENT: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  SKIPPED: "bg-slate-100 text-slate-700 ring-slate-200",
};
const statusLabel = (s) => (s ? s[0] + s.slice(1).toLowerCase() : "—");

export default function WhatsAppPage() {
  usePageTitle("WhatsApp Sent Report");
  const period = usePeriod("month");
  const [tab, setTab] = useState("days");
  const { data, isFetching, error } = useGetWhatsappReportQuery({ from: period.from, to: period.to });
  const t = data?.totals;
  const loading = isFetching && !data;
  const sub = `${period.from} to ${period.to}`;
  const trend = byDayOrMonth(data?.daily || [], ["sent", "read", "delivered", "failed"]);
  const reminders = data?.reminders;

  return (
    <div>
      <ReportHeader title="WhatsApp Sent Report" subtitle="Messages sent from the school's WhatsApp — fee reminders and notices" icon={MessageSquareText} />
      <PeriodPicker period={period} />
      <SchoolWideNote what="WhatsApp message counts are" />
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="green" label="Messages sent" loading={loading} value={num(t?.sent)}
          sub={`on ${num(t?.activeDays)} day${t?.activeDays === 1 ? "" : "s"}`} />
        <GradientStat tone="blue" label="Delivered" loading={loading} value={num(t?.delivered)}
          sub={t?.sent ? `${pctText(t.deliveredPct)} of sent` : "—"} />
        <GradientStat tone="violet" label="Read" loading={loading} value={num(t?.read)}
          sub={t?.sent ? `${pctText(t.readPct)} of sent` : "—"} />
        <GradientStat tone="orange" label="Failed" loading={loading} value={num(t?.failed)}
          sub="could not be sent" />
      </StatGrid>

      <Hint>WhatsApp keeps these counts per day as messages go out; delivered and read come from the recipient's phone, so they can rise for a day or two after sending.</Hint>

      <BarsPanel className="mb-5" title="Messages sent and read"
        subtitle={trend.grain === "month" ? "Month by month" : "Day by day"} loading={loading}
        data={trend.data} xKey={trend.xKey} xFmt={trend.xFmt}
        series={[{ key: "sent", name: "Sent", color: BLUE }, { key: "read", name: "Read", color: ORANGE }]}
        empty="No WhatsApp message sent in this period." />

      <div className="mb-3">
        <Segmented label="WhatsApp tables" value={tab} onChange={setTab} options={[
          { key: "days", label: "Day-wise", count: data?.daily?.length },
          { key: "reminders", label: "Fee reminders", count: reminders?.total },
        ]} />
      </div>

      {tab === "days" ? (
        <DataPanel key="days" title="Day-wise messages" subtitle={sub} printSubtitle={`WhatsApp messages · ${sub}`}
          filename="whatsapp-day-wise" loading={loading} rows={[...(data?.daily || [])].reverse()}
          emptyText="No WhatsApp message sent in this period."
          columns={[
            { key: "date", label: "Date", value: (r) => dayLabel(r.date) + " " + r.date.slice(0, 4), sortValue: (r) => r.date },
            { key: "sent", label: "Sent", align: "right" },
            { key: "delivered", label: "Delivered", align: "right" },
            { key: "read", label: "Read", align: "right" },
            { key: "failed", label: "Failed", align: "right" },
          ]}
          footer={t && {
            items: [
              { label: "Sent", value: num(t.sent) }, { label: "Delivered", value: num(t.delivered) },
              { label: "Read", value: num(t.read) }, { label: "Failed", value: num(t.failed) },
            ],
            print: `Sent ${num(t.sent)} · Delivered ${num(t.delivered)} · Read ${num(t.read)} · Failed ${num(t.failed)}`,
          }}
        />
      ) : (
        <DataPanel key="reminders" title="Fee reminders" subtitle={`${sub} · one message per parent number`}
          printSubtitle={`Fee reminders · ${sub}`} filename="whatsapp-fee-reminders" loading={loading} rows={reminders?.rows || []}
          emptyText="No fee reminder was sent from Auto Fee Bill in this period."
          columns={[
            { key: "date", label: "Date", nowrap: true, value: (r) => fmtDate(r.date), sortValue: (r) => r.date },
            { key: "names", label: "Student(s)" },
            { key: "phone", label: "Phone", nowrap: true },
            { key: "amount", label: "Amount due", align: "right", money: true },
            { key: "status", label: "Status", value: (r) => statusLabel(r.status),
              render: (r) => <span className={`inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ${STATUS[r.status] || STATUS.SKIPPED}`}>{statusLabel(r.status)}</span> },
            { key: "error", label: "Reason", value: (r) => r.error || "—" },
          ]}
          footer={reminders?.byStatus?.length > 0 && {
            items: reminders.byStatus.map((s) => ({ label: statusLabel(s.status), value: num(s.count) })),
            print: reminders.byStatus.map((s) => `${statusLabel(s.status)} ${num(s.count)}`).join(" · "),
          }}
        />
      )}
    </div>
  );
}
