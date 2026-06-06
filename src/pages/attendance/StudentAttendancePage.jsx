/**
 * StudentAttendancePage.jsx — Mark daily student attendance with API integration
 * Features:
 * - Fetch student list filtered by class and section
 * - Date picker for attendance date selection
 * - Mark attendance with 4 status options: Present, Absent, Late, Leave
 * - Bulk mark all students with same status
 * - Save attendance records via API
 * - Real-time count summary
 */
import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, Button, Select, DataTable } from "../../components/ui";
import {
  useGetStudentsQuery,
  useGetStudentAttendanceQuery,
} from "../../redux/api/studentsApi";
import { useMarkStudentAttendanceMutation } from "../../redux/api/attendanceApi";
import { UserCheck, CheckCircle, XCircle, Clock, Save, AlertCircle } from "lucide-react";

const STATUS_OPT = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "leave", label: "Leave" },
];

const STATUS_BADGE = {
  present: "success",
  absent: "danger",
  late: "warning",
  leave: "info",
};

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

export default function StudentAttendancePage() {
  usePageTitle("Attendance");

  // State management
  const [cls, setCls] = useState("3");
  const [section, setSection] = useState("A");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({});
  const [savingStudents, setSavingStudents] = useState(new Set());
  const [savedCount, setSavedCount] = useState(0);

  // API hooks
  const [markAttendance] = useMarkStudentAttendanceMutation();
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetStudentsQuery(
    { classId: cls, sectionId: section },
    { skip: !cls || !section }
  );

  const students = useMemo(
    () => studentsData?.data || [],
    [studentsData]
  );

  // Format date for display
  const dateObj = new Date(selectedDate);
  const displayDate = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Initialize attendance state when students load
  useMemo(() => {
    if (students.length > 0 && Object.keys(attendance).length === 0) {
      const initialAttendance = students.reduce((acc, student) => {
        acc[student._id] = "present";
        return acc;
      }, {});
      setAttendance(initialAttendance);
    }
  }, [students, attendance]);

  // Calculate counts
  const counts = useMemo(() => {
    return Object.values(attendance).reduce(
      (acc, status) => ({
        ...acc,
        [status]: (acc[status] || 0) + 1,
      }),
      {}
    );
  }, [attendance]);

  // Update single student attendance
  const updateAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all students with same status
  const markAll = (status) => {
    const newAttendance = students.reduce((acc, student) => {
      acc[student._id] = status;
      return acc;
    }, {});
    setAttendance(newAttendance);
  };

  // Save attendance for individual student
  const saveStudentAttendance = async (studentId) => {
    try {
      setSavingStudents((prev) => new Set([...prev, studentId]));

      await markAttendance({
        studentId,
        date: selectedDate,
        status: attendance[studentId],
      }).unwrap();

      setSavedCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert(`Error saving attendance: ${error?.data?.message || error.message}`);
    } finally {
      setSavingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Save all attendance records
  const saveAllAttendance = async () => {
    if (students.length === 0) {
      alert("No students to mark attendance for");
      return;
    }

    const confirmSave = window.confirm(
      `Save attendance for ${students.length} students on ${displayDate}?`
    );
    if (!confirmSave) return;

    setSavingStudents(new Set(students.map((s) => s._id)));

    let successCount = 0;
    let failureCount = 0;

    // Save all attendances
    for (const student of students) {
      try {
        await markAttendance({
          studentId: student._id,
          date: selectedDate,
          status: attendance[student._id],
        }).unwrap();
        successCount++;
      } catch (error) {
        console.error(`Failed to save for student ${student._id}:`, error);
        failureCount++;
      }
    }

    setSavingStudents(new Set());
    setSavedCount(successCount);

    const message =
      failureCount === 0
        ? `Successfully saved attendance for all ${successCount} students`
        : `Saved ${successCount} records. Failed: ${failureCount}`;
    alert(message);
  };

  // Table columns configuration
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
      label: "Student",
      render: (v) => (
        <span className="font-semibold text-slate-800">{v}</span>
      ),
    },
    {
      key: "_id",
      label: "Status",
      sortable: false,
      render: (studentId, row) => (
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPT.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateAttendance(studentId, opt.value)}
              disabled={savingStudents.has(studentId)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                attendance[studentId] === opt.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "_id",
      label: "Mark",
      sortable: false,
      render: (studentId) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_BADGE[attendance[studentId]]}>
            {attendance[studentId]}
          </Badge>
          {savingStudents.has(studentId) && (
            <span className="text-[10px] text-indigo-600 font-semibold">
              Saving...
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Attendance"
        subtitle={displayDate}
        icon={<UserCheck size={18} />}
      >
        <Button
          variant="success"
          size="sm"
          icon={<Save size={13} />}
          loading={savingStudents.size > 0}
          onClick={saveAllAttendance}
          disabled={students.length === 0}
        >
          Save Attendance
        </Button>
      </PageHeader>

      {/* Filters and Controls */}
      <Card noPadding>
        <div className="flex gap-3 flex-wrap p-4 border-b border-slate-100 items-end">
          {/* Class Select */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Class
            </label>
            <Select
              value={cls}
              onChange={(e) => {
                setCls(e.target.value);
                setAttendance({});
                setSavedCount(0);
              }}
              options={CLASS_OPT}
              className="w-full"
            />
          </div>

          {/* Section Select */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Section
            </label>
            <Select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setAttendance({});
                setSavedCount(0);
              }}
              options={SEC_OPT}
              className="w-full"
            />
          </div>

          {/* Date Picker */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAttendance({});
                setSavedCount(0);
              }}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="success"
              onClick={() => markAll("present")}
              disabled={students.length === 0}
            >
              All Present
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => markAll("absent")}
              disabled={students.length === 0}
            >
              All Absent
            </Button>
          </div>
        </div>

        {/* Status Counts */}
        {students.length > 0 && (
          <div className="flex gap-4 p-4 border-b border-slate-100 bg-slate-50 flex-wrap">
            {STATUS_OPT.map((status) => (
              <div
                key={status.value}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200"
              >
                <Badge variant={STATUS_BADGE[status.value]}>
                  {counts[status.value] || 0}
                </Badge>
                <span className="text-sm font-medium text-slate-600">
                  {status.label}
                </span>
              </div>
            ))}
            {savedCount > 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {savedCount} Saved
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {studentsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading students...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {studentsError && (
          <div className="m-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Failed to load students
              </p>
              <p className="text-xs text-red-600 mt-1">
                {studentsError?.data?.message || "Please try again"}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!studentsLoading &&
          !studentsError &&
          students.length === 0 &&
          cls &&
          section && (
            <div className="text-center py-12">
              <UserCheck size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500">
                No students found for Class {cls} - Section {section}
              </p>
            </div>
          )}

        {/* Initial State */}
        {!studentsLoading &&
          !cls &&
          !studentsError && (
            <div className="text-center py-12">
              <UserCheck size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500">
                Select a class and section to view students
              </p>
            </div>
          )}

        {/* Data Table */}
        {!studentsLoading && students.length > 0 && (
          <DataTable columns={COLUMNS} data={students} />
        )}
      </Card>
    </div>
  );
}
