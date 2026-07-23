/**
 * Class Management → Employee Subject Mapping
 * Assign a class's subjects / non-subjects to a teacher. Uses the SAME class
 * subjects (Add Subject) and teachers (Employee module).
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { Users, Save, ListChecks } from "lucide-react";
import { useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetTimetableTeachersQuery } from "../../redux/api/timetableApi";
import { useCmGetSessionsQuery, useCmGetClassesQuery, useCmGetEmployeeMappingQuery, useCmSaveEmployeeMappingMutation } from "../../redux/api/classMgmtApi";
import { sortClasses } from "./_cmShared";

export default function EmployeeSubjectMappingPage() {
  usePageTitle("Employee Subject Mapping");
  const [employeeId, setEmployee] = useState("");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [subjSel, setSubjSel] = useState({});
  const [nonSel, setNonSel] = useState({});

  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: classes = [] } = useCmGetClassesQuery(academicYearId || undefined);
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: teachers = [] } = useGetTimetableTeachersQuery();
  const { data: mapping, isFetching } = useCmGetEmployeeMappingQuery({ employeeId, classId }, { skip: !loaded || !employeeId || !classId });
  const [save, { isLoading: saving }] = useCmSaveEmployeeMappingMutation();

  useEffect(() => {
    if (!mapping) return;
    setSubjSel(Object.fromEntries(mapping.subjects.map((s) => [s.id, s.checked])));
    setNonSel(Object.fromEntries(mapping.nonSubjects.map((n) => [n.id, n.checked])));
  }, [mapping]);

  // Any filter change invalidates the loaded panels.
  useEffect(() => { setLoaded(false); }, [employeeId, academicYearId, classId]);

  const load = () => {
    if (!employeeId || !classId) return toast.error("Select employee and class");
    setLoaded(true);
  };

  const subjects = mapping?.subjects || [];
  const nonSubjects = mapping?.nonSubjects || [];
  const allSubjChecked = subjects.length > 0 && subjects.every((s) => subjSel[s.id]);
  const toggleAllSubj = (v) => setSubjSel(Object.fromEntries(subjects.map((s) => [s.id, v])));

  const submit = async () => {
    try {
      await save({
        employeeId, classId, academicYearId: academicYearId || undefined,
        subjectIds: Object.keys(subjSel).filter((k) => subjSel[k]),
        nonSubjectIds: Object.keys(nonSel).filter((k) => nonSel[k]),
      }).unwrap();
      toast.success("Mapping saved");
    } catch (e) { toast.error(e?.data?.error || "Failed to save mapping"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Employee Subject Mapping" subtitle="Assign subjects / non-subjects to a teacher" icon={<Users size={18} />}>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!loaded} onClick={submit}>Save Mapping</Button>
      </PageHeader>

      <Card title="Assign Subject / Non-Subject to Employee" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Employee *" value={employeeId} onChange={(e) => setEmployee(e.target.value)}
            options={[{ value: "", label: "Select..." }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
          <Select label="Session *" value={academicYearId} onChange={(e) => { setYear(e.target.value); setClassId(""); }}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Class *" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
            options={[{ value: "", label: "Select..." }, ...sortClasses(classes).map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Class (Year/Semester)" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
            options={[{ value: "", label: "Select..." }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button size="sm" icon={<ListChecks size={13} />} onClick={load}>Load Subject</Button>
        </div>
      </Card>

      {!loaded ? (
        <Card noPadding><EmptyState icon="🧑‍🏫" title="Load subjects" description="Pick an employee + class, then click Load Subject." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Subjects">
            <div className="p-5 space-y-2">
              {subjects.length === 0 ? <p className="text-sm text-slate-400">No subjects found for this class.</p> : (
                <>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 select-none pb-1 border-b border-slate-100">
                    <input type="checkbox" checked={allSubjChecked} onChange={(e) => toggleAllSubj(e.target.checked)} className="w-4 h-4 accent-indigo-600" /> Select All
                  </label>
                  {subjects.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-[13px] text-slate-600 select-none">
                      <input type="checkbox" checked={!!subjSel[s.id]} onChange={(e) => setSubjSel((m) => ({ ...m, [s.id]: e.target.checked }))} className="w-4 h-4 accent-indigo-600" /> {s.name}
                    </label>
                  ))}
                </>
              )}
            </div>
          </Card>
          <Card title="Non-Subjects">
            <div className="p-5 space-y-2">
              {nonSubjects.length === 0 ? <p className="text-sm text-slate-400">No non-subjects found for this class.</p> : (
                nonSubjects.map((n) => (
                  <label key={n.id} className="flex items-center gap-2 text-[13px] text-slate-600 select-none">
                    <input type="checkbox" checked={!!nonSel[n.id]} onChange={(e) => setNonSel((m) => ({ ...m, [n.id]: e.target.checked }))} className="w-4 h-4 accent-indigo-600" /> {n.name}
                  </label>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
