/**
 * Dashboard v2 · Paid Fee Type Report — the fee actually received in a
 * period, split by fee type, category, payment mode and class, with every
 * receipt. Concessions are shown but never counted as money received.
 */
import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetIncomeReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, GradientStat, StatGrid, DataPanel, Panel, ShareBars, Segmented, TrendPanel, dailyCollection,
  ClassPicker, useClassFilter,
  money, moneyShort, num, fmtDate, usePeriod,
} from "./_ui";

const CATEGORY = { school: "School fee", transport: "Transport", admission: "Admission", books: "Books & Uniform" };

export default function FeeTypePage() {
  usePageTitle("Paid Fee Type Report");
  const period = usePeriod("month");
  const [tab, setTab] = useState("types");
  const [feeType, setFeeType] = useState("");
  const { classId, className } = useClassFilter();
  const { data, isFetching, error } = useGetIncomeReportQuery({ from: period.from, to: period.to, classId });
  const t = data?.totals;
  const loading = isFetching && !data;
  const sub = `${className ? `${className} · ` : ""}${period.from} to ${period.to}`;
  const types = data?.feeTypes || [];
  // Every day of the period (zero days included); months for a long period.
  const trend = useMemo(() => dailyCollection(period.from, period.to, data?.byDay, data?.receipts), [period.from, period.to, data]);

  // A receipt lists its lines as "Tuition Fee (Oct-2026)" — filter on the name.
  const receipts = useMemo(
    () => (data?.receipts || []).filter((r) => !feeType || r.items.some((i) => i === feeType || i.startsWith(`${feeType} (`))),
    [data, feeType]
  );
  const receiptTotal = receipts.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <ReportHeader title="Paid Fee Type Report" subtitle="Fee received — by fee type, payment mode and class, with every receipt" icon={Receipt} />
      <PeriodPicker period={period}><ClassPicker /></PeriodPicker>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="pink" label="Fee received" loading={loading} value={moneyShort(t?.fee)} title={money(t?.fee)}
          sub={`${num(t?.receipts)} receipt${t?.receipts === 1 ? "" : "s"}`} />
        <GradientStat tone="violet" label="Fee types paid" loading={loading} value={num(types.length)}
          sub={types[0] ? `Most: ${types[0].name}` : "None in this period"} />
        <GradientStat tone="cyan" label="Students paid" loading={loading}
          value={num(new Set((data?.receipts || []).map((r) => r.studentId)).size)} sub="at least one receipt" />
        <GradientStat tone="orange" label="Concession given" loading={loading} value={moneyShort(t?.concession)} title={money(t?.concession)}
          sub={`${num(t?.concessionEntries)} entr${t?.concessionEntries === 1 ? "y" : "ies"} · not income`} />
      </StatGrid>

      <StatGrid twoUp>
        {(data?.byCategory || Object.keys(CATEGORY).map((key) => ({ key, name: CATEGORY[key] }))).map((c, i) => (
          <GradientStat key={c.key} compact tone={["blue", "teal", "purple", "green"][i]} label={c.name} loading={loading}
            value={moneyShort(c.amount)} title={money(c.amount)}
            sub={t?.fee ? `${Math.round(((c.amount || 0) / t.fee) * 100)}% of fee` : "—"} />
        ))}
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-1" title="By fee type" subtitle="Share of fee received">
          <ShareBars rows={types.map((r) => ({ name: r.name, value: r.amount }))} empty="No fee received in this period." />
        </Panel>
        <TrendPanel className="xl:col-span-2" title={trend.grain === "month" ? "Month-wise collection" : "Day-wise collection"}
          subtitle={trend.grain === "month" ? "Fee received each month" : "Fee received each day, including days with none"}
          loading={loading} data={trend.data} xKey={trend.xKey} xFmt={trend.xFmt} name="Collected"
          tipExtra={(d) => (d.receipts ? `${num(d.receipts)} receipt${d.receipts === 1 ? "" : "s"}` : "No receipt")}
          empty="No fee received in this period." />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="By payment mode">
          <ShareBars rows={(data?.byMode || []).map((r) => ({ name: r.name, value: r.amount }))} empty="No payments." />
        </Panel>
        <Panel title={className ? `By section · ${className}` : "By class"}>
          <ShareBars rows={(data?.byClass || []).map((r) => ({ name: r.name, value: r.amount }))} empty="No payments." max={10} />
        </Panel>
      </div>

      <div className="mb-3">
        <Segmented label="Fee tables" value={tab} onChange={setTab} options={[
          { key: "types", label: "Fee types", count: types.length },
          { key: "receipts", label: "Receipts", count: data?.receipts?.length },
        ]} />
      </div>

      {tab === "types" ? (
        <DataPanel key="types" title="Fee type summary" subtitle={sub} printSubtitle={`Paid fee types · ${sub}`}
          filename="paid-fee-types" loading={loading} rows={types} defaultSort={{ key: "amount", dir: "desc" }}
          columns={[
            { key: "name", label: "Fee type" },
            { key: "category", label: "Category", value: (r) => CATEGORY[r.category] || r.category },
            { key: "students", label: "Students", align: "right" },
            { key: "payments", label: "Payments", align: "right" },
            { key: "amount", label: "Amount", align: "right", money: true },
            { key: "share", label: "Share", align: "right", value: (r) => (t?.fee ? Math.round((r.amount / t.fee) * 1000) / 10 : 0), render: (r) => `${t?.fee ? ((r.amount / t.fee) * 100).toFixed(1) : 0}%` },
          ]}
          footer={t && { items: [{ label: "Total fee received", value: money(t.fee) }], print: `Total fee received: ${money(t.fee)}` }}
        />
      ) : (
        <DataPanel key="receipts" title="Receipt register" subtitle={feeType ? `${sub} · ${feeType}` : sub}
          printSubtitle={`Receipts · ${sub}${feeType ? ` · ${feeType}` : ""}`} filename="fee-receipts" loading={loading} rows={receipts}
          tools={
            <select value={feeType} onChange={(e) => setFeeType(e.target.value)} aria-label="Fee type"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12.5px] focus:border-blue-500 focus:outline-none">
              <option value="">All fee types</option>
              {types.map((ft) => <option key={ft.name} value={ft.name}>{ft.name}</option>)}
            </select>
          }
          columns={[
            { key: "receiptNo", label: "Receipt", nowrap: true },
            { key: "date", label: "Date", nowrap: true, value: (r) => fmtDate(r.date), sortValue: (r) => r.date },
            { key: "studentName", label: "Student" },
            { key: "className", label: "Class" },
            { key: "items", label: "Fee lines", value: (r) => r.items.join(", ") },
            { key: "mode", label: "Mode" },
            { key: "amount", label: "Amount", align: "right", money: true },
          ]}
          footer={{
            // A receipt can carry several fee types; its amount is the whole receipt.
            items: [{ label: feeType ? "These receipts, all lines" : "Total", value: money(receiptTotal) }],
            print: `${feeType ? "These receipts, all lines" : "Total"}: ${money(receiptTotal)}`,
          }}
        />
      )}
    </div>
  );
}
