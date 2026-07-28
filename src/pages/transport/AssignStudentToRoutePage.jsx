/**
 * Transport → Assign Student To Route
 *
 * Pick a route → a stop on that route → filter students by session/class →
 * assign one or many. A student rides one route per session, so assigning an
 * already-assigned student MOVES them rather than duplicating.
 *
 * Assigning also sets Student.transportAllotted / transportRoute, which is what
 * the fee ledger reads — so a student assigned here starts being billed the
 * route's monthly fee from Fee Management.
 */
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Badge, SearchInput } from "../../components/ui";
import { UsersRound, Save, Trash2 } from "lucide-react";
import {
  useGetTransportRoutesQuery,
  useGetRouteStoppagesQuery,
  useGetStudentRoutesQuery,
  useAssignStudentsToRouteMutation,
  useUnassignStudentRouteMutation,
} from "../../redux/api/transportApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useCmGetSessionsQuery, useCmGetClassesQuery } from "../../redux/api/classMgmtApi";

/** The student list endpoint has shipped a few different name shapes; take
 *  whichever one this row actually carries. */
const studentName = (s) => {
  if (!s) return "";
  if (s.name) return s.name;
  const flat = [s.firstName, s.lastName].filter(Boolean).join(" ").trim();
  if (flat) return flat;
  return [s.user?.firstName, s.user?.lastName].filter(Boolean).join(" ").trim();
};

export default function AssignStudentToRoutePage() {
  usePageTitle("Assign Student To Route");

  const { data: routes = [] } = useGetTransportRoutesQuery();
  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: classes = [] } = useCmGetClassesQuery();

  const [routeId, setRouteId] = useState("");
  const [stoppageId, setStoppageId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState([]);

  const { data: routeStops = [] } = useGetRouteStoppagesQuery(routeId, { skip: !routeId });
  const { data: assigned = [], isFetching } = useGetStudentRoutesQuery(routeId, { skip: !routeId });

  // Student picker source. The list endpoint is paginated — ask for a big page
  // and filter client-side, which is fine at school scale.
  const { data: studentsRes } = useGetStudentsQuery(
    { page: 1, limit: 500, ...(classId ? { classId } : {}) },
    { skip: !routeId }
  );
  const students = useMemo(() => {
    const raw = studentsRes?.data ?? studentsRes ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [studentsRes]);

  const [assign, { isLoading }] = useAssignStudentsToRouteMutation();
  const [unassign] = useUnassignStudentRouteMutation();

  const alreadyOnRoute = new Set(assigned.map((a) => a.studentId));
  const filteredStudents = students.filter((s) => {
    if (alreadyOnRoute.has(s.id)) return false;
    if (!search.trim()) return true;
    const hay = `${studentName(s)} ${s.registrationNo || ""} ${s.admissionNumber || ""}`.toLowerCase();
    return hay.includes(search.trim().toLowerCase());
  });

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!routeId) return toast.error("Select a route");
    if (!stoppageId) return toast.error("Select a stoppage");
    if (!picked.length) return toast.error("Select at least one student");
    try {
      const res = await assign({ routeId, stoppageId, academicYearId: academicYearId || undefined, studentIds: picked }).unwrap();
      toast.success(`${res?.assigned ?? picked.length} student(s) assigned`);
      setPicked([]);
      setSearch("");
    } catch (e) { toast.error(e?.data?.error || "Failed to assign students"); }
  };

  const del = async (row) => {
    if (!window.confirm(`Remove ${row.studentName} from this route? They will stop being billed the transport fee.`)) return;
    try {
      await unassign(row.id).unwrap();
      toast.success("Student unassigned");
    } catch (e) { toast.error(e?.data?.error || "Failed to unassign student"); }
  };

  const columns = [
    { key: "sl", label: "Sl. No" },
    { key: "stoppageName", label: "Stoppage Name" },
    { key: "studentName", label: "Student Name", render: (v, r) => (
        <span className="font-semibold text-slate-800">{v || "—"}{r.registrationNo ? ` [${r.registrationNo}]` : ""}</span>
      ) },
    { key: "className", label: "Class", render: (v) => v || "—" },
    { key: "updatedAt", label: "Last Modified", render: (v) => (v ? new Date(v).toLocaleString() : "—") },
    {
      key: "actions", label: "Action", sortable: false, render: (_v, r) => (
        <Button size="xs" variant="danger" icon={<Trash2 size={12} />} onClick={() => del(r)}>Remove</Button>
      ),
    },
  ];
  const tableRows = assigned.map((r, i) => ({ ...r, sl: i + 1 }));

  return (
    <div className="space-y-4">
      <PageHeader title="Assign Student To Route" subtitle="Transport" icon={<UsersRound size={18} />} />

      <Card title="Assign Student To Route">
        <div className="p-5">
          <Select label="Route Name *" value={routeId}
            onChange={(e) => { setRouteId(e.target.value); setStoppageId(""); setPicked([]); }}
            options={[{ value: "", label: "Select…" }, ...routes.map((r) => ({ value: r.id, label: r.name }))]} />
        </div>
      </Card>

      {routeId && (
        <>
          <Card title="Add Student To Route">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Select Stoppage *" value={stoppageId} onChange={(e) => setStoppageId(e.target.value)}
                  options={[
                    { value: "", label: routeStops.length ? "Select…" : "No stoppages on this route yet" },
                    ...routeStops.map((rs) => ({
                      value: rs.stoppageId,
                      label: `${rs.stoppage?.name || "—"}${rs.time ? ` (${rs.time})` : ""}`,
                    })),
                  ]} />
                <Select label="Select Session" value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}
                  options={[{ value: "", label: "All sessions" }, ...sessions.map((s) => ({ value: s.id, label: s.name || s.year || s.id }))]} />
                <Select label="Select Class" value={classId} onChange={(e) => { setClassId(e.target.value); setPicked([]); }}
                  options={[{ value: "", label: "All classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Student</label>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students by name or registration no…" />
                <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {filteredStudents.length === 0 && (
                    <p className="p-4 text-center text-[13px] text-slate-400">
                      {students.length === 0 ? "No students found." : "Every matching student is already on this route."}
                    </p>
                  )}
                  {filteredStudents.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 cursor-pointer">
                      <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)}
                        className="w-4 h-4 rounded accent-indigo-600" />
                      <span className="text-[13px] text-slate-700">
                        {studentName(s) || "—"}
                        {s.registrationNo ? <span className="text-slate-400"> [{s.registrationNo}]</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
                {picked.length > 0 && (
                  <p className="mt-2 text-[12px] text-slate-500">
                    <Badge variant="indigo">{picked.length}</Badge> student(s) selected
                  </p>
                )}
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <Button icon={<Save size={14} />} loading={isLoading} onClick={submit}>Submit</Button>
            </div>
          </Card>

          <Card noPadding title="Student Route Mapping List">
            <DataTable columns={columns} data={tableRows} loading={isFetching} emptyText="No students on this route yet." />
          </Card>
        </>
      )}
    </div>
  );
}
