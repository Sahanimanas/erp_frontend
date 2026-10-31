/**
 * Income vs Expense — the school's profit & loss over a period, month by
 * month, plus the Office Accounting account balances.
 *
 * Replaces the earlier page, which read the legacy FeeCollection table that
 * the fee module no longer writes to, so it showed ₹0 for every school.
 *
 * With a class picked it shows that class's fee income only: salary, office
 * expenses, other income and the account books are kept for the whole school.
 */
import { BarChart2 } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader } from "../../components/ui";
import { useGetFinancialReportQuery } from "../../redux/api/reportsApi";
import {
  usePeriod, PeriodBar, ReportError, Note, Kpi, KpiRow, ReportTable, ShareList, BarsChart, useReportClass, ClassSelect,
  money, fmtDate, monthLabel, BLUE, ORANGE,
} from "./_shared";

const signed = (n) => (n < 0 ? `− ${money(-n)}` : money(n));

export default function FinancialReportsPage() {
  usePageTitle("Income vs Expense");
  const period = usePeriod("session");
  const cls = useReportClass();
  const one = Boolean(cls.classId);
  const { data, isFetching, error } = useGetFinancialReportQuery({ from: period.from, to: period.to, classId: cls.classId });

  const t = data?.totals;
  const span = `${one ? `${cls.className} · ` : ""}${fmtDate(period.from)} – ${fmtDate(period.to)}`;
  const dup = !one && data?.warnings?.find((w) => w.code === "POSSIBLE_SALARY_DUPLICATE");
  const margin = t?.income ? Math.round((t.net / t.income) * 100) : null;

  return (
    <div>
      <PageHeader title="Income vs Expense" icon={<BarChart2 />}
        subtitle={one ? `${cls.className} — fee income for the period` : "Profit & loss for the period"} />
      <PeriodBar period={period}>
        <ClassSelect cls={cls} />
      </PeriodBar>
      <ReportError error={error} />
      {one && (
        <Note>
          Showing <b>{cls.className}</b>’s fee income only. Salary, office expenses, other income and account balances are kept
          for the whole school, not class by class — choose “All classes” to see profit &amp; loss.
        </Note>
      )}
      {dup && (
        <Note tone="warn">
          Salary appears in Payroll and also under the “{dup.head}” office expense head ({money(dup.amount)}). If the same salary was entered in both places, it is being counted twice.
        </Note>
      )}

      {one ? (
        <KpiRow cols={3}>
          <Kpi label={`Fee income · ${cls.className}`} value={money(t?.income)} sub="fee received from this class"
               tone="var(--erp-success)" to={`/reports/income?${period.query}${cls.query}`} loading={isFetching} />
          <Kpi label="Months with fee" value={`${(data?.monthly ?? []).filter((m) => m.fee > 0).length} of ${(data?.monthly ?? []).length}`}
               loading={isFetching} />
          <Kpi label="Concession given" value={money(t?.concession)} sub="Not counted as income" tone="var(--erp-warning)" loading={isFetching} />
        </KpiRow>
      ) : (
        <KpiRow cols={4}>
          <Kpi label="Income" value={money(t?.income)} sub={`Fee ${money(t?.fee)} · Other ${money(t?.otherIncome)}`}
               tone="var(--erp-success)" to={`/reports/income?${period.query}`} loading={isFetching} />
          <Kpi label="Expense" value={money(t?.expense)} sub={`Salary ${money(t?.salary)} · Office ${money(t?.officeExpense)}`}
               tone="var(--erp-danger)" to={`/reports/expense?${period.query}`} loading={isFetching} />
          <Kpi label={t?.net < 0 ? "Net loss" : "Net surplus"} value={signed(t?.net ?? 0)}
               sub={margin == null ? "" : `${margin}% of income`}
               tone={t?.net < 0 ? "var(--erp-danger)" : "var(--erp-success)"} loading={isFetching} />
          <Kpi label="Concession given" value={money(t?.concession)} sub={`Salary pending ${money(t?.pendingSalary)}`}
               tone="var(--erp-warning)" loading={isFetching} />
        </KpiRow>
      )}

      <BarsChart
        title={one ? "Fee income by month" : "Income and expense by month"}
        subtitle={span}
        data={data?.monthly ?? []}
        xKey="month"
        xFmt={monthLabel}
        series={one
          ? [{ key: "income", name: "Fee income", color: BLUE }]
          : [
              { key: "income", name: "Income", color: BLUE },
              { key: "expense", name: "Expense", color: ORANGE },
            ]}
      />

      <ReportTable
        title={one ? `Monthly fee income — ${cls.className}` : "Monthly statement"}
        filename={one ? `fee-income-${period.from}-to-${period.to}` : `income-vs-expense-${period.from}-to-${period.to}`}
        printTitle={one ? `Fee Income — ${cls.className}` : "Income vs Expense Statement"}
        printSubtitle={span}
        loading={isFetching}
        rows={data?.monthly ?? []}
        columns={one ? [
          { key: "month", label: "Month", value: (r) => monthLabel(r.month) },
          { key: "fee", label: "Fee received", money: true, render: (r) => <span className="font-semibold" style={{ color: "var(--erp-success)" }}>{money(r.fee)}</span> },
        ] : [
          { key: "month", label: "Month", value: (r) => monthLabel(r.month) },
          { key: "fee", label: "Fee", money: true },
          { key: "otherIncome", label: "Other income", money: true },
          { key: "income", label: "Total income", money: true, render: (r) => <span className="font-semibold" style={{ color: "var(--erp-success)" }}>{money(r.income)}</span> },
          { key: "salary", label: "Salary", money: true },
          { key: "officeExpense", label: "Office expense", money: true },
          { key: "expense", label: "Total expense", money: true, render: (r) => <span className="font-semibold" style={{ color: "var(--erp-danger)" }}>{money(r.expense)}</span> },
          {
            key: "net", label: "Net", value: (r) => r.net,
            render: (r) => <span className="font-bold" style={{ color: r.net < 0 ? "var(--erp-danger)" : "var(--erp-success)" }}>{signed(r.net)}</span>,
          },
        ]}
        footer={one ? {
          items: [{ label: "Fee received", value: money(t?.income), tone: "var(--erp-success)" }],
          print: `Fee received ${money(t?.income)}`,
        } : {
          items: [
            { label: "Income", value: money(t?.income), tone: "var(--erp-success)" },
            { label: "Expense", value: money(t?.expense), tone: "var(--erp-danger)" },
            { label: "Net", value: signed(t?.net ?? 0), tone: t?.net < 0 ? "var(--erp-danger)" : "var(--erp-success)" },
          ],
          print: `Income ${money(t?.income)}  ·  Expense ${money(t?.expense)}  ·  Net ${signed(t?.net ?? 0)}`,
        }}
      />

      <div className={`grid grid-cols-1 gap-x-4 ${one ? "" : "lg:grid-cols-2"}`}>
        <ShareList title="Where the money came from" rows={data?.incomeByHead ?? []} empty="No income in this period." />
        {!one && <ShareList title="Where the money went" rows={data?.expenseByHead ?? []} empty="No expense in this period." />}
      </div>

      {!one && <ReportTable
        title="Account balances"
        subtitle="Office Accounting books, as of today. Fee collections are reported separately above and are not posted into these accounts."
        filename="account-balances"
        loading={isFetching}
        rows={data?.accounts ?? []}
        emptyText="No accounts set up in Office Accounting yet."
        columns={[
          { key: "name", label: "Account", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
          { key: "type", label: "Type", value: (r) => (r.type === "BANK" ? "Bank" : "Cash") },
          { key: "openingBalance", label: "Opening balance", money: true },
          { key: "balance", label: "Current balance", money: true, render: (r) => <span className="font-bold">{money(r.balance)}</span> },
        ]}
      />}
    </div>
  );
}
