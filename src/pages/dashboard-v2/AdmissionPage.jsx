/**
 * Dashboard v2 · Admission Report — new admissions in a period (when, which
 * class, boys/girls, category), who left, and the school's current strength
 * class by class.
 */
import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetStudentStrengthReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, GradientStat, StatGrid, BarsPanel, DataPanel, Panel, ShareBars, Segmented,
  ClassPicker, useClassFilter,
  BLUE, ORANGE, num, fmtDate, dayLabel, monthLabel, usePeriod,
} from "./_ui";

/** The Indian calendar day an instant falls on. */
const istDay = (d) => new Date(new Date(d).getTime() + 330 * 60000).toISOString().slice(0, 10);
const gender = (g) => (/^m/i.test(g || "") ? "Boy" : /^f/i.test(g || "") ? "Girl" : "—");

function monthsBetween(from, to) {
  const out = [];
  let [y, m] = from.slice(0, 7).split("-").map(Number);
  const [ey, em] = to.slice(0, 7).split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

export default function AdmissionPage() {
  usePageTitle("Admission Report");
  const period = usePeriod("session");
  const [tab, setTab] = useState("admissions");
  const { classId, className } = useClassFilter();
  const { data, isFetching, error } = useGetStudentStrengthReportQuery({ from: period.from, to: period.to, classId });
  const t = data?.totals;
  const loading = isFetching && !data;
  const sub = `${className ? `${className} · ` : ""}${period.from} to ${period.to}`;

  // Admissions over time: by month for a long period, by day for a short one.
  const trend = useMemo(() => {
    const list = data?.admissions || [];
    const months = monthsBetween(period.from, period.to);
    const byMonth = months.length > 1;
    const counts = new Map(byMonth ? months.map((m) => [m, 0]) : []);
    for (const a of list) {
      const k = byMonth ? istDay(a.admissionDate).slice(0, 7) : istDay(a.admissionDate);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const rows = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, admissions]) => ({ k, admissions }));
    return { rows, fmt: byMonth ? monthLabel : dayLabel, byMonth };
  }, [data, period.from, period.to]);

  const newBoys = (data?.admissions || []).filter((a) => gender(a.gender) === "Boy").length;
  const newGirls = (data?.admissions || []).filter((a) => gender(a.gender) === "Girl").length;
  const byClass = useMemo(() => {
    const m = new Map();
    for (const a of data?.admissions || []) m.set(a.className, (m.get(a.className) || 0) + 1);
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);

  const personCols = (dateKey, dateLabel) => [
    { key: "name", label: "Student" },
    { key: "admissionNo", label: "Admission no.", nowrap: true },
    { key: "className", label: "Class" },
    { key: "gender", label: "Gender", value: (r) => gender(r.gender) },
    { key: "fatherName", label: "Father" },
    { key: "phone", label: "Phone", nowrap: true },
    { key: dateKey, label: dateLabel, nowrap: true, value: (r) => fmtDate(r[dateKey]), sortValue: (r) => r[dateKey] },
  ];

  return (
    <div>
      <ReportHeader title="Admission Report" subtitle="New admissions, leavers and class strength" icon={UserPlus} />
      <PeriodPicker period={period}><ClassPicker /></PeriodPicker>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="cyan" label="New admissions" loading={loading} value={num(t?.newAdmissions)}
          sub={`${num(newBoys)} boys · ${num(newGirls)} girls`} />
        <GradientStat tone="violet" label="Current students" loading={loading} value={num(t?.total)}
          sub={`${num(t?.boys)} boys · ${num(t?.girls)} girls${t?.other ? ` · ${num(t.other)} other` : ""}`} />
        <GradientStat tone="orange" label="Left in this period" loading={loading} value={num(t?.leftInRange)}
          sub={`${num(t?.left)} left in all`} />
        <GradientStat tone="teal" label="Transport · hostel" loading={loading} value={`${num(t?.transport)} · ${num(t?.hostel)}`}
          sub="current students using them" />
      </StatGrid>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <BarsPanel className="xl:col-span-2" title="Admissions over time"
          subtitle={trend.byMonth ? "Month by month" : "Day by day"} loading={loading}
          data={trend.rows} xKey="k" xFmt={trend.fmt}
          series={[{ key: "admissions", name: "Admissions", color: BLUE }]} empty="No admissions in this period." />
        <Panel title={className ? "New admissions by section" : "New admissions by class"}>
          <ShareBars rows={byClass} format={num} empty="No admissions in this period." />
        </Panel>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <BarsPanel className="xl:col-span-2" title="Class strength" subtitle="Current students, boys and girls" stacked loading={loading}
          data={(data?.classes || []).map((c) => ({ ...c, label: `${c.className}${c.section ? `-${c.section}` : ""}` }))} xKey="label"
          series={[{ key: "boys", name: "Boys", color: BLUE }, { key: "girls", name: "Girls", color: ORANGE }]}
          empty="No current students." />
        <Panel title="Students by category">
          <ShareBars rows={(data?.byCategory || []).map((c) => ({ name: c.name, value: c.count }))} format={num} empty="No current students." />
        </Panel>
      </div>

      <div className="mb-3">
        <Segmented label="Admission tables" value={tab} onChange={setTab} options={[
          { key: "admissions", label: "New admissions", count: data?.admissions?.length },
          { key: "leavers", label: "Left", count: data?.leavers?.length },
          { key: "classes", label: "Class strength", count: data?.classes?.length },
        ]} />
      </div>

      {tab === "admissions" && (
        <DataPanel key="admissions" title="New admissions" subtitle={sub} printSubtitle={`New admissions · ${sub}`}
          filename="new-admissions" loading={loading} rows={data?.admissions || []} columns={personCols("admissionDate", "Admitted on")}
          emptyText="No admissions in this period." />
      )}
      {tab === "leavers" && (
        <DataPanel key="leavers" title="Students who left" subtitle={sub} printSubtitle={`Students who left · ${sub}`}
          filename="students-left" loading={loading} rows={data?.leavers || []} columns={personCols("leftDate", "Left on")}
          emptyText="No student left in this period." />
      )}
      {tab === "classes" && (
        <DataPanel key="classes" title="Class strength" subtitle="Current students" filename="class-strength"
          loading={loading} rows={data?.classes || []}
          columns={[
            { key: "class", label: "Class", value: (r) => `${r.className}${r.section ? `-${r.section}` : ""}` },
            { key: "boys", label: "Boys", align: "right" },
            { key: "girls", label: "Girls", align: "right" },
            { key: "other", label: "Other", align: "right" },
            { key: "total", label: "Total", align: "right" },
            { key: "newAdmissions", label: "New in period", align: "right" },
          ]}
          footer={t && { items: [{ label: "Total students", value: num(t.total) }], print: `Total students: ${num(t.total)}` }}
        />
      )}
    </div>
  );
}
