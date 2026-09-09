/**
 * Student → Promote Student
 * Load a class's students, select some, and promote them to the next class.
 *
 * The promotion month matters for money: fees for months BEFORE it stay priced
 * at the old class's rate and are carried forward as a fixed "previous dues"
 * line, while the new class's fee is charged from that month onward. Without it
 * the whole session would be re-priced at the new class's rate.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { ArrowUpCircle } from "lucide-react";
import { useGetStudentsQuery, usePromoteStudentsMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Current year ± a couple, so a session spanning a year boundary is reachable.
const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2];

export default function PromoteStudentPage() {
  usePageTitle("Promote Student");
  const [session, setSession] = useState("");
  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(THIS_YEAR));
  const [selected, setSelected] = useState(new Set());

  // Backend month key format, e.g. "Jun-2026".
  const effectiveMonth = month && year ? `${month}-${year}` : "";

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data, isFetching } = useGetStudentsQuery({ classId: fromClassId, limit: 200 }, { skip: !fromClassId });
  const [promote, { isLoading }] = usePromoteStudentsMutation();

  const rows = data?.data ?? [];
  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const submit = async () => {
    if (!toClassId) { toast.error("Select the target class"); return; }
    if (!effectiveMonth) { toast.error("Select the month the promotion takes effect"); return; }
    if (selected.size === 0) { toast.error("Select at least one student"); return; }
    try {
      const res = await promote({ studentIds: [...selected], toClassId, effectiveMonth }).unwrap();
      const carried = Number(res.carriedForward || 0);
      toast.success(
        carried > 0
          ? `Promoted ${res.promoted} student(s) — ₹${carried.toLocaleString("en-IN")} carried forward`
          : `Promoted ${res.promoted} student(s)`
      );
      setSelected(new Set());
    } catch (e) {
      toast.error(e?.data?.error || "Promotion failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Promote Student" subtitle="Move students to the next class" icon={<ArrowUpCircle size={18} />}>
        <Button loading={isLoading} disabled={!selected.size || !toClassId || !effectiveMonth} onClick={submit}>Promote {selected.size || ""}</Button>
      </PageHeader>

      <Card title="Search Student And Result For Promote">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="From Class" value={fromClassId} onChange={(e) => { setFromClassId(e.target.value); setSelected(new Set()); }}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Promote To Class" value={toClassId} onChange={(e) => setToClassId(e.target.value)}
            options={[{ value: "", label: "Select Target Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Promote From Month" value={month} onChange={(e) => setMonth(e.target.value)}
            options={MONTHS.map((m) => ({ value: m, label: m }))} />
          <Select label="Year" value={year} onChange={(e) => setYear(e.target.value)}
            options={YEARS.map((y) => ({ value: String(y), label: String(y) }))} />
          <p className="text-[11.5px] text-slate-500 self-end pb-2 leading-snug">
            New class fees are charged from <span className="font-semibold text-slate-700">{effectiveMonth || "—"}</span>.
            Anything unpaid before that stays at the old class's rate and is carried forward as previous dues.
          </p>
        </div>
      </Card>

      <Card noPadding>
        {!fromClassId ? (
          <EmptyState icon="⬆️" title="Pick a class" description="Select a class to load its students." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="⬆️" title="No students" description="No students in this class." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-indigo-600" /></th>
                  {["Roll No", "Name", "Current Class", "Gender"].map((h) => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-indigo-600" /></td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600">{r.rollNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.user?.firstName} {r.user?.lastName}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[12px]">{r.section?.class?.name}-{r.section?.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[12px]">{r.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
