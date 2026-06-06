/**
 * AttendanceReportPage.jsx — View attendance reports and history
 * Features:
 * - Monthly attendance report for class/section
 * - Attendance statistics and charts
 * - Individual student attendance history
 * - Export attendance data
 */
import { useState, useMemo } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, Button, Select, DataTable } from "../../components/ui";
import {
  useGetMonthlyAttendanceReportQuery,
  useGetAttendanceStatisticsQuery,
} from "../../redux/api/attendanceApi";
import {
  getMonthDateRange,
  formatDateForDisplay,
  STATUS_VARIANTS,
  getStatusLabel,
  downloadAttendanceCSV,
  generateAttendanceCSV,
} from "../../utils/attendanceHelpers";
import { BarChart3, Download, Calendar } from "lucide-react";

const CLASS_OPT = [
  { value: "", label: "Select Class" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Class ${i + 1}`,
  })),
];

const SEC_OPT = [
  { value: "", label: "Select Section" },
  ...["A", "B", "C", "D"].map((s) => ({
    value: s,
    label: `Section ${s}`,
  })),
];

const MONTH_OPT = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEAR_OPT = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return { value: String(year), label: String(year) };
});

export default function AttendanceReportPage() {
  usePageTitle("Attendance Reports");

  const [cls, setCls] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Fetch monthly report
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
  } = useGetMonthlyAttendanceReportQuery(
    { sectionId: section, month: parseInt(month), year: parseInt(year) },
    { skip: !cls || !section }
  );

  // Fetch statistics
  const dateRange = useMemo(() => getMonthDateRange(parseInt(month), parseInt(year)), [month, year]);
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useGetAttendanceStatisticsQuery(
    { startDate: dateRange.startDate, endDate: dateRange.endDate },
    { skip: !cls || !section }
  );

  const report = reportData?.data || null;
  const stats = statsData?.data || null;

  // Calculate attendance percentage for each student
  const studentStats = useMemo(() => {
    if (!report?.students) return [];

    return report.students.map((student) => {
      const total = student.attendance.length;
      const present = student.attendance.filter((a) => a.status === "present").length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        ...student,
        totalDays: total,
        presentDays: present,
        percentage,
      };
    });
  }, [report]);

  // Handle CSV export
  const handleExportCSV = () => {
    if (!report?.students) {
      alert("No data to export");
      return;
    }

    const attendanceMap = {};
    report.students.forEach((student) => {
      attendanceMap[student._id] = report.attendanceDates.reduce((acc, date) => {
        const status = student.attendance.find((a) => a.date === date)?.status || "-";
        acc[date] = status;
        return acc;
      }, {});
    });

    const csvContent = generateAttendanceCSV(
      report.students,
      attendanceMap,
      cls,
      section
    );

    const monthName = MONTH_OPT.find((m) => m.value === month)?.label || "Unknown";
    const filename = `Attendance_Class${cls}_Section${section}_${monthName}${year}.csv`;

    downloadAttendanceCSV(csvContent, filename);
  };

  // Table columns for student stats
  const COLUMNS = [
    {
      key: "rollNumber",
      label: "Roll No",
      render: (v) => (
        <span className="font-mono text-[11px] text-indigo-600 font-semibold">
          {v || "N/A"}
        </span>
      ),
    },
    {
      key: "name",
      label: "Student Name",
      render: (v) => (
        <span className="font-semibold text-slate-800">{v}</span>
      ),
    },
    {
      key: "totalDays",
      label: "Total Days",
      render: (v) => (
        <span className="text-sm text-slate-600">{v}</span>
      ),
    },
    {
      key: "presentDays",
      label: "Present",
      render: (v) => (
        <Badge variant="success">{v}</Badge>
      ),
    },
    {
      key: "percentage",
      label: "Attendance %",
      render: (v) => {
        let variant = "success";
        if (v < 75) variant = "danger";
        else if (v < 85) variant = "warning";
        return <Badge variant={variant}>{v}%</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance Reports"
        subtitle="Monthly attendance summary and analytics"
        icon={<BarChart3 size={18} />}
      >
        <Button
          variant="success"
          size="sm"
          icon={<Download size={13} />}
          onClick={handleExportCSV}
          disabled={!report?.students || report.students.length === 0}
        >
          Export CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Class
            </label>
            <Select
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              options={CLASS_OPT}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Section
            </label>
            <Select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              options={SEC_OPT}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Month
            </label>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} options={MONTH_OPT} />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Year
            </label>
            <Select value={year} onChange={(e) => setYear(e.target.value)} options={YEAR_OPT} />
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      {stats && !statsLoading && (
        <Card title="Attendance Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.present || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.late || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.leave || 0}</p>
              <p className="text-xs text-slate-600 mt-1">Leave</p>
            </div>
          </div>
        </Card>
      )}

      {/* Student Attendance Table */}
      {reportLoading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading report...</p>
            </div>
          </div>
        </Card>
      )}

      {!reportLoading && report?.students && report.students.length > 0 && (
        <Card noPadding>
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">
              Student Attendance - {MONTH_OPT.find((m) => m.value === month)?.label} {year}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {report.students.length} students • {report.attendanceDates?.length || 0} working days
            </p>
          </div>
          <DataTable columns={COLUMNS} data={studentStats} />
        </Card>
      )}

      {!reportLoading && (!report?.students || report.students.length === 0) && cls && section && (
        <Card>
          <div className="text-center py-12">
            <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">
              No attendance data available for this selection
            </p>
          </div>
        </Card>
      )}

      {!cls || !section ? (
        <Card>
          <div className="text-center py-12">
            <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">
              Select class and section to view reports
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
