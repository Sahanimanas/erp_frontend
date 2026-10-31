/**
 * Dashboard v2 · Revenue & Finance — money in and money out for a period:
 * income (fee + other income) against expense (salary + office expenses),
 * month by month, where each came from and went, and the account balances.
 *
 * With a class picked, only that class's fee income is shown: salary, office
 * expenses, other income and the account books are kept for the whole school,
 * so splitting them by class would be invented numbers.
 */
import { CircleDollarSign } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetFinancialReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, GradientStat, StatGrid, BarsPanel, DataPanel, Panel, ShareBars, Hint,
  ClassPicker, useClassFilter, BLUE, ORANGE, money, moneyShort, monthLabel, usePeriod,
} from "./_ui";

const signed = (n) => (n < 0 ? `− ${money(-n)}` : money(n));

export default function FinancePage() {
  usePageTitle("Revenue & Finance");
  const period = usePeriod("session");
  const { classId, className } = useClassFilter();
  const { data, isFetching, error } = useGetFinancialReportQuery({ from: period.from, to: period.to, classId });
  const t = data?.totals;
  const loading = isFetching && !data;
  const one = Boolean(classId);
  const sub = `${one ? `${className} · ` : ""}${period.from} to ${period.to}`;
  const dup = !one && data?.warnings?.find((w) => w.code === "POSSIBLE_SALARY_DUPLICATE");

  return (
    <div>
      <ReportHeader title="Revenue & Finance" icon={CircleDollarSign}
        subtitle={one ? `${className} — fee income, month by month` : "Income against expense, month by month"} />
      <PeriodPicker period={period}><ClassPicker /></PeriodPicker>
      <ErrorNote error={error} />

      {one && (
        <Hint>
          Showing {className}'s fee income only. Salary, office expenses, other income and account balances are kept for
          the whole school, not class by class — choose “All classes” to see income against expense.
        </Hint>
      )}

      <StatGrid>
        <GradientStat tone="green" label={one ? `Fee income · ${className}` : "Total income"} loading={loading}
          value={moneyShort(t?.income)} title={money(t?.income)}
          sub={one ? "fee received from this class" : `Fee ${moneyShort(t?.fee)} · Other ${moneyShort(t?.otherIncome)}`} />
        {one ? (
          <GradientStat tone="blue" label="Months with fee" loading={loading}
            value={(data?.monthly || []).filter((m) => m.fee > 0).length} sub={`of ${(data?.monthly || []).length} in this period`} />
        ) : (
          <GradientStat tone="orange" label="Total expense" loading={loading} value={moneyShort(t?.expense)} title={money(t?.expense)}
            sub={`Salary ${moneyShort(t?.salary)} · Office ${moneyShort(t?.officeExpense)}`} />
        )}
        {one ? (
          <GradientStat tone="cyan" label="Average a month" loading={loading}
            value={moneyShort((t?.income || 0) / Math.max(1, (data?.monthly || []).length))} sub="fee received" />
        ) : (
          <GradientStat tone={t?.net < 0 ? "pink" : "blue"} label={t?.net < 0 ? "Net loss" : "Net surplus"} loading={loading}
            value={moneyShort(t?.net)} title={signed(t?.net ?? 0)} sub="Income minus expense" />
        )}
        <GradientStat tone="purple" label="Concession given" loading={loading} value={moneyShort(t?.concession)} title={money(t?.concession)}
          sub={!one && t?.pendingSalary ? `${moneyShort(t.pendingSalary)} salary still unpaid` : "Not counted as income"} />
      </StatGrid>

      {dup && (
        <Hint>
          Office expenses also have a head “{dup.head}” ({money(dup.amount)}). If salary is booked there as well as in
          Payroll, that money is counted twice in the expense above.
        </Hint>
      )}

      <BarsPanel className="mb-5" title={one ? "Fee income" : "Income vs expense"} subtitle="Month by month" unit="money" loading={loading}
        data={data?.monthly || []} xKey="month" xFmt={monthLabel}
        series={one
          ? [{ key: "income", name: "Fee income", color: BLUE }]
          : [{ key: "income", name: "Income", color: BLUE }, { key: "expense", name: "Expense", color: ORANGE }]} />

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Where the income came from" subtitle={one ? "Fee categories" : "Fee categories and other income heads"}
          className={one ? "lg:col-span-2" : ""}>
          <ShareBars rows={(data?.incomeByHead || []).map((r) => ({ name: r.name, value: r.amount }))} empty="No income in this period." />
        </Panel>
        {!one && (
          <Panel title="Where the money went" subtitle="Salary and office expense heads">
            <ShareBars rows={(data?.expenseByHead || []).map((r) => ({ name: r.name, value: r.amount }))} empty="No expense in this period." />
          </Panel>
        )}
      </div>

      <div className="mb-5">
        <DataPanel title={one ? "Month-wise fee income" : "Month-wise profit and loss"} subtitle={sub}
          printSubtitle={`Revenue & Finance · ${sub}`} filename={one ? "class-fee-income" : "income-vs-expense"}
          loading={loading} rows={data?.monthly || []} pageSize={24}
          columns={one
            ? [
                { key: "month", label: "Month", value: (r) => monthLabel(r.month), sortValue: (r) => r.month },
                { key: "fee", label: "Fee received", align: "right", money: true },
              ]
            : [
                { key: "month", label: "Month", value: (r) => monthLabel(r.month), sortValue: (r) => r.month },
                { key: "fee", label: "Fee", align: "right", money: true },
                { key: "otherIncome", label: "Other income", align: "right", money: true },
                { key: "income", label: "Income", align: "right", money: true },
                { key: "salary", label: "Salary", align: "right", money: true },
                { key: "officeExpense", label: "Office", align: "right", money: true },
                { key: "expense", label: "Expense", align: "right", money: true },
                {
                  key: "net", label: "Net", align: "right", value: (r) => r.net,
                  render: (r) => <span className={`font-semibold ${r.net < 0 ? "text-red-700" : "text-slate-900"}`}>{signed(r.net)}</span>,
                },
              ]}
          footer={t && (one
            ? { items: [{ label: "Fee received", value: money(t.income) }], print: `Fee received: ${money(t.income)}` }
            : {
                items: [
                  { label: "Income", value: money(t.income) },
                  { label: "Expense", value: money(t.expense) },
                  { label: "Net", value: signed(t.net) },
                ],
                print: `Income ${money(t.income)} · Expense ${money(t.expense)} · Net ${signed(t.net)}`,
              })}
        />
      </div>

      {!one && (
        <DataPanel title="Account balances" subtitle="Office Accounting books, all time — fee collections are reported above"
          filename="account-balances" loading={loading} rows={data?.accounts || []}
          emptyText="No accounts set up in Office Accounting."
          columns={[
            { key: "name", label: "Account" },
            { key: "type", label: "Type" },
            { key: "openingBalance", label: "Opening balance", align: "right", money: true },
            { key: "balance", label: "Current balance", align: "right", money: true },
          ]}
        />
      )}
    </div>
  );
}
