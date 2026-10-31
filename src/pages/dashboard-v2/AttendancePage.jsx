/**
 * Dashboard v2 · Attendance Report — student attendance for a period: the
 * headline rate, the day-by-day trend, and class-wise, low-attendance and
 * every-student registers. PRESENT and LATE count as attended.
 */
import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetAttendanceReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, GradientStat, StatGrid, BarsPanel, DataPanel, Segmented, Picker, RateBadge,
  ClassPicker, useClassFilter,
  BLUE, ORANGE, GREY, num, pctText, usePeriod, byDayOrMonth,
} from "./_ui";

const cls = (r) => `${r.className}${r.section ? `-${r.section}` : ""}`;

export default function AttendancePage() {
  usePageTitle("Attendance Report");
  const period = usePeriod("month");
  const { classId, className } = useClassFilter();
  const [threshold, setThreshold] = useState("75");
  const [tab, setTab] = useState("classes");
  const { data, isFetching, error } = useGetAttendanceReportQuery({ from: period.from, to: period.to, classId, threshold });
  const t = data?.totals;
  const loading = isFetching && !data;
  const trend = byDayOrMonth(data?.daily || [], ["attended", "absent", "leave"]);
  const sub = `${className ? `${className} · ` : ""}${period.from} to ${period.to}`;

  const tables = {
    classes: {
      title: className ? `${className} — section-wise attendance` : "Class-wise attendance",
      filename: "attendance-class-wise",
      rows: data?.classes || [],
      columns: [
        { key: "class", label: "Class", value: cls },
        { key: "students", label: "Students", align: "right" },
        { key: "present", label: "Present", align: "right" },
        { key: "late", label: "Late", align: "right" },
        { key: "absent", label: "Absent", align: "right" },
        { key: "leave", label: "Leave", align: "right" },
        { key: "total", label: "Marks", align: "right" },
        { key: "pct", label: "Attended", align: "right", render: (r) => <RateBadge value={r.pct} good={Number(threshold)} />, value: (r) => r.pct },
      ],
    },
    low: {
      title: `Below ${threshold}% attendance`,
      filename: "attendance-low",
      rows: data?.lowAttendance || [],
      columns: [
        { key: "name", label: "Student" },
        { key: "className", label: "Class" },
        { key: "rollNumber", label: "Roll no." },
        { key: "fatherName", label: "Father" },
        { key: "phone", label: "Phone", nowrap: true },
        { key: "absent", label: "Absent", align: "right" },
        { key: "total", label: "Marks", align: "right" },
        { key: "pct", label: "Attended", align: "right", render: (r) => <RateBadge value={r.pct} good={Number(threshold)} />, value: (r) => r.pct },
      ],
      emptyText: `No student is below ${threshold}% in this period.`,
    },
    students: {
      title: "Every student",
      filename: "attendance-students",
      rows: data?.students || [],
      columns: [
        { key: "name", label: "Student" },
        { key: "className", label: "Class" },
        { key: "rollNumber", label: "Roll no." },
        { key: "present", label: "Present", align: "right" },
        { key: "late", label: "Late", align: "right" },
        { key: "absent", label: "Absent", align: "right" },
        { key: "leave", label: "Leave", align: "right" },
        { key: "pct", label: "Attended", align: "right", render: (r) => <RateBadge value={r.pct} good={Number(threshold)} />, value: (r) => r.pct },
      ],
    },
  };
  const table = tables[tab];

  return (
    <div>
      <ReportHeader title="Attendance Report" subtitle="Student attendance — class by class, day by day, student by student" icon={ClipboardCheck} />
      <PeriodPicker period={period}>
        <ClassPicker />
        <Picker label="Low attendance below" value={threshold} onChange={setThreshold} minWidth={110}
          options={["60", "75", "85", "90"].map((v) => ({ value: v, label: `${v}%` }))} />
      </PeriodPicker>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="green" label="Attended" loading={loading} value={t?.total ? pctText(t.pct) : "—"}
          sub={t?.total ? `${num(t.present + t.late)} of ${num(t.total)} marks` : "Nothing marked in this period"} />
        <GradientStat tone="pink" label="Absent" loading={loading} value={num(t?.absent)}
          sub={`${num(t?.leave)} on leave · ${num(t?.halfDay)} half day`} />
        <GradientStat tone="blue" label="Students recorded" loading={loading} value={num(t?.students)}
          sub={`over ${num(t?.markedDays)} marked day${t?.markedDays === 1 ? "" : "s"}`} />
        <GradientStat tone="orange" label={`Below ${threshold}%`} loading={loading} value={num(data?.lowAttendance?.length)}
          sub="students need follow-up" />
      </StatGrid>

      <BarsPanel className="mb-5" title="Attendance trend"
        subtitle={trend.grain === "month" ? "Month by month" : "Day by day"}
        data={trend.data} xKey={trend.xKey} xFmt={trend.xFmt} stacked loading={loading}
        series={[
          { key: "attended", name: "Present", color: BLUE },
          { key: "absent", name: "Absent", color: ORANGE },
          { key: "leave", name: "Leave", color: GREY },
        ]}
        empty="No attendance marked in this period." />

      <div className="mb-3">
        <Segmented label="Attendance tables" value={tab} onChange={setTab} options={[
          { key: "classes", label: "Class-wise", count: data?.classes?.length },
          { key: "low", label: `Below ${threshold}%`, count: data?.lowAttendance?.length },
          { key: "students", label: "Every student", count: data?.students?.length },
        ]} />
      </div>
      <DataPanel key={tab} {...table} subtitle={sub} printSubtitle={`Attendance · ${sub}`} loading={loading} />
    </div>
  );
}
