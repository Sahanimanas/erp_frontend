/**
 * _cmShared.jsx — shared bits for the Class Management pages: the
 * Session / Class / Class(Year/Semester=Section) filter row and class sorting.
 * Sessions & classes come from the SAME tables as Settings → Classes & Sections.
 */
import toast from "react-hot-toast";
import { Select } from "../../components/ui";
import { useCmAddStandardClassesMutation } from "../../redux/api/classMgmtApi";

/**
 * "Add Nursery – Class 12": confirm, create whichever of Nursery, LKG, UKG and
 * Class 1–12 the school does not have yet, and say what happened.
 * Returns [run(academicYearId?, sessionName?), mutationState].
 */
export function useAddStandardClasses() {
  const [mutate, state] = useCmAddStandardClassesMutation();
  const run = async (academicYearId, sessionName) => {
    const where = sessionName ? `session ${sessionName}` : "the active session";
    if (!confirm(`Add Nursery, LKG, UKG and Class 1 to Class 12 (section A each) to ${where}?\n\nClasses the school already has are left as they are.`)) return;
    try {
      const r = await mutate(academicYearId).unwrap();
      const added = (r.created?.length || 0) + (r.restored?.length || 0);
      const already = r.skipped?.length || 0;
      toast.success(added ? `Added ${added} classes${already ? ` · ${already} were already there` : ""}` : "Nursery – Class 12 are all there already");
    } catch (e) {
      toast.error(e?.data?.error || e?.data?.message || "Failed to add classes");
    }
  };
  return [run, state];
}

// Pre-primary first, then by the number in the name ("Class 5", "5", "5th"),
// then anything else by name.
const ORDER = { play: -4, "pre-nursery": -4, nursery: -3, lkg: -2, ukg: -1 };
const classRank = (name = "") => {
  const n = String(name).trim().toLowerCase();
  if (Object.hasOwn(ORDER, n)) return ORDER[n];
  const m = n.match(/\d+/);
  return m ? Number(m[0]) : Infinity;
};
export const sortClasses = (classes = []) =>
  [...classes].sort((a, b) => (classRank(a.name) - classRank(b.name)) || String(a.name).localeCompare(String(b.name)));

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
