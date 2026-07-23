/**
 * _rmShared.jsx — shared selector option builders + constants for the Result
 * Management pages. Sessions/classes/sections/exams/subjects all come from the
 * same tables as Class & Exam Management, so results stay in sync.
 */
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
