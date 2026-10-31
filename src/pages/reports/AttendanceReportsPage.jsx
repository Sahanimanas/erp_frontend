/**
 * Attendance Report — student attendance over a period: overall rate, class by
 * class, day by day, and the students below a threshold, plus a staff summary.
 * PRESENT and LATE count as attended (the Student Profile / mobile rule).
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Badge } from "../../components/ui";
import { useGetAttendanceReportQuery } from "../../redux/api/reportsApi";
import {
  usePeriod, PeriodBar, ReportError, Kpi, KpiRow, ReportTable, BarsChart, useReportClass, ClassSelect,
  num, pctText, fmtDate, dayLabel, monthLabel, BLUE, ORANGE,
} from "./_shared";

const rateBadge = (p) => <Badge variant={p >= 75 ? "success" : p >= 60 ? "warning" : "danger"}>{pctText(p)}</Badge>;

const selectStyle = { borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" };

export default function AttendanceReportsPage() {
  usePageTitle("Attendance Report");
  const navigate = useNavigate();
  const period = usePeriod("month");
  // The class lives in the URL so the Reports home can open this on a class.
  const cls = useReportClass();
  const classId = cls.classId;
  const [threshold, setThreshold] = useState(75);
  const { data, isFetching, error } = useGetAttendanceReportQuery({ from: period.from, to: period.to, classId, threshold });

  const t = data?.totals;
  const span = `${fmtDate(period.from)} – ${fmtDate(period.to)}`;

  // More than ~6 weeks of daily bars is unreadable — roll those up by month.
  const trend = useMemo(() => {
    const days = data?.daily ?? [];
    if (days.length <= 45) return { rows: days, key: "date", fmt: dayLabel, title: "Day by day" };
    const byMonth = new Map();
    for (const d of days) {
      const k = d.date.slice(0, 7);
      const m = byMonth.get(k) || { month: k, attended: 0, absent: 0 };
      m.attended += d.attended;
      m.absent += d.absent;
      byMonth.set(k, m);
    }
    return { rows: [...byMonth.values()], key: "month", fmt: monthLabel, title: "Month by month" };
  }, [data]);

  const studentCols = [
    { key: "name", label: "Student", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
    { key: "rollNumber", label: "Roll No" },
    { key: "className", label: "Class" },
    { key: "fatherName", label: "Father" },
    { key: "phone", label: "Phone" },
    { key: "present", label: "Present" },
    { key: "late", label: "Late" },
    { key: "absent", label: "Absent" },
    { key: "leave", label: "Leave" },
    { key: "total", label: "Marked" },
    { key: "pct", label: "Attendance", value: (r) => `${r.pct}%`, render: (r) => rateBadge(r.pct) },
  ];

  return (
    <div>
      <PageHeader title="Attendance Report" subtitle="Student and staff attendance" icon={<UserCheck />} />
      <PeriodBar period={period}>
        <ClassSelect cls={cls} />
        <label className="text-[14px] font-bold text-[#24282e]">
          <span className="block mb-1">Low attendance below</span>
          <select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Low attendance threshold"
            className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none" style={selectStyle}>
            {[60, 65, 70, 75, 80, 85, 90].map((n) => <option key={n} value={n}>{n}%</option>)}
          </select>
        </label>
      </PeriodBar>
      <ReportError error={error} />

      <KpiRow cols={6}>
        <Kpi label="Attendance" value={t?.total ? pctText(t.pct) : "—"}
             sub={t?.total ? `${num((t.present ?? 0) + (t.late ?? 0))} of ${num(t.total)} marked` : "Not marked in this period"}
             tone={!t?.total ? "var(--erp-text)" : t.pct >= 75 ? "var(--erp-success)" : "var(--erp-danger)"} loading={isFetching} />
        <Kpi label="Present" value={num(t?.present)} sub={`Late ${num(t?.late)}`} loading={isFetching} />
        <Kpi label="Absent" value={num(t?.absent)} tone="var(--erp-danger)" loading={isFetching} />
        <Kpi label="Leave / half day" value={`${num(t?.leave)} / ${num(t?.halfDay)}`} loading={isFetching} />
        <Kpi label="Days marked" value={num(t?.markedDays)} sub={`${num(t?.students)} students`} loading={isFetching} />
        <Kpi label={`Below ${data?.threshold ?? threshold}%`} value={num(data?.lowAttendance?.length)} sub="students"
             tone="var(--erp-warning)" loading={isFetching} />
      </KpiRow>

      <BarsChart
        title={trend.title}
        subtitle={span}
        data={trend.rows}
        xKey={trend.key}
        xFmt={trend.fmt}
        unit="count"
        stacked
        series={[
          { key: "attended", name: "Attended", color: BLUE },
          { key: "absent", name: "Absent", color: ORANGE },
        ]}
      />

      <ReportTable
        title="Class-wise attendance"
        filename={`class-attendance-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        rows={data?.classes ?? []}
        emptyText="No attendance marked in this period."
        columns={[
          { key: "className", label: "Class", render: (r) => <span className="font-semibold">{r.className}{r.section ? `-${r.section}` : ""}</span>, value: (r) => `${r.className}${r.section ? `-${r.section}` : ""}` },
          { key: "students", label: "Students" },
          { key: "present", label: "Present" },
          { key: "late", label: "Late" },
          { key: "absent", label: "Absent" },
          { key: "leave", label: "Leave" },
          { key: "total", label: "Marked" },
          { key: "pct", label: "Attendance", value: (r) => `${r.pct}%`, render: (r) => rateBadge(r.pct) },
        ]}
      />

      <ReportTable
        title={`Students below ${data?.threshold ?? threshold}%`}
        subtitle="Lowest first · click a row to open the student's profile"
        filename={`low-attendance-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.lowAttendance ?? []}
        emptyText="All good — no student is below the attendance threshold."
        onRowClick={(r) => navigate(`/student-360?id=${r.studentId}`)}
        columns={studentCols}
      />

      <ReportTable
        title="All students"
        filename={`student-attendance-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.students ?? []}
        onRowClick={(r) => navigate(`/student-360?id=${r.studentId}`)}
        columns={studentCols}
      />

      {!classId && (
        <ReportTable
          title="Staff attendance"
          filename={`staff-attendance-${period.from}-to-${period.to}`}
          printSubtitle={span}
          loading={isFetching}
          rows={data?.staff?.total ? [data.staff] : []}
          emptyText="No staff attendance marked in this period."
          columns={[
            { key: "present", label: "Present" },
            { key: "late", label: "Late" },
            { key: "absent", label: "Absent" },
            { key: "leave", label: "Leave" },
            { key: "halfDay", label: "Half day" },
            { key: "total", label: "Marked" },
            { key: "pct", label: "Attendance", value: (r) => `${r.pct}%`, render: (r) => rateBadge(r.pct) },
          ]}
        />
      )}
    </div>
  );
}
