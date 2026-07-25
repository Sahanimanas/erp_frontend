/**
 * _rmShared.jsx — shared selector option builders + constants for the Result
 * Management pages. Sessions/classes/sections/exams/subjects all come from the
 * same tables as Class & Exam Management, so results stay in sync.
 */
import { Select, SearchInput } from "../../components/ui";

export const SORT_OPTIONS = [
  { value: "Name", label: "Name" },
  { value: "RollNo", label: "RollNo" },
];

// Terms for non-subject results (co-curricular grading happens per term).
export const TERMS = ["Term 1", "Term 2", "Term 3", "Annual"].map((t) => ({ value: t, label: t }));

const ORDER = { NURSERY: -3, LKG: -2, UKG: -1, Nursery: -3 };
export const sortClasses = (classes = []) =>
  [...classes].sort((a, b) => (ORDER[a.name] ?? Number(a.name) ?? 0) - (ORDER[b.name] ?? Number(b.name) ?? 0));

export const opt = (placeholder, items, id = "id", label = "name") =>
  [{ value: "", label: placeholder }, ...items.map((x) => ({ value: x[id], label: x[label] }))];

export const sessionOptions = (s) => opt("Select...", s);
export const classOptions = (c) => opt("Select...", sortClasses(c));
export const sectionOptions = (s) => opt("Select...", s);
export const examOptions = (e) => opt("Select...", e);
export const subjectOptions = (s) => opt("Select...", s);

// Marks-cell helper: renders "Absent" for null, or the number.
export const showMark = (v) => (v === null || v === undefined || v === "" ? "Absent" : v);

// ─── Student search bar (shared across every Result Management list page) ─────
// A free-text search + a student dropdown, both populated from the students of
// the currently selected filters. Its state is `{ q, id }` — pass it to
// `filterStudents` (or `studentMatches`) to narrow the rendered rows.
export const emptyStudentFilter = { q: "", id: "" };

// Does a student match a free-text query (name / roll / reg no / father)?
export const matchStudent = (s = {}, q = "") => {
  const t = String(q || "").trim().toLowerCase();
  if (!t) return true;
  return [s.name, s.rollNumber, s.registrationNo, s.fatherName]
    .some((v) => String(v ?? "").toLowerCase().includes(t));
};

// Does a student pass the combined { q, id } search-bar state?
export const studentMatches = ({ q = "", id = "" } = {}, s = {}) =>
  (!id || s.id === id) && matchStudent(s, q);

// Apply the search-bar state to a list of students.
export const filterStudents = (students = [], value = emptyStudentFilter) =>
  students.filter((s) => studentMatches(value, s));

/**
 * StudentSearchBar — search input + student dropdown for the Result Management
 * pages. Controlled via `value` ({ q, id }) / `onChange`. The dropdown lists the
 * students matching the current filters, narrowing as you type.
 */
export function StudentSearchBar({ students = [], value = emptyStudentFilter, onChange, placeholder = "Search student by name / roll / reg no…" }) {
  const matches = students.filter((s) => matchStudent(s, value.q));
  const options = [
    { value: "", label: `All students (${matches.length})` },
    ...matches.map((s) => ({ value: s.id, label: `${s.name}${s.rollNumber ? ` — Roll ${s.rollNumber}` : ""}` })),
  ];
  return (
    <div className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/40">
      <SearchInput className="flex-1" value={value.q} placeholder={placeholder}
        onChange={(e) => onChange({ q: e.target.value, id: "" })} />
      <div className="sm:w-72">
        <Select value={value.id} options={options}
          onChange={(e) => onChange({ ...value, id: e.target.value })} />
      </div>
    </div>
  );
}
