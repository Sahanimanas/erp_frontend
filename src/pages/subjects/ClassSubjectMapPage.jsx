/**
 * Subject Management → Assign Subjects to Class
 * Pick a class → tick the subjects it studies → Save Subjects applies all
 * changes at once (assigns the newly ticked, removes the unticked).
 * Exam schedules and timetables build their subject lists from this mapping.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Button, EmptyState, Skeleton, Badge } from "../../components/ui";
import { Layers, Save } from "lucide-react";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import {
  useGetSubjectsQuery, useGetClassSubjectMapQuery, useAssignSubjectMutation, useUnassignSubjectMutation,
} from "../../redux/api/academicApi";

const EMPTY_MAP = []; // stable identity for "no data yet"

export default function ClassSubjectMapPage() {
  usePageTitle("Assign Subjects");
  const [classId, setClassId] = useState("");
  const [selected, setSelected] = useState(new Set()); // local, saved on demand
  const [saving, setSaving] = useState(false);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: subjects = [], isLoading: loadingSubjects } = useGetSubjectsQuery();
  // No `= []` default here: a fresh fallback array every render would make
  // savedIds a new Set per render and the seeding effect below would loop,
  // discarding the user's unsaved ticks.
  const { data: mappedData, isLoading: loadingMap, isFetching: fetchingMap } = useGetClassSubjectMapQuery(classId, { skip: !classId });
  const mapped = mappedData ?? EMPTY_MAP;
  const [assign] = useAssignSubjectMutation();
  const [unassign] = useUnassignSubjectMutation();

  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  const sortedClasses = [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));
  const savedIds = useMemo(() => new Set(mapped.map((m) => m.subjectId ?? m.subject?.id)), [mapped]);
  const className = classes.find((c) => c.id === classId)?.name;
  const loading = loadingSubjects || loadingMap;

  // Seed the local selection from what's saved whenever the class (or its
  // saved mapping) changes.
  useEffect(() => { setSelected(new Set(savedIds)); }, [classId, savedIds]);

  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const toAdd = subjects.filter((s) => selected.has(s.id) && !savedIds.has(s.id));
  const toRemove = subjects.filter((s) => !selected.has(s.id) && savedIds.has(s.id));
  const dirty = toAdd.length + toRemove.length > 0;

  const saveAll = async () => {
    if (!dirty) { toast("No changes to save"); return; }
    setSaving(true);
    try {
      const results = await Promise.allSettled([
        ...toAdd.map((s) => assign({ classId, subjectId: s.id }).unwrap()),
        ...toRemove.map((s) => unassign({ classId, subjectId: s.id }).unwrap()),
      ]);
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length) {
        const reason = rejected[0].reason?.data?.error || rejected[0].reason?.error || "request failed";
        toast.error(`${rejected.length} change(s) failed: ${reason}`);
      } else toast.success(`Saved: ${toAdd.length} assigned, ${toRemove.length} removed`);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Assign Subjects to Class" subtitle="Choose which subjects each class studies" icon={<Layers size={18} />}>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!classId || !dirty || fetchingMap} onClick={saveAll}>
          Save Subjects{dirty ? ` (${toAdd.length + toRemove.length})` : ""}
        </Button>
      </PageHeader>

      <Card title="Select Class">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...sortedClasses.map((c) => ({ value: c.id, label: c.name }))]} />
          {classId && !loading && (
            <div className="flex items-end pb-1 gap-2">
              <Badge variant="info">{selected.size} of {subjects.length} selected</Badge>
              {dirty && <Badge variant="warning">Unsaved changes</Badge>}
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
          <>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {subjects.map((s) => {
                const on = selected.has(s.id);
                const changed = on !== savedIds.has(s.id);
                return (
                  <label key={s.id} className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors ${on ? "border-indigo-300 bg-indigo-50/60" : "border-slate-200 hover:bg-slate-50"} ${changed ? "ring-1 ring-amber-300" : ""}`}>
                    <input type="checkbox" checked={on} disabled={saving} onChange={() => toggle(s.id)} className="accent-indigo-600 w-4 h-4" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-slate-800 text-[13px] truncate">{s.name}</span>
                      <span className="block text-[10.5px] text-slate-400 font-mono">{s.code}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="px-5 pb-4 text-[11px] text-slate-400">Tick or untick freely — nothing changes until you click Save Subjects. Highlighted cards are unsaved changes.</p>
          </>
        )}
      </Card>
    </div>
  );
}
