/**
 * Dashboard v2 · Staff Attendance — every staff member's attendance for a
 * period, by person, by department and day by day. PRESENT and LATE count as
 * attended, the same rule as students.
 */
import { useState } from "react";
import { UsersRound } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetStaffAttendanceReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, PeriodPicker, ErrorNote, SchoolWideNote, GradientStat, StatGrid, BarsPanel, DataPanel, Segmented, RateBadge, Hint,
  BLUE, ORANGE, GREY, num, pctText, usePeriod, byDayOrMonth,
} from "./_ui";

const ROLE = { TEACHER: "Teacher", ACCOUNTANT: "Accountant", PRINCIPAL: "Principal", SCHOOL_ADMIN: "Admin" };

export default function StaffAttendancePage() {
  usePageTitle("Staff Attendance");
  const period = usePeriod("month");
  const [tab, setTab] = useState("staff");
  const { data, isFetching, error } = useGetStaffAttendanceReportQuery({ from: period.from, to: period.to });
  const t = data?.totals;
  const loading = isFetching && !data;
  const trend = byDayOrMonth(data?.daily || [], ["attended", "absent", "leave"]);
  const sub = `${period.from} to ${period.to}`;
  const notMarked = t ? t.staff - t.recorded : 0;

  const tables = {
    staff: {
      title: "Staff-wise attendance",
      filename: "staff-attendance",
      rows: data?.staff || [],
      columns: [
        { key: "name", label: "Name" },
        { key: "code", label: "Emp. code", nowrap: true },
        { key: "designation", label: "Designation", value: (r) => r.designation || ROLE[r.role] || r.role },
        { key: "department", label: "Department", value: (r) => r.department || "—" },
        { key: "present", label: "Present", align: "right" },
        { key: "late", label: "Late", align: "right" },
        { key: "absent", label: "Absent", align: "right" },
        { key: "leave", label: "Leave", align: "right" },
        { key: "halfDay", label: "Half day", align: "right" },
        {
          key: "pct", label: "Attended", align: "right", value: (r) => (r.total ? r.pct : -1),
          render: (r) => (r.total ? <RateBadge value={r.pct} good={90} fair={75} /> : <span className="text-slate-500">Not marked</span>),
        },
      ],
    },
    departments: {
      title: "Department-wise attendance",
      filename: "staff-attendance-departments",
      rows: data?.departments || [],
      columns: [
        { key: "name", label: "Department" },
        { key: "staff", label: "Staff", align: "right" },
        { key: "present", label: "Present", align: "right" },
        { key: "late", label: "Late", align: "right" },
        { key: "absent", label: "Absent", align: "right" },
        { key: "leave", label: "Leave", align: "right" },
        { key: "pct", label: "Attended", align: "right", value: (r) => r.pct, render: (r) => <RateBadge value={r.pct} good={90} fair={75} /> },
      ],
    },
  };

  return (
    <div>
      <ReportHeader title="Staff Attendance" subtitle="Teachers and staff — person by person, department by department" icon={UsersRound} />
      <PeriodPicker period={period} />
      <SchoolWideNote what="Staff attendance is" />
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="green" label="Attended" loading={loading} value={t?.total ? pctText(t.pct) : "—"}
          sub={t?.total ? `${num(t.present + t.late)} of ${num(t.total)} marks` : "Nothing marked in this period"} />
        <GradientStat tone="blue" label="Staff" loading={loading} value={num(t?.staff)}
          sub={`${num(t?.recorded)} with attendance marked`} />
        <GradientStat tone="pink" label="Absent" loading={loading} value={num(t?.absent)}
          sub={`${num(t?.late)} late · ${num(t?.halfDay)} half day`} />
        <GradientStat tone="purple" label="On leave" loading={loading} value={num(t?.leave)}
          sub={`over ${num(t?.markedDays)} marked day${t?.markedDays === 1 ? "" : "s"}`} />
      </StatGrid>

      {notMarked > 0 && t?.total > 0 && (
        <Hint>{num(notMarked)} of {num(t.staff)} staff have no attendance marked in this period — they show as “Not marked” below.</Hint>
      )}

      <BarsPanel className="mb-5" title="Staff attendance trend"
        subtitle={trend.grain === "month" ? "Month by month" : "Day by day"}
        data={trend.data} xKey={trend.xKey} xFmt={trend.xFmt} stacked loading={loading}
        series={[
          { key: "attended", name: "Present", color: BLUE },
          { key: "absent", name: "Absent", color: ORANGE },
          { key: "leave", name: "Leave", color: GREY },
        ]}
        empty="No staff attendance marked in this period." />

      <div className="mb-3">
        <Segmented label="Staff attendance tables" value={tab} onChange={setTab} options={[
          { key: "staff", label: "Staff-wise", count: data?.staff?.length },
          { key: "departments", label: "Department-wise", count: data?.departments?.length },
        ]} />
      </div>
      <DataPanel key={tab} {...tables[tab]} subtitle={sub} printSubtitle={`Staff attendance · ${sub}`} loading={loading} />
    </div>
  );
}
