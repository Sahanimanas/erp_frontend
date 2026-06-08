/**
 * _admShared.jsx — reusable Admission-enquiry UI.
 * One <EnquiryBoard> powers the Enquiry, Registration and Admission-List pages,
 * each scoped to a different funnel stage.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Card, DataTable, Pagination, SearchInput, Select, Button, Modal, Input, Badge, PageHeader, SummaryCards,
} from "../../components/ui";
import { Plus, Trash2, GraduationCap, UserCheck, Download } from "lucide-react";
import { exportRows } from "../../utils/exportExcel";
import {
  useGetEnquiriesQuery, useGetEnquiryStatsQuery, useCreateEnquiryMutation,
  useUpdateEnquiryMutation, useDeleteEnquiryMutation, useAdmitEnquiryMutation,
} from "../../redux/api/admissionApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";

export const STATUS_OPTIONS = ["ENQUIRY", "CONTACTED", "REGISTERED", "ADMITTED", "REJECTED"];
const STATUS_VARIANT = {
  ENQUIRY: "info", CONTACTED: "purple", REGISTERED: "warning", ADMITTED: "success", REJECTED: "danger",
};
export function AdmissionStatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "default"} dot>{status}</Badge>;
}

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const CLASS_OPTS = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `${i + 1}`)];

const EMPTY = { studentName: "", parentName: "", phone: "", email: "", classApplying: "", gender: "", dateOfBirth: "", source: "Walk-in", reference: "", followUpDate: "", notes: "" };

export function EnquiryBoard({ title, subtitle, icon, statuses, showStats = false, allowAdd = true }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statuses?.length === 1 ? statuses[0] : "");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);

  // When a page is locked to specific funnel stages, pass the single status to
  // the API; for multi-stage pages we filter client-side after fetch.
  const apiStatus = statuses?.length === 1 ? statuses[0] : (statusFilter || undefined);
  const { data, isFetching } = useGetEnquiriesQuery({ page, limit: 10, ...(search && { search }), ...(apiStatus && { status: apiStatus }) });
  const { data: stats } = useGetEnquiryStatsQuery(undefined, { skip: !showStats });

  const [createEnquiry, { isLoading: creating }] = useCreateEnquiryMutation();
  const [updateEnquiry] = useUpdateEnquiryMutation();
  const [deleteEnquiry] = useDeleteEnquiryMutation();
  const [admitEnquiry, { isLoading: admitting }] = useAdmitEnquiryMutation();
  const { data: classList = [] } = useGetClassesQuery();

  // Admit modal state (admission → student bridge).
  const [admit, setAdmit] = useState(null); // the enquiry being admitted
  const [admitForm, setAdmitForm] = useState({ classId: "", sectionName: "A", rollNumber: "", dateOfBirth: "" });

  let rows = data?.rows ?? [];
  if (statuses?.length > 1) rows = rows.filter((r) => statuses.includes(r.status));
  const total = statuses?.length > 1 ? rows.length : (data?.pagination?.total ?? 0);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.studentName || !form.phone) { toast.error("Student name and phone are required"); return; }
    try {
      await createEnquiry({ ...form, status: statuses?.length === 1 ? statuses[0] : "ENQUIRY" }).unwrap();
      toast.success("Enquiry added");
      setAdding(false); setForm(EMPTY);
    } catch (e) { toast.error(e?.data?.error || "Failed to add enquiry"); }
  };

  const changeStatus = async (row, status) => {
    try {
      await updateEnquiry({ id: row.id, status }).unwrap();
      toast.success(`Moved to ${status}`);
    } catch (e) { toast.error(e?.data?.error || "Failed to update"); }
  };

  const remove = async (row) => {
    try { await deleteEnquiry(row.id).unwrap(); toast.success("Deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const openAdmit = (row) => {
    setAdmit(row);
    setAdmitForm({
      classId: "", sectionName: "A",
      rollNumber: row.registrationNo || "",
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().slice(0, 10) : "",
    });
  };
  const submitAdmit = async () => {
    if (!admitForm.classId || !admitForm.rollNumber) { toast.error("Class and roll number are required"); return; }
    if (!admit.dateOfBirth && !admitForm.dateOfBirth) { toast.error("Date of birth is required"); return; }
    try {
      const res = await admitEnquiry({ id: admit.id, ...admitForm }).unwrap();
      toast.success(`${res.student?.user?.firstName ?? "Applicant"} admitted as a student`);
      setAdmit(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to admit"); }
  };

  const columns = [
    { key: "studentName", label: "Student", render: (v, r) => (
        <div><p className="font-semibold text-slate-800">{v}</p><p className="text-[11px] text-slate-400">{r.parentName || "—"}</p></div>
      ) },
    { key: "phone", label: "Phone", render: (v) => <span className="font-mono text-[11px]">{v}</span> },
    { key: "classApplying", label: "Class", render: (v) => v || "—" },
    { key: "source", label: "Source", render: (v) => v || "—" },
    { key: "registrationNo", label: "Reg. No", render: (v) => v ? <span className="font-mono text-[11px] text-indigo-600">{v}</span> : "—" },
    { key: "status", label: "Status", render: (v) => <AdmissionStatusBadge status={v} /> },
    { key: "createdAt", label: "Date", render: (v) => fmtDate(v) },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <div className="flex items-center gap-1.5 justify-end">
          {r.status !== "ADMITTED" && (
            <button onClick={() => openAdmit(r)} title="Admit as student" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"><UserCheck size={13} /></button>
          )}
          <select
            value={r.status}
            onChange={(e) => changeStatus(r, e.target.value)}
            className="text-[11px] border border-slate-200 rounded-md px-1.5 py-1 bg-white focus:outline-none focus:border-indigo-400"
            title="Change status"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => remove(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} icon={icon ?? <GraduationCap size={18} />}>
        <Button variant="secondary" icon={<Download size={15} />} disabled={!rows.length}
          onClick={() => exportRows("admission-enquiries.csv", rows, [
            { label: "Student", get: (r) => r.studentName }, { label: "Parent", get: (r) => r.parentName },
            { label: "Phone", get: (r) => r.phone }, { label: "Class", get: (r) => r.classApplying },
            { label: "Source", get: (r) => r.source }, { label: "Reg No", get: (r) => r.registrationNo },
            { label: "Status", get: (r) => r.status }, { label: "Created", get: (r) => r.createdAt },
          ])}>Export</Button>
        {allowAdd && <Button icon={<Plus size={15} />} onClick={() => setAdding(true)}>Add Enquiry</Button>}
      </PageHeader>

      {showStats && stats && (
        <SummaryCards cards={[
          { label: "Total", value: stats.total },
          { label: "New Enquiry", value: stats.ENQUIRY, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Registered", value: stats.REGISTERED, bg: "bg-amber-50", text: "text-amber-600" },
          { label: "Admitted", value: stats.ADMITTED, bg: "bg-emerald-50", text: "text-emerald-600" },
        ]} />
      )}

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, phone, reg no…" className="flex-1 min-w-[220px]" />
          {(!statuses || statuses.length !== 1) && (
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[{ value: "", label: "All Stages" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]} className="w-44" />
          )}
        </div>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No enquiries found." />
        {(!statuses || statuses.length === 1) && <Pagination page={page} total={total} pageSize={10} onPageChange={setPage} />}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="New Admission Enquiry" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Student Name *" value={form.studentName} onChange={set("studentName")} />
          <Input label="Parent / Guardian" value={form.parentName} onChange={set("parentName")} />
          <Input label="Phone *" value={form.phone} onChange={set("phone")} />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} />
          <Select label="Class Applying" value={form.classApplying} onChange={set("classApplying")}
            options={[{ value: "", label: "Select…" }, ...CLASS_OPTS.map((c) => ({ value: c, label: c }))]} />
          <Select label="Gender" value={form.gender} onChange={set("gender")}
            options={[{ value: "", label: "Select…" }, ...["Male", "Female", "Other"].map((g) => ({ value: g, label: g }))]} />
          <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          <Select label="Source" value={form.source} onChange={set("source")}
            options={["Walk-in", "Online", "Referral", "Phone"].map((s) => ({ value: s, label: s }))} />
          <Input label="Reference" value={form.reference} onChange={set("reference")} />
          <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={set("followUpDate")} />
          <Input label="Notes" value={form.notes} onChange={set("notes")} className="md:col-span-2" />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          <Button loading={creating} onClick={submit}>Save Enquiry</Button>
        </div>
      </Modal>

      {/* Admit → create a real Student from this enquiry */}
      <Modal open={!!admit} onClose={() => setAdmit(null)} title={`Admit ${admit?.studentName ?? ""}`} size="md">
        <p className="text-[12px] text-slate-500 mb-4">
          This creates a Student record + login. The student then appears in the Student panel, dashboard counts, attendance rosters and class fee structure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Class *" value={admitForm.classId} onChange={(e) => setAdmitForm((f) => ({ ...f, classId: e.target.value }))}
            options={[{ value: "", label: "Select Class" }, ...classList.map((c) => ({ value: c.id, label: c.name }))]} />
          <Input label="Section" value={admitForm.sectionName} onChange={(e) => setAdmitForm((f) => ({ ...f, sectionName: e.target.value }))} />
          <Input label="Roll Number *" value={admitForm.rollNumber} onChange={(e) => setAdmitForm((f) => ({ ...f, rollNumber: e.target.value }))} />
          <Input label="Date of Birth" type="date" value={admitForm.dateOfBirth} onChange={(e) => setAdmitForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={() => setAdmit(null)}>Cancel</Button>
          <Button variant="success" loading={admitting} onClick={submitAdmit}>Admit Student</Button>
        </div>
      </Modal>
    </div>
  );
}
