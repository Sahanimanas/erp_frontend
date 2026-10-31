/**
 * Reports home — the period's headline numbers and a door into every report.
 * Each card carries the selected dates, so a report opens on the same period.
 */
import { Link } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, BarChart2, Wallet, UserCheck, FileText, Users,
  CalendarDays, Receipt, Bus, FileBadge, ChevronRight,
} from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card } from "../../components/ui";
import { useGetReportOverviewQuery, useGetFeesDueReportQuery } from "../../redux/api/reportsApi";
import { usePeriod, PeriodBar, ReportError, Note, Kpi, KpiRow, useReportClass, ClassSelect, money, num, pctText } from "./_shared";

const signed = (n) => (n < 0 ? `− ${money(-n)}` : money(n));

export default function ReportsHomePage() {
  usePageTitle("Reports");
  const period = usePeriod("month");
  // With a class picked, every figure here and every report link is that
  // class's. Expense is school-wide (not kept per class), so it steps aside.
  const cls = useReportClass();
  const one = Boolean(cls.classId);
  const { data: o, isFetching, error } = useGetReportOverviewQuery({ from: period.from, to: period.to, classId: cls.classId });
  // Fee dues need the ledger engine for every class, so they load on their own
  // and never hold up the rest of the page.
  const { data: dues, isFetching: duesLoading } = useGetFeesDueReportQuery({ classId: cls.classId });
  const q = `?${period.query}${cls.query}`;
  const qc = cls.classId ? `?classId=${cls.classId}` : "";

  const reports = [
    { to: `/reports/income${q}`, icon: TrendingUp, title: "Income Report", text: "Fee collection + other income — by fee type, class, payment mode and every receipt.", figure: money(o?.income) },
    { to: `/reports/expense${q}`, icon: TrendingDown, title: "Expense Report", text: "Staff salary + office expenses — by head, department and every entry.", figure: one ? "Whole school" : money(o?.expense) },
    { to: `/reports/financial${q}`, icon: BarChart2, title: "Income vs Expense", text: "Month-wise profit / loss and account balances.", figure: one ? money(o?.income) : signed(o?.net ?? 0) },
    { to: `/reports/fees${qc}`, icon: Wallet, title: "Fee Dues & Defaulters", text: "Class-wise pending fees and defaulter list, highest dues first.", figure: dues ? money(dues.totals.overdue) : "…" },
    { to: `/reports/attendance${q}`, icon: UserCheck, title: "Attendance Report", text: "Class-wise %, day-wise trend and students with low attendance.", figure: o?.attendanceMarked ? pctText(o.attendancePct) : "—" },
    { to: `/reports/examination${qc}`, icon: FileText, title: "Exam Result Analysis", text: "Pass %, toppers, subject-wise average, grades and ranks.", figure: o ? `${num(o.exams)} exam${o.exams === 1 ? "" : "s"}` : "" },
    { to: `/reports/students${q}`, icon: Users, title: "Student Strength", text: "Class-wise boys/girls, category, new admissions and leavers.", figure: num(o?.activeStudents) },
  ];

  const more = [
    { to: "/attendance/report", icon: CalendarDays, title: "Attendance Monthly Register" },
    { to: "/payments/fee-details", icon: Receipt, title: "Student Fee Details" },
    { to: "/result-management/view-card", icon: FileBadge, title: "Report Cards" },
    { to: "/transport/student-report", icon: Bus, title: "Student Transport Report" },
  ];

  return (
    <div>
      <PageHeader title="Reports" icon={<LayoutDashboard />}
        subtitle={one ? `${cls.className} — fee, attendance, students and exams of this class` : "All of the school’s numbers in one place"} />
      <PeriodBar period={period}>
        <ClassSelect cls={cls} />
      </PeriodBar>
      <ReportError error={error} />
      {one && (
        <Note>
          Showing <b>{cls.className}</b>. Salary, office expenses and other income are kept for the whole school, not class by
          class, so they are not split here — choose “All classes” for income against expense.
        </Note>
      )}

      {one ? (
        <KpiRow cols={4}>
          <Kpi label={`Fee income · ${cls.className}`} value={money(o?.income)} sub="fee received from this class"
               tone="var(--erp-success)" to={`/reports/income${q}`} loading={isFetching} />
          <Kpi label={dues ? `Fee due till ${dues.asOf.replace("-", " ")}` : "Fee due"} value={money(dues?.totals?.overdue)}
               sub={dues ? `${num(dues.totals.defaulters)} students` : ""} tone="var(--erp-danger)" to={`/reports/fees${qc}`} loading={duesLoading} />
          <Kpi label="Collection rate" value={dues ? pctText(dues.totals.collectionRate) : "—"}
               sub={dues ? `${money(dues.totals.collected)} of ${money(dues.totals.sessionFee)} session fee` : ""} to={`/reports/fees${qc}`} loading={duesLoading} />
          <Kpi label="Concession given" value={money(o?.concession)} sub="Not counted as income" tone="var(--erp-warning)" loading={isFetching} />
        </KpiRow>
      ) : (
        <KpiRow cols={4}>
          <Kpi label="Income" value={money(o?.income)} sub={`Fee ${money(o?.fee)} · Other ${money(o?.otherIncome)}`}
               tone="var(--erp-success)" to={`/reports/income${q}`} loading={isFetching} />
          <Kpi label="Expense" value={money(o?.expense)} sub={`Salary ${money(o?.salary)} · Office ${money(o?.officeExpense)}`}
               tone="var(--erp-danger)" to={`/reports/expense${q}`} loading={isFetching} />
          <Kpi label={o?.net < 0 ? "Net loss" : "Net surplus"} value={signed(o?.net ?? 0)}
               tone={o?.net < 0 ? "var(--erp-danger)" : "var(--erp-success)"} to={`/reports/financial${q}`} loading={isFetching} />
          <Kpi label={dues ? `Fee due till ${dues.asOf.replace("-", " ")}` : "Fee due"} value={money(dues?.totals?.overdue)}
               sub={dues ? `${num(dues.totals.defaulters)} students` : ""} tone="var(--erp-danger)" to="/reports/fees" loading={duesLoading} />
        </KpiRow>
      )}
      <h3 className="text-[13px] font-semibold text-slate-700 mb-2">Where the fees came from</h3>
      <KpiRow cols={4}>
        {(o?.byCategory ?? [
          { key: "school", name: "School fee" }, { key: "transport", name: "Transport" },
          { key: "admission", name: "Admission" }, { key: "books", name: "Books & Uniform" },
        ]).map((c) => (
          <Kpi key={c.key} label={c.name} value={money(c.amount)}
               sub={o?.fee ? `${Math.round(((c.amount || 0) / o.fee) * 100)}% of fee` : ""}
               to={`/reports/income${q}`} loading={isFetching} />
        ))}
      </KpiRow>
      <KpiRow cols={4}>
        <Kpi label="Attendance" value={o?.attendanceMarked ? pctText(o.attendancePct) : "—"}
             sub={o?.attendanceMarked ? `${num(o.attendanceMarked)} marks` : "Not marked in this period"} to={`/reports/attendance${q}`} loading={isFetching} />
        <Kpi label="Current students" value={num(o?.activeStudents)} to={`/reports/students${q}`} loading={isFetching} />
        <Kpi label="New admissions" value={num(o?.newAdmissions)} sub="in this period" to={`/reports/students${q}`} loading={isFetching} />
        {one ? (
          <Kpi label="Exams in this period" value={num(o?.exams)} sub={`scheduled for ${cls.className}`} to={`/reports/examination${qc}`} loading={isFetching} />
        ) : (
          <Kpi label="Concession given" value={money(o?.concession)} sub="Not counted as income" tone="var(--erp-warning)" loading={isFetching} />
        )}
      </KpiRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        {reports.map(({ to, icon: Icon, title, text, figure }) => (
          <Link key={title} to={to}
            className="group flex gap-3 bg-white px-4 py-3.5 hover:shadow-sm transition-shadow"
            style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)", borderLeft: "3px solid var(--erp-primary)" }}>
            <span className="h-9 w-9 shrink-0 flex items-center justify-center rounded" style={{ background: "var(--erp-primary-sf)", color: "var(--erp-primary)" }}>
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-slate-800">{title}</span>
                <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">{figure}</span>
              </span>
              <span className="block text-[12px] text-slate-600 mt-0.5">{text}</span>
            </span>
            <ChevronRight size={16} className="self-center text-slate-400 group-hover:text-[var(--erp-primary)]" />
          </Link>
        ))}
      </div>

      <Card title="More reports" subtitle="Reports available in other modules">
        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {more.map(({ to, icon: Icon, title }) => (
            <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-[var(--erp-primary-sf)]"
                  style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
              <Icon size={15} style={{ color: "var(--erp-primary)" }} /> {title}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
