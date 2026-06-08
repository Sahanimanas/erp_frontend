/**
 * Student → Bulk Update
 * Load a class's students into an editable grid and save all changes at once.
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { PencilLine, Save } from "lucide-react";
import { useGetStudentsQuery, useBulkUpdateStudentsMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const GENDERS = ["Male", "Female", "Other"];

export default function StudentBulkUpdatePage() {
  usePageTitle("Student Bulk Update");
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [edits, setEdits] = useState({}); // studentId -> patch

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data, isFetching } = useGetStudentsQuery({ classId, limit: 200 }, { skip: !classId });
  const [bulkUpdate, { isLoading }] = useBulkUpdateStudentsMutation();

  const rows = data?.data ?? [];

  useEffect(() => {
    const seed = {};
    rows.forEach((r) => {
      seed[r.id] = {
        firstName: r.user?.firstName ?? "", lastName: r.user?.lastName ?? "",
        phone: r.user?.phone ?? "", rollNumber: r.rollNumber ?? "",
        gender: r.gender ?? "", dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString().slice(0, 10) : "",
        admissionNumber: r.admissionNumber ?? "",
      };
    });
    setEdits(seed);
  }, [rows]);

  const set = (id, k, v) => setEdits((e) => ({ ...e, [id]: { ...e[id], [k]: v } }));

  const save = async () => {
    const updates = rows.map((r) => ({ studentId: r.id, ...edits[r.id] }));
    try {
      const res = await bulkUpdate(updates).unwrap();
      toast.success(`Updated ${res.updated} student(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Update failed");
    }
  };

  const cell = "px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 w-full";

  return (
    <div className="space-y-4">
      <PageHeader title="Update Student Bulk Data" subtitle="Edit many students at once" icon={<PencilLine size={18} />}>
        <Button variant="success" icon={<Save size={14} />} loading={isLoading} disabled={!rows.length} onClick={save}>Update</Button>
      </PageHeader>

      <Card title="Student Bulk Update">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>

      <Card noPadding>
        {!classId ? (
          <EmptyState icon="✏️" title="Pick a class" description="Select a class to edit its students." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="✏️" title="No students" description="No students in this class." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["First Name", "Last Name", "Birth Date", "Gender", "Phone", "Roll No", "Admission No"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => {
                  const e = edits[r.id] || {};
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2"><input value={e.firstName ?? ""} onChange={(ev) => set(r.id, "firstName", ev.target.value)} className={cell} /></td>
                      <td className="px-3 py-2"><input value={e.lastName ?? ""} onChange={(ev) => set(r.id, "lastName", ev.target.value)} className={cell} /></td>
                      <td className="px-3 py-2"><input type="date" value={e.dateOfBirth ?? ""} onChange={(ev) => set(r.id, "dateOfBirth", ev.target.value)} className={cell} /></td>
                      <td className="px-3 py-2">
                        <select value={e.gender ?? ""} onChange={(ev) => set(r.id, "gender", ev.target.value)} className={cell}>
                          <option value="">—</option>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input value={e.phone ?? ""} onChange={(ev) => set(r.id, "phone", ev.target.value)} className={cell} /></td>
                      <td className="px-3 py-2"><input value={e.rollNumber ?? ""} onChange={(ev) => set(r.id, "rollNumber", ev.target.value)} className={cell} /></td>
                      <td className="px-3 py-2"><input value={e.admissionNumber ?? ""} onChange={(ev) => set(r.id, "admissionNumber", ev.target.value)} className={cell} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
