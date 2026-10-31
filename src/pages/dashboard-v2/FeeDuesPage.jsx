/**
 * Dashboard v2 · Fee Dues & Defaulters — what each class owes for the session
 * and who is behind, from the same fee ledger as the Fee Payment and demand-bill
 * screens, so a figure here matches what the parent is billed.
 */
import { useState } from "react";
import { Wallet } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetFeesDueReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, ErrorNote, GradientStat, StatGrid, BarsPanel, DataPanel, Segmented, Picker, RateBadge,
  ClassPicker, useClassFilter, FilterBar,
  BLUE, ORANGE, money, moneyShort, num, pctText, periodPresets,
} from "./_ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Apr-2026" … "Mar-2027" for the current session — the fee engine's labels. */
function sessionMonths() {
  const start = periodPresets().find((p) => p.key === "session").from;
  const y = Number(start.slice(0, 4));
  return Array.from({ length: 12 }, (_, i) => `${MONTHS[(3 + i) % 12]}-${i < 9 ? y : y + 1}`);
}

export default function FeeDuesPage() {
  usePageTitle("Fee Dues & Defaulters");
  const months = sessionMonths();
  const now = new Date();
  const thisMonth = `${MONTHS[now.getMonth()]}-${now.getFullYear()}`;
  const [month, setMonth] = useState(months.includes(thisMonth) ? thisMonth : months[months.length - 1]);
  const [tab, setTab] = useState("defaulters");
  const { classId, className } = useClassFilter();
  const { data, isFetching, error } = useGetFeesDueReportQuery({ month, classId });
  const t = data?.totals;
  const loading = isFetching;
  const asOf = (data?.asOf || month).replace("-", " ");

  return (
    <div>
      <ReportHeader title="Fee Dues & Defaulters" icon={Wallet}
        subtitle={className ? `${className} — fee position and every student who owes` : "Class-wise fee position and every student who owes"} />
      <FilterBar>
        <ClassPicker />
        <Picker label="Dues counted till" value={month} onChange={setMonth} minWidth={140}
          options={months.map((m) => ({ value: m, label: m.replace("-", " ") }))} />
      </FilterBar>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="pink" label={`Due till ${asOf}`} loading={loading} value={moneyShort(t?.overdue)} title={money(t?.overdue)}
          sub={`${num(t?.defaulters)} student${t?.defaulters === 1 ? "" : "s"} owe`} />
        <GradientStat tone="blue" label="Session fee" loading={loading} value={moneyShort(t?.sessionFee)} title={money(t?.sessionFee)}
          sub={`${num(t?.students)} students billed`} />
        <GradientStat tone="green" label="Collected" loading={loading} value={moneyShort(t?.collected)} title={money(t?.collected)}
          sub={`${pctText(t?.collectionRate)} of session fee`} />
        <GradientStat tone="orange" label="Remaining for session" loading={loading} value={moneyShort(t?.remaining)} title={money(t?.remaining)}
          sub="includes months not due yet" />
      </StatGrid>

      <BarsPanel className="mb-5" title="Class-wise fee position" subtitle="Collected and still remaining for the session"
        unit="money" stacked loading={loading} data={data?.classes || []} xKey="className"
        series={[{ key: "collected", name: "Collected", color: BLUE }, { key: "remaining", name: "Remaining", color: ORANGE }]}
        empty="No class has a fee structure yet." />

      <div className="mb-3">
        <Segmented label="Fee due tables" value={tab} onChange={setTab} options={[
          { key: "defaulters", label: "Defaulters", count: data?.defaulters?.length },
          { key: "classes", label: "Class-wise", count: data?.classes?.length },
        ]} />
      </div>

      {tab === "defaulters" ? (
        <DataPanel key="defaulters" title={`Defaulters — due till ${asOf}`} subtitle={className ? `${className} · highest dues first` : "Highest dues first"}
          printSubtitle={`${className ? `${className} · ` : ""}Fee due till ${asOf}`} filename="fee-defaulters" loading={loading} rows={data?.defaulters || []}
          emptyText="No student owes anything till this month."
          columns={[
            { key: "name", label: "Student" },
            { key: "className", label: "Class" },
            { key: "rollNumber", label: "Roll no." },
            { key: "fatherName", label: "Father" },
            { key: "phone", label: "Phone", nowrap: true },
            { key: "previousDue", label: "Previous due", align: "right", money: true },
            { key: "currentDue", label: "This month", align: "right", money: true },
            { key: "overdue", label: "Total due", align: "right", money: true },
            { key: "paid", label: "Paid (session)", align: "right", money: true },
          ]}
          footer={t && { items: [{ label: "Total due", value: money(t.overdue) }], print: `Total due: ${money(t.overdue)}` }}
        />
      ) : (
        <DataPanel key="classes" title="Class-wise fee position" subtitle={`Session figures · due till ${asOf}`}
          printSubtitle={`Class-wise fees · due till ${asOf}`} filename="fee-class-wise" loading={loading} rows={data?.classes || []}
          columns={[
            { key: "className", label: "Class" },
            { key: "students", label: "Students", align: "right" },
            { key: "sessionFee", label: "Session fee", align: "right", money: true },
            { key: "collected", label: "Collected", align: "right", money: true },
            { key: "remaining", label: "Remaining", align: "right", money: true },
            { key: "overdue", label: `Due till ${asOf}`, align: "right", money: true },
            { key: "defaulters", label: "Defaulters", align: "right" },
            { key: "collectionRate", label: "Collected %", align: "right", value: (r) => r.collectionRate, render: (r) => <RateBadge value={r.collectionRate} /> },
          ]}
          footer={t && {
            items: [
              { label: "Session fee", value: money(t.sessionFee) },
              { label: "Collected", value: money(t.collected) },
              { label: "Due", value: money(t.overdue) },
            ],
            print: `Session fee ${money(t.sessionFee)} · Collected ${money(t.collected)} · Due ${money(t.overdue)}`,
          }}
        />
      )}
    </div>
  );
}
