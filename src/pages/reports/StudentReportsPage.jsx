/**
 * Student Strength — enrolment class by class (boys / girls), category mix,
 * and who joined or left in a period.
 *
 * Replaces the earlier page, which compared gender to "MALE"/"FEMALE" while
 * records store "Male"/"Female", so its boys/girls counts were always 0.
 */
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader } from "../../components/ui";
import { useGetStudentStrengthReportQuery } from "../../redux/api/reportsApi";
import { usePeriod, PeriodBar, ReportError, Kpi, KpiRow, ReportTable, ShareList, useReportClass, ClassSelect, num, fmtDate } from "./_shared";

export default function StudentReportsPage() {
  usePageTitle("Student Strength");
  const navigate = useNavigate();
  const period = usePeriod("session");
  const cls = useReportClass();
  const { data, isFetching, error } = useGetStudentStrengthReportQuery({ from: period.from, to: period.to, classId: cls.classId });

  const t = data?.totals;
  const span = `${cls.className ? `${cls.className} · ` : ""}${fmtDate(period.from)} – ${fmtDate(period.to)}`;
  const share = (n) => (t?.total ? `${Math.round((n / t.total) * 100)}%` : "");

  const listCols = (dateKey, dateLabel) => [
    { key: dateKey, label: dateLabel, value: (r) => fmtDate(r[dateKey]) },
    { key: "name", label: "Student", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
    { key: "admissionNo", label: "Admission No" },
    { key: "className", label: "Class" },
    { key: "gender", label: "Gender" },
    { key: "fatherName", label: "Father" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <div>
      <PageHeader title="Student Strength" icon={<Users />}
        subtitle={cls.className ? `${cls.className} — enrolment, admissions and leavers` : "Enrolment, admissions and leavers"} />
      <PeriodBar period={period} hidePresets={["today"]}>
        <ClassSelect cls={cls} />
      </PeriodBar>
      <ReportError error={error} />

      <KpiRow cols={6}>
        <Kpi label="Current students" value={num(t?.total)} loading={isFetching} />
        <Kpi label="Boys" value={num(t?.boys)} sub={share(t?.boys)} loading={isFetching} />
        <Kpi label="Girls" value={num(t?.girls)} sub={share(t?.girls)} loading={isFetching} />
        <Kpi label="New admissions" value={num(t?.newAdmissions)} sub="in this period" tone="var(--erp-success)" loading={isFetching} />
        <Kpi label="Left" value={num(t?.leftInRange)} sub={`${num(t?.left)} inactive in all`} tone="var(--erp-danger)" loading={isFetching} />
        <Kpi label="Transport / hostel" value={`${num(t?.transport)} / ${num(t?.hostel)}`} loading={isFetching} />
      </KpiRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4">
        <div className="lg:col-span-2">
          <ReportTable
            title="Class-wise strength"
            filename="class-wise-strength"
            printSubtitle={`As of today · new admissions ${span}`}
            loading={isFetching}
            rows={data?.classes ?? []}
            emptyText="No students yet."
            columns={[
              { key: "className", label: "Class", render: (r) => <span className="font-semibold">{r.className}{r.section ? `-${r.section}` : ""}</span>, value: (r) => `${r.className}${r.section ? `-${r.section}` : ""}` },
              { key: "boys", label: "Boys" },
              { key: "girls", label: "Girls" },
              { key: "other", label: "Other" },
              { key: "total", label: "Total", render: (r) => <span className="font-bold">{r.total}</span>, value: (r) => r.total },
              { key: "newAdmissions", label: "New in period" },
            ]}
            footer={{
              items: [
                { label: "Boys", value: num(t?.boys) },
                { label: "Girls", value: num(t?.girls) },
                { label: "Total", value: num(t?.total) },
              ],
              print: `Boys ${num(t?.boys)}  ·  Girls ${num(t?.girls)}  ·  Total ${num(t?.total)}`,
            }}
          />
        </div>
        <ShareList
          title="By category"
          rows={(data?.byCategory ?? []).map((c) => ({ name: c.name, count: c.count }))}
          format={num}
          empty="No students yet."
        />
      </div>

      <ReportTable
        title="New admissions"
        subtitle={span}
        filename={`admissions-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        searchable
        rows={data?.admissions ?? []}
        emptyText="No admissions in this period."
        onRowClick={(r) => navigate(`/student-360?id=${r.studentId}`)}
        columns={listCols("admissionDate", "Admitted on")}
      />

      <ReportTable
        title="Students who left"
        subtitle={span}
        filename={`leavers-${period.from}-to-${period.to}`}
        printSubtitle={span}
        loading={isFetching}
        rows={data?.leavers ?? []}
        emptyText="No student left in this period."
        onRowClick={(r) => navigate(`/student-360?id=${r.studentId}`)}
        columns={listCols("leftDate", "Left on")}
      />
    </div>
  );
}
