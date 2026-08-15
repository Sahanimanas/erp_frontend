/**
 * Attendance → Manual Attendance
 * Teacher picks Session → Class (+ optional Section) and a date; the roster
 * loads with roll numbers and a simple Present / Absent toggle per student,
 * plus search and mark-all shortcuts.
 */
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, SearchInput, Skeleton, EmptyState, ExportButton, Badge } from "../../components/ui";
import { ClipboardCheck, Save, Check, X } from "lucide-react";
import {
  useGetAcademicYearsQuery, useGetClassesQuery, useGetSectionsQuery,
  useGetStudentsDailyQuery, useMarkStudentsBulkMutation,
} from "../../redux/api/attendanceApi";
import { today } from "./_attShared";

/** Two-state Present / Absent toggle used on the manual marking grid. */
function PresenceToggle({ value, onChange, disabled }) {
  const opts = [
    { key: "PRESENT", label: "Present", icon: <Check size={12} />, on: "bg-emerald-600 border-emerald-600 text-white" },
    { key: "ABSENT", label: "Absent", icon: <X size={12} />, on: "bg-red-600 border-red-600 text-white" },
  ];
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-slate-200">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          disabled={disabled}
          aria-pressed={value === o.key}
          onClick={() => onChange(o.key)}
          className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold border-r last:border-r-0 border-slate-200 transition-colors disabled:opacity-50 ${
            value === o.key ? o.on : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ManualAttendancePage() {
  usePageTitle("Manual Attendance");
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState("");
  const [marks, setMarks] = useState({}); // studentId -> PRESENT | ABSENT | …

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });

  const { data, isFetching } = useGetStudentsDailyQuery(
    { date, classId, sectionId, session },
    { skip: !classId }
  );
  // Stable identity: a `= []` destructuring default would be a fresh array on
  // every render and would re-trigger the seeding effect below in a loop.
  const rows = useMemo(() => data ?? [], [data]);
  const [saveBulk, { isLoading: saving }] = useMarkStudentsBulkMutation();

  // Seed the grid from whatever is already saved for the date; unmarked
  // students default to Present so the teacher only flips the absentees.
  useEffect(() => {
    setMarks(Object.fromEntries(rows.map((r) => [r.studentId, r.status || "PRESENT"])));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name?.toLowerCase().includes(q) || String(r.rollNumber ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, OTHER: 0 };
    rows.forEach((r) => {
      const s = marks[r.studentId];
      if (s === "PRESENT") c.PRESENT++;
      else if (s === "ABSENT") c.ABSENT++;
      else c.OTHER++;
    });
    return c;
  }, [rows, marks]);

  // Bulk actions apply to what the teacher can currently see (i.e. the search
  // result), so "All Present" after a search never touches hidden students.
  const markAll = (status) =>
    setMarks((m) => ({ ...m, ...Object.fromEntries(filtered.map((r) => [r.studentId, status])) }));

  const save = async () => {
    const records = rows
      .filter((r) => marks[r.studentId])
      .map((r) => ({ studentId: r.studentId, status: marks[r.studentId] }));
    if (!records.length) return toast.error("Nothing to save");
    try {
      const res = await saveBulk({ date, records }).unwrap();
      toast.success(`Saved ${res.saved} record(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Failed to save attendance");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manual Attendance"
        subtitle="Pick session, class & date, then mark each student present or absent"
        icon={<ClipboardCheck size={18} />}
      >
        <Button variant="success" icon={<Save size={14} />} loading={saving} disabled={!rows.length} onClick={save}>
          Save Attendance
        </Button>
      </PageHeader>

      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "All Sessions" }, ...years.map((y) => ({ value: y.name, label: y.name }))]} />
          <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}
            options={[{ value: "", label: classId ? "All Sections" : "Pick a class first" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
            <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
      </Card>

      <Card noPadding>
        {!classId ? (
          <EmptyState icon="🧑‍🏫" title="Select a class" description="Choose a session, class and date to load the student roster." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="🎓" title="No students" description="No students found for this session, class and section." />
        ) : (
          <>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll no…"
                className="w-full sm:w-64"
              />
              <div className="flex items-center gap-3 text-[12px]">
                <span className="font-semibold text-slate-600">
                  {search ? `${filtered.length} of ${rows.length}` : `${rows.length}`} students
                </span>
                <span className="text-emerald-600">Present: {counts.PRESENT}</span>
                <span className="text-red-500">Absent: {counts.ABSENT}</span>
                {counts.OTHER > 0 && <span className="text-amber-500">Other: {counts.OTHER}</span>}
              </div>
              <div className="flex gap-2 ml-auto">
                <ExportButton filename="manual-attendance.csv" rows={filtered} columns={[
                  { label: "Roll No", get: (r) => r.rollNumber },
                  { label: "Student", get: (r) => r.name },
                  { label: "Class", get: (r) => [r.className, r.sectionName].filter(Boolean).join("-") },
                  { label: "Status", get: (r) => marks[r.studentId] || "—" },
                ]} />
                <Button size="xs" variant="success" onClick={() => markAll("PRESENT")} disabled={!filtered.length}>
                  Mark All Present
                </Button>
                <Button size="xs" variant="danger" onClick={() => markAll("ABSENT")} disabled={!filtered.length}>
                  Mark All Absent
                </Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon="🔍" title="No match" description={`No student matches “${search}”.`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Roll No", "Student", "Class", "Attendance"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((r) => (
                      <tr key={r.studentId} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600 font-semibold">{r.rollNumber}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-[12px]">
                          {[r.className, r.sectionName].filter(Boolean).join("-") || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <PresenceToggle
                              value={marks[r.studentId]}
                              onChange={(s) => setMarks((m) => ({ ...m, [r.studentId]: s }))}
                            />
                            {/* A status set elsewhere (Late / Leave / Half day) can't be
                                represented by the two toggles — surface it so it is not
                                silently overwritten without the teacher noticing. */}
                            {marks[r.studentId] && !["PRESENT", "ABSENT"].includes(marks[r.studentId]) && (
                              <Badge variant="warning">{marks[r.studentId].replace("_", " ")}</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
