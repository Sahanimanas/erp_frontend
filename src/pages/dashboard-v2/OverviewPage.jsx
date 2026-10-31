/**
 * Dashboard v2 · Overview — the school today and this month on one screen.
 * Every tile and panel opens the complete report behind it.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, UsersRound, ClipboardCheck, IndianRupee, LayoutDashboard, ChevronRight, Cake, Receipt,
} from "lucide-react";
import { usePageTitle } from "../../hooks";
import {
  useGetReportSnapshotQuery, useGetFeesDueReportQuery, useGetAttendanceReportQuery,
  useGetBirthdaysReportQuery, useGetIncomeReportQuery,
} from "../../redux/api/reportsApi";
import {
  ReportHeader, Panel, Segmented, GradientStat, StatGrid, BarsPanel, Donut, Empty, ErrorNote, RateBadge, TrendPanel,
  dailyCollection,
  ClassPicker, useClassFilter, BLUE, ORANGE, GREY, money, moneyShort, num, pctText, fmtDate, dayLabel, periodPresets,
} from "./_ui";

const R = "/dashboard/v2";
const q = (from, to) => `?from=${from}&to=${to}`;

function PanelLink({ to, children }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-blue-700 hover:bg-blue-50">
      {children} <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function OverviewPage() {
  usePageTitle("Dashboard v2");
  const [p] = useState(() => periodPresets());
  const today = p.find((x) => x.key === "today");
  const month = p.find((x) => x.key === "month");
  const lastMonth = p.find((x) => x.key === "lastmonth");
  const session = p.find((x) => x.key === "session");

  // Student-side figures follow the class filter; staff figures are school-wide.
  const { classId, className } = useClassFilter();
  const { data: s, isFetching: sLoading, error } = useGetReportSnapshotQuery({ classId });
  // The fee engine walks every class, so dues load on their own.
  const { data: dues, isFetching: duesLoading } = useGetFeesDueReportQuery({ classId });
  const [attView, setAttView] = useState("today");
  const attRange = attView === "today" ? today : month;
  const { data: att, isFetching: attLoading } = useGetAttendanceReportQuery({ from: attRange.from, to: attRange.to, classId });
  const { data: bdays, isFetching: bLoading } = useGetBirthdaysReportQuery({ days: 7, classId });
  const { data: inc, isFetching: incLoading } = useGetIncomeReportQuery({ from: month.from, to: month.to, classId });

  // Every day of the month so far, including days nothing came in.
  const daily = useMemo(() => dailyCollection(month.from, month.to, inc?.byDay, inc?.receipts), [month, inc]);
  const paidDays = daily.data.filter((d) => d.amount > 0);
  const bestDay = paidDays.reduce((b, d) => (!b || d.amount > b.amount ? d : b), null);

  const a = s?.attendance?.students;
  const st = s?.attendance?.staff;
  const asOf = dues?.asOf?.replace("-", " ");

  // Session fee as one whole: collected, due now, and not yet due.
  const t = dues?.totals;
  const dueNow = t?.overdue ?? 0;
  const notYet = Math.max(0, (t?.remaining ?? 0) - dueNow);

  return (
    <div>
      <ReportHeader title="Overview" icon={LayoutDashboard}
        subtitle={className ? `${className} today and this month — staff figures are for the whole school` : "Today and this month at a glance — open any card for its full report"}>
        <ClassPicker />
      </ReportHeader>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="violet" icon={Users} label={className ? `Students · ${className}` : "Total students"} loading={sLoading && !s}
          value={num(s?.students?.active)} sub={`${num(s?.students?.newToday)} new today`}
          to={`${R}/admissions${q(session.from, session.to)}`} />
        <GradientStat tone="blue" icon={UsersRound} label="Total staff" loading={sLoading && !s}
          value={num(s?.staff?.total)} sub={`${num(s?.staff?.teachers)} teachers`}
          to={`${R}/staff-attendance`} />
        <GradientStat tone="green" icon={ClipboardCheck} label="Attendance today" loading={sLoading && !s}
          value={a?.total ? pctText(a.pct) : "—"}
          sub={a?.total ? `${num(a.attended)} present of ${num(a.total)} marked` : "Not marked yet today"}
          to={`${R}/attendance${q(today.from, today.to)}`} />
        <GradientStat tone="pink" icon={IndianRupee} label="Fee collected" loading={sLoading && !s}
          value={moneyShort(s?.fees?.thisMonth)} title={money(s?.fees?.thisMonth)}
          sub={dues ? `This month · ${moneyShort(dueNow)} due` : `This month · ${money(s?.fees?.today)} today`}
          to={`${R}/fee-types`} />
      </StatGrid>

      <StatGrid twoUp>
        <GradientStat compact tone="cyan" label="Admissions today" loading={sLoading && !s}
          value={num(s?.admissions?.today)} to={`${R}/admissions${q(today.from, today.to)}`} />
        <GradientStat compact tone="purple" label="Yesterday" loading={sLoading && !s}
          value={num(s?.admissions?.yesterday)} to={s ? `${R}/admissions${q(s.yesterday, s.yesterday)}` : undefined} />
        <GradientStat compact tone="teal" label="This month" loading={sLoading && !s}
          value={num(s?.admissions?.thisMonth)} to={`${R}/admissions${q(month.from, month.to)}`} />
        <GradientStat compact tone="orange" label="Last month" loading={sLoading && !s}
          value={num(s?.admissions?.lastMonth)} to={`${R}/admissions${q(lastMonth.from, lastMonth.to)}`} />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Attendance: today class by class, or this month day by day. */}
        <BarsPanel
          className="xl:col-span-3"
          title="Attendance overview"
          subtitle={
            attView === "today"
              ? att?.totals?.total ? `Section-wise · ${pctText(att.totals.pct)} attended today` : "Section-wise, today"
              : att?.totals?.total ? `Day by day · ${pctText(att.totals.pct)} attended this month` : "Day by day, this month"
          }
          tools={
            <Segmented label="Attendance period" value={attView} onChange={setAttView}
              options={[{ key: "today", label: "Today" }, { key: "month", label: "This month" }]} />
          }
          {...(attView === "today"
            ? {
                data: (att?.classes || []).map((c) => ({ ...c, label: `${c.className}${c.section ? `-${c.section}` : ""}`, attended: c.present + c.late })),
                xKey: "label",
                empty: <span>No attendance marked today.<br /><span className="text-[12.5px]">Students enrolled{className ? ` in ${className}` : ""}: {num(s?.students?.active)}</span></span>,
              }
            : { data: att?.daily || [], xKey: "date", xFmt: dayLabel, empty: "No attendance marked this month." })}
          series={[{ key: "attended", name: "Present", color: BLUE }, { key: "absent", name: "Absent", color: ORANGE }]}
          stacked height={250} loading={attLoading}
          footer={<PanelLink to={`${R}/attendance${q(attRange.from, attRange.to)}`}>Full attendance report</PanelLink>}
        />

        <Panel className="xl:col-span-2" title="Fee collection"
          subtitle={t ? `${session.label} · due counted till ${asOf}` : session.label}
          action={<PanelLink to={`${R}/fee-dues`}>Defaulters</PanelLink>}>
          {duesLoading && !dues ? (
            <div className="mx-auto h-[220px] w-[220px] animate-pulse rounded-full bg-slate-100" />
          ) : (
            <>
              <Donut
                centerLabel="Collected"
                centerValue={pctText(t?.collectionRate)}
                parts={[
                  { name: "Collected", value: t?.collected ?? 0, color: BLUE },
                  { name: "Due now", value: dueNow, color: ORANGE },
                  { name: "Not yet due", value: notYet, color: GREY },
                ]}
              />
              <div className="mt-4 grid grid-cols-3 border-t border-slate-100 pt-4 text-center">
                {[
                  ["Session fee", t?.sessionFee],
                  ["Collected", t?.collected],
                  ["Due now", dueNow],
                ].map(([label, v]) => (
                  <div key={label}>
                    <p className="text-[12px] text-slate-600">{label}</p>
                    <p className="text-[16px] font-bold text-slate-900" title={money(v)}>{moneyShort(v)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <TrendPanel
        className="mb-5"
        title="Day-wise collection (month to date)"
        subtitle={`${dayLabel(month.from)} – ${dayLabel(month.to)}${className ? ` · ${className}` : ""} · fee received each day`}
        data={daily.data} xKey={daily.xKey} xFmt={daily.xFmt} name="Collected" loading={incLoading && !inc}
        tipExtra={(d) => (d.receipts ? `${num(d.receipts)} receipt${d.receipts === 1 ? "" : "s"}` : "No receipt")}
        empty="No fee received this month yet."
        tools={<PanelLink to={`${R}/fee-types${q(month.from, month.to)}`}>All receipts</PanelLink>}
        footer={inc?.totals?.fee > 0 && (
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
            {[
              ["Collected this month", money(inc.totals.fee)],
              ["Days with collection", `${num(paidDays.length)} of ${num(daily.data.length)}`],
              ["Best day", bestDay ? `${dayLabel(bestDay.date)} · ${moneyShort(bestDay.amount)}` : "—"],
              ["Daily average", moneyShort(inc.totals.fee / Math.max(1, daily.data.length))],
            ].map(([label, v]) => (
              <div key={label}>
                <p className="text-[12px] text-slate-600">{label}</p>
                <p className="text-[15px] font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Staff today" subtitle={st?.total ? `${pctText(st.pct)} attended` : "Attendance not marked yet"}
          action={<PanelLink to={`${R}/staff-attendance${q(today.from, today.to)}`}>Full report</PanelLink>}>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Present", (st?.present ?? 0) + (st?.late ?? 0), "text-slate-900"],
              ["Absent", st?.absent, "text-slate-900"],
              ["On leave", st?.leave, "text-slate-900"],
              ["Not marked", Math.max(0, (s?.staff?.total ?? 0) - (st?.total ?? 0)), "text-slate-900"],
            ].map(([label, v, cls]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[12px] text-slate-600">{label}</p>
                <p className={`text-[22px] font-bold leading-tight ${cls}`}>{sLoading && !s ? "…" : num(v)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Birthdays this week" subtitle={className ? `${className} students, next 7 days` : "Students and staff, next 7 days"}
          action={<PanelLink to={`${R}/birthdays`}>All birthdays</PanelLink>}>
          {bLoading && !bdays ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : !bdays?.people?.length ? (
            <Empty h={150}>No birthdays in the next 7 days.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bdays.people.slice(0, 5).map((b) => (
                <li key={`${b.kind}-${b.id}`} className="flex items-center gap-3 py-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${b.inDays === 0 ? "bg-pink-600 text-white" : "bg-pink-50 text-pink-700"}`}>
                    <Cake size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-slate-900">{b.name}</p>
                    <p className="truncate text-[12px] text-slate-600">{b.kind === "staff" ? "Staff" : "Student"} · {b.detail}</p>
                  </div>
                  <span className="whitespace-nowrap text-[12px] font-semibold text-slate-700">
                    {b.inDays === 0 ? "Today" : b.inDays === 1 ? "Tomorrow" : dayLabel(b.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest fee receipts" subtitle={inc ? `${num(inc.totals?.receipts)} this month · ${money(inc.totals?.fee)}` : "This month"}
          action={<PanelLink to={`${R}/fee-types`}>All receipts</PanelLink>}>
          {incLoading && !inc ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : !inc?.receipts?.length ? (
            <Empty h={150}>No fee received this month yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {inc.receipts.slice(0, 5).map((r) => (
                <li key={`${r.receiptNo}-${r.studentId}`} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <Receipt size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-slate-900">{r.studentName}</p>
                    <p className="truncate text-[12px] text-slate-600">{r.className} · {fmtDate(r.date)} · {r.mode}</p>
                  </div>
                  <span className="whitespace-nowrap text-[13.5px] font-bold text-slate-900">{money(r.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {s?.attendance?.students?.total > 0 && a.pct < 75 && (
        <p className="mt-5 text-[12.5px] text-slate-600">
          Today's attendance is <RateBadge value={a.pct} /> — see who is missing in the{" "}
          <Link className="font-semibold text-blue-700 underline" to={`${R}/attendance${q(today.from, today.to)}`}>attendance report</Link>.
        </p>
      )}
    </div>
  );
}
