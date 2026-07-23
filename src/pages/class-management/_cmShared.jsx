/**
 * _cmShared.jsx — shared bits for the Class Management pages: the
 * Session / Class / Class(Year/Semester=Section) filter row and class sorting.
 * Sessions & classes come from the SAME tables as Settings → Classes & Sections.
 */
import { Select } from "../../components/ui";

const ORDER = { NURSERY: -3, LKG: -2, UKG: -1, Nursery: -3 };
export const sortClasses = (classes = []) =>
  [...classes].sort((a, b) => (ORDER[a.name] ?? Number(a.name) ?? 0) - (ORDER[b.name] ?? Number(b.name) ?? 0));

/** Session · Class · Class (Year/Semester) filter row. Sections stand in for the
 *  reference's "Year/Semester". Hide any field with the show flags. */
export function CmFilters({
  sessions = [], classes = [], sections = [],
  academicYearId, classId, sectionId,
  onYear, onClass, onSection,
  showSection = true,
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${showSection ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-4 p-5`}>
      <Select label="Session :" value={academicYearId} onChange={(e) => onYear?.(e.target.value)}
        options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
      <Select label="Class :" value={classId} onChange={(e) => onClass?.(e.target.value)}
        options={[{ value: "", label: "Select..." }, ...sortClasses(classes).map((c) => ({ value: c.id, label: c.name }))]} />
      {showSection && (
        <Select label="Class (Year/Semester) :" value={sectionId} onChange={(e) => onSection?.(e.target.value)} disabled={!classId}
          options={[{ value: "", label: "Select..." }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
      )}
    </div>
  );
}
