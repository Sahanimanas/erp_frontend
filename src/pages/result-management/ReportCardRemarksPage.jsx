/**
 * Result Management → Report Card Remarks
 * Per-student free-text remark printed on the report card (per session).
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { MessageSquareText, Save, Search } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetRemarksQuery, useSaveRemarksMutation } from "../../redux/api/resultMgmtApi";
import { SORT_OPTIONS, sessionOptions, classOptions, sectionOptions } from "./_rmShared";

export default function ReportCardRemarksPage() {
  usePageTitle("Report Card Remarks");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [loaded, setLoaded] = useState(false);
  const [remarks, setRemarks] = useState({});

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data, isFetching } = useGetRemarksQuery({ sectionId, academicYearId, term: "", sortBy }, { skip: !loaded || !sectionId });
  const [save, { isLoading: saving }] = useSaveRemarksMutation();

  useEffect(() => { setSectionId(""); setLoaded(false); }, [classId]);
  useEffect(() => { setLoaded(false); }, [sectionId, academicYearId]);
  useEffect(() => {
    const seed = {};
    (data?.students || []).forEach((s) => { seed[s.id] = s.remark || ""; });
    setRemarks(seed);
  }, [data]);

  const submit = async () => {
    const payload = (data?.students || []).map((s) => ({ studentId: s.id, remark: remarks[s.id] || "" }));
    try { const res = await save({ academicYearId, term: "", remarks: payload }).unwrap(); toast.success(res.message || "Saved"); }
    catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Report Card Remarks Update" subtitle="Per-student report card remarks" icon={<MessageSquareText size={18} />} />

      <Card title="Report Card Remarks" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Sort By *" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={SORT_OPTIONS} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button size="sm" icon={<Search size={13} />} disabled={!sectionId} onClick={() => setLoaded(true)}>Get Report Card Remarks</Button>
        </div>
      </Card>

      {!loaded ? (
        <Card noPadding><EmptyState icon="💬" title="Load students" description="Pick a section and click Get Report Card Remarks." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Card>
      ) : (
        <Card noPadding title="Remarks" action={<Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Remarks</Button>}>
          <div className="divide-y divide-slate-100">
            {(data?.students || []).map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2.5">
                <div className="sm:w-64 shrink-0">
                  <p className="font-medium text-slate-700 text-[13px]">{s.name}</p>
                  <p className="text-[11px] text-slate-400">Roll {s.rollNumber} · {s.registrationNo}</p>
                </div>
                <input value={remarks[s.id] ?? ""} onChange={(e) => setRemarks((m) => ({ ...m, [s.id]: e.target.value }))} placeholder="Enter remark…"
                  className="flex-1 px-3 py-1.5 text-[13px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
              </div>
            ))}
            {(data?.students || []).length === 0 && <div className="px-4 py-8 text-center text-slate-400">No students.</div>}
          </div>
          <div className="p-4 flex justify-end border-t border-slate-100">
            <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Remarks</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
