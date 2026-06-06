/**
 * attendanceHelpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility functions for attendance operations
 */

/**
 * Format date for API calls (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string} formatted date
 */
export function formatDateForAPI(date) {
  if (typeof date === "string") return date;
  return date.toISOString().split("T")[0];
}

/**
 * Format date for display (Long format)
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} formatted display string
 */
export function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Get today's date in API format
 * @returns {string} YYYY-MM-DD
 */
export function getTodayAPIFormat() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Status badge variant mapper
 * @param {string} status - attendance status
 * @returns {string} badge variant
 */
export const STATUS_VARIANTS = {
  present: "success",
  absent: "danger",
  late: "warning",
  leave: "info",
};

/**
 * Get status display name
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  const labels = {
    present: "Present",
    absent: "Absent",
    late: "Late",
    leave: "Leave",
  };
  return labels[status] || status;
}

/**
 * Calculate attendance percentage
 * @param {number} presentDays
 * @param {number} totalDays
 * @returns {number} percentage
 */
export function calculateAttendancePercentage(presentDays, totalDays) {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100);
}

/**
 * Get attendance summary
 * @param {Array} attendanceRecords
 * @returns {Object} summary with counts
 */
export function getAttendanceSummary(attendanceRecords) {
  return attendanceRecords.reduce(
    (summary, record) => ({
      ...summary,
      [record.status]: (summary[record.status] || 0) + 1,
    }),
    { present: 0, absent: 0, late: 0, leave: 0 }
  );
}

/**
 * Filter students by class and section
 * @param {Array} students
 * @param {string} classId
 * @param {string} sectionId
 * @returns {Array} filtered students
 */
export function filterStudentsByClassSection(students, classId, sectionId) {
  return students.filter(
    (student) =>
      student.classId === classId && student.sectionId === sectionId
  );
}

/**
 * Prepare attendance payload for single student
 * @param {string} studentId
 * @param {string} date - YYYY-MM-DD
 * @param {string} status - present|absent|late|leave
 * @returns {Object} API payload
 */
export function prepareAttendancePayload(studentId, date, status) {
  return {
    studentId,
    date,
    status,
  };
}

/**
 * Prepare bulk attendance payload
 * @param {Array} students
 * @param {string} date - YYYY-MM-DD
 * @param {Object} attendanceMap - { studentId: status }
 * @returns {Array} array of payloads
 */
export function prepareBulkAttendancePayload(students, date, attendanceMap) {
  return students.map((student) =>
    prepareAttendancePayload(student._id, date, attendanceMap[student._id])
  );
}

/**
 * Get date range for month
 * @param {number} month - 1-12
 * @param {number} year - 2024, 2025, etc
 * @returns {Object} { startDate, endDate }
 */
export function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

/**
 * Parse API error message
 * @param {Object} error
 * @returns {string} user-friendly error message
 */
export function parseAttendanceError(error) {
  if (error?.data?.message) {
    return error.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An error occurred while processing attendance";
}

/**
 * Get date range for last 7 days
 * @returns {Object} { startDate, endDate }
 */
export function getLast7DaysRange() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

/**
 * Get date range for current month
 * @returns {Object} { startDate, endDate }
 */
export function getCurrentMonthRange() {
  const now = new Date();
  return getMonthDateRange(now.getMonth() + 1, now.getFullYear());
}

/**
 * Check if attendance can be modified (not past deadline)
 * @param {string} date - YYYY-MM-DD
 * @param {number} deadlineDays - days after which attendance cannot be modified
 * @returns {boolean}
 */
export function canModifyAttendance(date, deadlineDays = 7) {
  const attendanceDate = new Date(date + "T00:00:00");
  const today = new Date();
  const daysDiff = Math.floor(
    (today - attendanceDate) / (1000 * 60 * 60 * 24)
  );
  return daysDiff <= deadlineDays;
}

/**
 * Group attendance by date
 * @param {Array} attendanceRecords
 * @returns {Object} records grouped by date
 */
export function groupAttendanceByDate(attendanceRecords) {
  return attendanceRecords.reduce((grouped, record) => {
    const date = record.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
    return grouped;
  }, {});
}

/**
 * Generate attendance report CSV content
 * @param {Array} students
 * @param {Object} attendanceMap - { studentId: { date: status } }
 * @param {string} classId
 * @param {string} sectionId
 * @returns {string} CSV content
 */
export function generateAttendanceCSV(students, attendanceMap, classId, sectionId) {
  const headers = [
    "Roll Number",
    "Student Name",
    "Class",
    "Section",
    ...Object.keys(attendanceMap[students[0]?._id] || {}),
  ];

  const rows = students.map((student) => [
    student.rollNumber || "N/A",
    student.name,
    classId,
    sectionId,
    ...Object.values(attendanceMap[student._id] || {}),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export attendance data as CSV file
 * @param {string} csvContent
 * @param {string} filename
 */
export function downloadAttendanceCSV(csvContent, filename = "attendance.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Validate attendance status
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
  return ["present", "absent", "late", "leave"].includes(status);
}

/**
 * Validate date format
 * @param {string} date - YYYY-MM-DD
 * @returns {boolean}
 */
export function isValidDateFormat(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}
