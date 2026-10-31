/**
 * Expense Report — staff salary paid through Payroll plus expenses booked in
 * Office Accounting. The two ledgers are independent, so their sum is the
 * school's spend — unless a salary was also entered as an office expense,
 * which the server detects and this page calls out.
 */
import { TrendingDown } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader } from "../../components/ui";
import { useGetExpenseReportQuery } from "../../redux/api/reportsApi";
import {
  usePeriod, PeriodBar, ReportError, Note, Kpi, KpiRow, ReportTable, ShareList, BarsChart, useReportClass,
  money, num, fmtDate, monthLabel, BLUE, ORANGE,
} from "./_shared";

const MODE = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", CHEQUE: "Cheque", UPI: "UPI", ONLINE: "Online", BANK: "Bank" };

export default function ExpenseReportPage() {
  usePageTitle("Expense Report");
  const period = usePeriod("month");
  // Opened from a class report: say why this one is not split by class.
  const cls = useReportClass();
  const { data, isFetching, error } = useGetExpenseReportQuery({ from: period.from, to: period.to });

  const t = data?.totals;
  const span = `${fmtDate(period.from)} – ${fmtDate(period.to)}`;
  const dup = data?.warnings?.find((w) => w.code === "POSSIBLE_SALARY_DUPLICATE");

  return (
    <div>
      <PageHeader title="Expense Report" subtitle="Salary and office expenses" icon={<TrendingDown />} />
      <PeriodBar period={period} />
      {cls.classId && (
        <Note>
          Expenses are for the whole school — salary and office expenses are not recorded class by class, so the{" "}
          <b>{cls.className}</b> filter does not apply to this report.
        </Note>
      )}
      <ReportError error={error} />

      {dup && (
        <Note tone="warn">
          Office expenses also show {money(dup.amount)} under the <b>“{dup.head}”</b> head, and salary has been paid separately through Payroll.
          If the same salary was entered in both places, it is being counted <b>twice</b> — remove it from one of them.
        </Note>
      )}

      <KpiRow cols={5}>
        <Kpi label="Total expense" value={money(t?.total)} tone="var(--erp-danger)" loading={isFetching} />
        <Kpi label="Staff salary" value={money(t?.salary)} sub={`${num(t?.salaryEntries)} payments`} loading={isFetching} />
        <Kpi label="Office expense" value={money(t?.office)} sub={`${num(t?.officeEntries)} entries`} loading={isFetching} />
        <Kpi label="Salary pending" value={money(t?.pendingSalary)} sub={`${num(t?.pendingSalaryEntries)} saved, not paid`} tone="var(--erp-warning)" loading={isFetching} />
        <Kpi label="Salary share" value={t?.total ? `${Math.round((t.salary / t.total) * 100)}%` : "—"} sub="of total expense" loading={isFetching} />
      </KpiRow>

      <BarsChart
        title="Month by month"
        subtitle={span}
        data={data?.monthly ?? []}
        xKey="month"
        xFmt={monthLabel}
        stacked
        series={[
          { key: "salary", name: "Salary", color: BLUE },
          { key: "office", name: "Office expense", color: ORANGE },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4">
        <ShareList title="By head" rows={data?.byHead ?? []} empty="No expense recorded." />
        <ShareList
          title="Salary by department"
          rows={(data?.byDepartment ?? []).map((d) => ({ name: `${d.name} (${d.staff} staff)`, amount: d.amount }))}
          empty="No salary paid."
        />
        <ShareList title="Office expense by account" rows={data?.byAccount ?? []} empty="No office expense." />
      </div>

      <ReportTable
        title="Salary paid"
        subtitle="From Payroll — dated by the day it was paid"
        filename={`salary-paid-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.salaries ?? []}
        emptyText="No salary paid in this period."
        columns={[
          { key: "date", label: "Paid on", value: (r) => fmtDate(r.date) },
          { key: "employee", label: "Employee", render: (r) => <span className="font-semibold">{r.employee}</span>, value: (r) => r.employee },
          { key: "employeeCode", label: "Code" },
          { key: "department", label: "Department" },
          { key: "designation", label: "Designation" },
          { key: "period", label: "Salary for" },
          { key: "mode", label: "Mode", value: (r) => MODE[r.mode] || r.mode },
          { key: "amount", label: "Amount", money: true, value: (r) => r.amount },
        ]}
        footer={{
          items: [{ label: "Total salary", value: money(t?.salary) }],
          print: `Total salary paid: ${money(t?.salary)}`,
        }}
      />

      <ReportTable
        title="Office expenses"
        subtitle="Booked in Office Accounting → New Expense"
        filename={`office-expense-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.office ?? []}
        emptyText="No office expense recorded for this period."
        columns={[
          { key: "date", label: "Date", value: (r) => fmtDate(r.date) },
          { key: "head", label: "Head", render: (r) => <span className="font-semibold">{r.head}</span>, value: (r) => r.head },
          { key: "account", label: "Paid from" },
          { key: "description", label: "Description" },
          { key: "reference", label: "Bill / Ref." },
          { key: "amount", label: "Amount", money: true, value: (r) => r.amount },
        ]}
        footer={{
          items: [{ label: "Total office expense", value: money(t?.office) }],
          print: `Total office expense: ${money(t?.office)}`,
        }}
      />
    </div>
  );
}
