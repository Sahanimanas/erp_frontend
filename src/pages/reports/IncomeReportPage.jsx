/**
 * Income Report — every rupee that came in over a period: fee collections
 * (FeePayment, kind PAID) plus other income booked in Office Accounting.
 * Concessions are shown beside it but are not income.
 */
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader } from "../../components/ui";
import { useGetIncomeReportQuery } from "../../redux/api/reportsApi";
import {
  usePeriod, PeriodBar, ReportError, Note, Kpi, KpiRow, ReportTable, ShareList, BarsChart, useReportClass, ClassSelect,
  money, num, fmtDate, monthLabel, dayLabel, BLUE, ORANGE,
} from "./_shared";

export default function IncomeReportPage() {
  usePageTitle("Income Report");
  const navigate = useNavigate();
  const period = usePeriod("month");
  const cls = useReportClass();
  const { data, isFetching, error } = useGetIncomeReportQuery({ from: period.from, to: period.to, classId: cls.classId });

  const t = data?.totals;
  const span = `${cls.className ? `${cls.className} · ` : ""}${fmtDate(period.from)} – ${fmtDate(period.to)}`;
  // A day-by-day chart for a month or less; month-by-month for anything longer.
  const daily = (data?.byDay?.length ?? 0) > 0 && (data?.monthly?.length ?? 0) <= 1;

  return (
    <div>
      <PageHeader title="Income Report" subtitle="Fee collection and other income" icon={<TrendingUp />} />
      <PeriodBar period={period}>
        <ClassSelect cls={cls} />
      </PeriodBar>
      <ReportError error={error} />
      {cls.classId && (
        <Note>
          Showing fee received from <b>{cls.className}</b>. Other income booked in Office Accounting is not kept per class, so
          it is left out here.
        </Note>
      )}

      <KpiRow cols={3}>
        <Kpi label="Total income" value={money(t?.total)} sub={`Fee ${money(t?.fee)} + other ${money(t?.other)}`} tone="var(--erp-success)" loading={isFetching} />
        <Kpi label="Fee receipts" value={num(t?.receipts)} sub={t?.receipts ? `Avg. ${money(t.fee / t.receipts)} per receipt` : ""} loading={isFetching} />
        <Kpi label="Concession given" value={money(t?.concession)} sub="Not counted as income" tone="var(--erp-warning)" loading={isFetching} />
      </KpiRow>

      {/* Where the fee came from — read from each fee type's name. */}
      <KpiRow cols={5}>
        <Kpi label="School fee" value={money(t?.school)} sub="Tuition, exam, annual…" loading={isFetching} />
        <Kpi label="Transport" value={money(t?.transport)} sub="Transport / bus / van" loading={isFetching} />
        <Kpi label="Admission" value={money(t?.admission)} sub="Admission / registration" loading={isFetching} />
        <Kpi label="Books & Uniform" value={money(t?.books)} sub="Books, dress, ID card" loading={isFetching} />
        <Kpi label="Other income" value={money(t?.other)} sub={`${num(t?.otherEntries)} office entries`} loading={isFetching} />
      </KpiRow>

      {daily ? (
        <BarsChart
          title="Day by day"
          subtitle={span}
          data={data?.byDay ?? []}
          xKey="date"
          xFmt={dayLabel}
          stacked
          series={[
            { key: "fee", name: "Fee", color: BLUE },
            { key: "other", name: "Other income", color: ORANGE },
          ]}
        />
      ) : (
        <BarsChart
          title="Month by month"
          subtitle={span}
          data={data?.monthly ?? []}
          xKey="month"
          xFmt={monthLabel}
          stacked
          series={[
            { key: "fee", name: "Fee", color: BLUE },
            { key: "other", name: "Other income", color: ORANGE },
          ]}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4">
        <ShareList title="By fee type" rows={data?.byFeeType ?? []} empty="No fee collected." />
        <ShareList title="By payment mode" rows={data?.byMode ?? []} empty="No fee collected." />
        <ShareList title="By class" rows={data?.byClass ?? []} empty="No fee collected." />
      </div>

      {(data?.byHead?.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4">
          <ShareList title="Other income by head" rows={data.byHead} />
        </div>
      )}

      <ReportTable
        title="Fee receipts"
        subtitle={`${num(data?.receipts?.length)} receipts · ${span} · click a row for the student's fee page`}
        filename={`fee-receipts-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.receipts ?? []}
        onRowClick={(r) => navigate(`/payments/student-fee?id=${r.studentId}`)}
        columns={[
          { key: "date", label: "Date", value: (r) => fmtDate(r.date) },
          { key: "receiptNo", label: "Receipt No" },
          { key: "studentName", label: "Student", render: (r) => <span className="font-semibold">{r.studentName}</span>, value: (r) => r.studentName },
          { key: "rollNumber", label: "Roll No" },
          { key: "className", label: "Class" },
          { key: "items", label: "Fee for", value: (r) => r.items.join(", ") },
          { key: "mode", label: "Mode" },
          { key: "amount", label: "Amount", money: true, value: (r) => r.amount },
        ]}
        footer={{
          items: [{ label: "Total fee collected", value: money(t?.fee), tone: "var(--erp-success)" }],
          print: `Total fee collected: ${money(t?.fee)}`,
        }}
      />

      <ReportTable
        title="Other income"
        subtitle="Booked in Office Accounting → New Deposit"
        filename={`other-income-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        rows={data?.otherIncome ?? []}
        emptyText="No other income recorded for this period."
        columns={[
          { key: "date", label: "Date", value: (r) => fmtDate(r.date) },
          { key: "head", label: "Head" },
          { key: "account", label: "Account" },
          { key: "description", label: "Description" },
          { key: "reference", label: "Reference" },
          { key: "amount", label: "Amount", money: true, value: (r) => r.amount },
        ]}
        footer={{
          items: [{ label: "Total other income", value: money(t?.other) }],
          print: `Total other income: ${money(t?.other)}`,
        }}
      />
    </div>
  );
}
