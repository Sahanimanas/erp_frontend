/**
 * Subject Management → Assign Subjects to Class
 * Pick a class → tick the subjects it studies. Exam schedules and timetables
 * build their subject lists from this mapping.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, EmptyState, Skeleton, Badge } from "../../components/ui";
import { Layers } from "lucide-react";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import {
  useGetSubjectsQuery, useGetClassSubjectMapQuery, useAssignSubjectMutation, useUnassignSubjectMutation,
} from "../../redux/api/academicApi";

export default function ClassSubjectMapPage() {
  usePageTitle("Assign Subjects");
  const [classId, setClassId] = useState("");
  const [busyId, setBusyId] = useState(null);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: subjects = [], isFetching: loadingSubjects } = useGetSubjectsQuery();
  const { data: mapped = [], isFetching: loadingMap } = useGetClassSubjectMapQuery(classId, { skip: !classId });
  const [assign] = useAssignSubjectMutation();
  const [unassign] = useUnassignSubjectMutation();

  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  const sortedClasses = [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));
  const mappedIds = new Set(mapped.map((m) => m.subjectId ?? m.subject?.id));
  const className = classes.find((c) => c.id === classId)?.name;
  const loading = loadingSubjects || loadingMap;

  const toggle = async (subject) => {
    if (!classId || busyId) return;
    setBusyId(subject.id);
    try {
      if (mappedIds.has(subject.id)) {
        await unassign({ classId, subjectId: subject.id }).unwrap();
        toast.success(`${subject.name} removed from Class ${className}`);
      } else {
        await assign({ classId, subjectId: subject.id }).unwrap();
        toast.success(`${subject.name} assigned to Class ${className}`);
      }
    } catch (e) { toast.error(e?.data?.error || "Failed to update mapping"); }
    finally { setBusyId(null); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Assign Subjects to Class" subtitle="Choose which subjects each class studies" icon={<Layers size={18} />} />

      <Card title="Select Class">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...sortedClasses.map((c) => ({ value: c.id, label: c.name }))]} />
          {classId && !loading && (
            <div className="flex items-end pb-1">
              <Badge variant="info">{mappedIds.size} of {subjects.length} subjects assigned</Badge>
            </div>
          )}
        </div>
      </Card>

      <Card noPadding title={className ? `Class ${className} — Subjects` : "Subjects"}>
        {!classId ? (
          <EmptyState icon="📚" title="Pick a class" description="Select a class to manage its subjects." />
        ) : loading ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : subjects.length === 0 ? (
          <EmptyState icon="📚" title="No subjects yet" description="Create subjects first under Subject Management → Subjects." />
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {subjects.map((s) => {
              const on = mappedIds.has(s.id);
              return (
                <label key={s.id} className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors ${on ? "border-indigo-300 bg-indigo-50/60" : "border-slate-200 hover:bg-slate-50"} ${busyId === s.id ? "opacity-60" : ""}`}>
                  <input type="checkbox" checked={on} disabled={!!busyId} onChange={() => toggle(s)} className="accent-indigo-600 w-4 h-4" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-slate-800 text-[13px] truncate">{s.name}</span>
                    <span className="block text-[10.5px] text-slate-400 font-mono">{s.code}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
