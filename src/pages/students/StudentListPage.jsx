/**
 * StudentListPage.jsx — Full-featured student management page
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, DataTable, Badge, Button,
  SearchInput, Select, Pagination, Modal,
  Input, Textarea, Avatar, DateRangeFilter, ExportButton,
} from "../../components/ui";
import { Users, Plus, Eye, Edit2, Trash2, Filter, Upload, UserX, UserCheck } from "lucide-react";
import { filterByDateRange } from "../../utils/exportExcel";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import {
  useGetStudentsQuery, useCreateStudentMutation, useDeleteStudentMutation,
  useDeactivateStudentMutation, useActivateStudentMutation,
} from "../../redux/api/studentsApi";

const FEE_BADGE = { PAID:"success", PENDING:"danger", PARTIAL:"warning" };
const FEE_OPT   = [{ value:"", label:"All Status" }, { value:"PAID",label:"Paid" }, { value:"PENDING",label:"Pending" }, { value:"PARTIAL",label:"Partial" }];
const STATUS_OPT = [{ value:"", label:"All Students" }, { value:"active",label:"Active" }, { value:"inactive",label:"Inactive (Left)" }];

// Month names aligned with the backend fee-type month labels ("Jun-2025").
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Native <input type="month"> gives "2025-06"; the fee ledger keys by "Jun-2025".
const toFeeMonth = (v) => {
  if (!v) return "";
  const [y, m] = v.split("-");
  const idx = Number(m) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]}-${y}` : "";
};
const currentMonthInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function StudentListPage() {
  usePageTitle("Students");
  const navigate = useNavigate();
  const [error,setError]=useState("");
  const [search,setSearch]=useState(""); const [cls,setCls]=useState(""); const [section,setSection]=useState(""); const [feeStatus,setFee]=useState("");
  const [status,setStatus]=useState(""); // '' | 'active' | 'inactive'
  const [page,setPage]=useState(1); const [addOpen,setAddOpen]=useState(false); const [viewRow,setViewRow]=useState(null);
  const [inactiveRow,setInactiveRow]=useState(null); // student being marked inactive
  const [dateRange,setDateRange]=useState({from:"",to:""});
  const PAGE_SIZE=10;

  // Live classes (every class configured / imported for the school) and the
  // sections of the currently-selected class — the SAME source every other
  // class/section dropdown uses, so imported classes appear here automatically.
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(cls, { skip: !cls });

  const classFilterOpts = [{ value:"", label:"All Classes" }, ...classes.map(c=>({ value:c.id, label:c.name }))];
  const sectionFilterOpts = [{ value:"", label:"All Sections" }, ...sections.map(s=>({ value:s.id, label:s.name }))];

  // Students via RTK Query — same params/behaviour as before, but cached so
  // returning to this page is instant and edits/deletes auto-refresh the list.
  const { data: studentsResp, isFetching, isError, error: fetchErr } = useGetStudentsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(cls && { classId: cls }),
    ...(section && { sectionId: section }),
    ...(status && { status }),
  });
  const students = studentsResp?.data ?? [];
  const total = studentsResp?.pagination?.total ?? 0;
  const loading = isFetching;
  const fetchError = isError ? (fetchErr?.data?.error || fetchErr?.error || "Failed to fetch students") : "";

  const [createStudent] = useCreateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [deactivateStudent] = useDeactivateStudentMutation();
  const [activateStudent] = useActivateStudentMutation();

  const handleReactivate = async (studentId) => {
    if (!confirm("Re-activate this student? Recurring fees will resume accruing.")) return;
    try {
      await activateStudent(studentId).unwrap();
      setError("");
    } catch (err) {
      setError(err?.data?.error || "Failed to activate student");
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      await createStudent(formData).unwrap(); // invalidates the list → auto-refetch
      setAddOpen(false);
      setError("");
      setPage(1);
    } catch (err) {
      setError(err?.data?.error || err.message || "Failed to add student");
    }
  };

  const handleDelete = async (studentId) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(studentId).unwrap(); // invalidates the list → auto-refetch
      } catch (err) {
        setError(err?.data?.error || "Failed to delete student");
      }
    }
  };
  // Parent names come from the Student scalar fields, falling back to the
  // linked parents relation (relationship is free text, so match loosely).
  const parentName = (s, rel) => {
    const p = s.parents?.find(p => p.relationship?.toLowerCase().includes(rel))?.user;
    return p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : '';
  };

  // Format student data for display
  const displayStudents = students.map(s => ({
    id: s.id,
    roll: s.rollNumber,
    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`,
    class: s.section?.class?.name || '',
    section: s.section?.name || '',
    father: s.fatherName || parentName(s, 'father') || '-',
    mother: s.motherName || parentName(s, 'mother') || '-',
    dob: s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN') : '-',
    gender: s.gender || '-',
    blood: s.bloodGroup || '-',
    phone: s.user?.phone || '-',
    fees: 'PENDING', // TODO: Integrate with fee module
    isActive: s.isActive !== false, // enrollment status (left students are false)
    billedUntilMonth: s.billedUntilMonth || '',
    leftDate: s.leftDate ? new Date(s.leftDate).toLocaleDateString('en-IN') : '',
    createdAt: s.createdAt,
    admissionDate: s.admissionDate,
    original: s
  }));

  // Client-side date-wise filter (by admission/created date) on the current page.
  const filteredStudents = filterByDateRange(
    displayStudents,
    (r) => r.admissionDate || r.createdAt,
    dateRange.from, dateRange.to
  );

  // Columns used both for the table and the Excel export.
  const EXPORT_COLS = [
    { label: "Roll No", get: (r) => r.roll },
    { label: "Name", get: (r) => r.name },
    { label: "Class", get: (r) => `${r.class}/${r.section}` },
    { label: "Father Name", get: (r) => r.father },
    { label: "Mother Name", get: (r) => r.mother },
    { label: "Date of Birth", get: (r) => r.dob },
    { label: "Gender", get: (r) => r.gender },
    { label: "Blood Group", get: (r) => r.blood },
    { label: "Phone", get: (r) => r.phone },
  ];

  const COLUMNS=[
    {key:"roll",label:"Roll No",render:v=><span className="font-mono text-[11px] text-indigo-600 font-semibold">{v}</span>},
    {key:"name",label:"Student",render:(v,r)=><div className="flex items-center gap-2.5"><Avatar name={v} size="sm"/><div><p className={`font-semibold text-[12px] ${r.isActive?"text-slate-800":"text-slate-400 line-through"}`}>{v}</p><p className="text-[10px] text-slate-400">{r.gender} · {r.blood}</p></div></div>},
    {key:"class",label:"Class",render:(v,r)=><span className="font-medium">{v}/{r.section}</span>},
    {key:"father",label:"Father Name"},
    {key:"mother",label:"Mother Name"},
    {key:"dob",label:"D.O.B."},
    {key:"phone",label:"Phone"},
    {key:"fees",label:"Fee Status",render:v=><Badge variant={FEE_BADGE[v] || "default"}>{v.charAt(0).toUpperCase()+v.slice(1)}</Badge>},
    {key:"isActive",label:"Status",render:(v,r)=>v?<Badge variant="success">Active</Badge>:<span title={`Billed till ${r.billedUntilMonth||"—"}${r.leftDate?` · Left ${r.leftDate}`:""}`}><Badge variant="danger">Inactive{r.billedUntilMonth?` · ${r.billedUntilMonth}`:""}</Badge></span>},
    {key:"id",label:"Actions",sortable:false,render:(_,r)=><div className="flex gap-1"><button title="View profile" onClick={()=>navigate(`/students/add?id=${r.id}&view=1`,{state:{student:r.original}})} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500"><Eye size={13}/></button><button title="Edit student" onClick={()=>navigate(`/students/add?id=${r.id}`,{state:{student:r.original}})} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13}/></button>{r.isActive?<button title="Mark inactive (student left)" onClick={()=>setInactiveRow(r)} className="p-1.5 rounded-md hover:bg-orange-50 text-orange-500"><UserX size={13}/></button>:<button title="Re-activate student" onClick={()=>handleReactivate(r.id)} className="p-1.5 rounded-md hover:bg-green-50 text-green-600"><UserCheck size={13}/></button>}<button title="Delete student" onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13}/></button></div>},
  ];

  function AddStudentForm({ onSubmit, onCancel }) {
    const [form, setForm] = useState({firstName: '', lastName: '', email: '', password: 'student123', rollNumber: '', classId: '', sectionName: '', dateOfBirth: '', gender: '', phone: '', bloodGroup: ''});
    const [formError, setFormError] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError("");
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.rollNumber || !form.classId || !form.sectionName || !form.dateOfBirth) {
        setFormError("Please fill all required fields (Class, Section & Date of Birth included)");
        return;
      }
      setSubmitLoading(true);
      try {
        await onSubmit(form);
      } finally {
        setSubmitLoading(false);
      }
    };

    // Class options come from the backend; ordered Nursery → LKG → UKG → 1…12.
    const classOrder = { Nursery: -3, LKG: -2, UKG: -1 };
    const sortedClasses = [...classes].sort((a, b) => {
      const av = classOrder[a.name] ?? Number(a.name) ?? 0;
      const bv = classOrder[b.name] ?? Number(b.name) ?? 0;
      return av - bv;
    });
    const classOptions = [
      { value: "", label: "Select Class *" },
      ...sortedClasses.map(c => ({ value: c.id, label: c.name })),
    ];
    // Sections A–Z
    const sectionOptions = [
      { value: "", label: "Select Section *" },
      ...Array.from({ length: 26 }, (_, i) => {
        const letter = String.fromCharCode(65 + i);
        return { value: letter, label: letter };
      }),
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{formError}</div>}
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name *" value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})} placeholder="Student first name"/>
          <Input label="Last Name *" value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})} placeholder="Student last name"/>
          <Input label="Email *" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="Email address"/>
          <Input label="Password *" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Login password"/>
          <Input label="Roll Number *" value={form.rollNumber} onChange={e=>setForm({...form, rollNumber: e.target.value})} placeholder="Admission roll no."/>
          <Input label="Date of Birth *" type="date" value={form.dateOfBirth} onChange={e=>setForm({...form, dateOfBirth: e.target.value})}/>
          <Select label="Class *" value={form.classId} onChange={e=>setForm({...form, classId: e.target.value})} options={classOptions}/>
          <Select label="Section *" value={form.sectionName} onChange={e=>setForm({...form, sectionName: e.target.value})} options={sectionOptions}/>
          <Select label="Gender" value={form.gender} onChange={e=>setForm({...form, gender: e.target.value})} options={[{value:"",label:"Select"},{value:"MALE",label:"Male"},{value:"FEMALE",label:"Female"}]}/>
          <Input label="Blood Group" value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})} placeholder="e.g. O+"/>
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="Parent contact"/>
        </div>
        <div className="flex gap-2 pt-3"><Button type="submit" disabled={submitLoading} className="flex-1">{submitLoading ? "Saving..." : "Save Student"}</Button><Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button></div>
      </form>
    );
  }
  // Modal to mark a student inactive with a "bill fees until" cutoff month.
  function InactivateForm({ row, onCancel }) {
    const [monthInput, setMonthInput] = useState(currentMonthInput());
    const [leftDate, setLeftDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const submit = async () => {
      setFormError("");
      const billedUntilMonth = toFeeMonth(monthInput);
      if (!billedUntilMonth) { setFormError("Please choose the last month to bill."); return; }
      setSubmitting(true);
      try {
        await deactivateStudent({ id: row.id, billedUntilMonth, leftDate: leftDate || undefined }).unwrap();
        setError("");
        onCancel();
      } catch (err) {
        setFormError(err?.data?.error || err.message || "Failed to mark student inactive");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="space-y-4">
        {formError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{formError}</div>}
        <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <Avatar name={row.name} size="sm"/>
          <div><p className="font-semibold text-slate-800 text-sm">{row.name}</p><p className="text-[11px] text-slate-400">Roll {row.roll} · Class {row.class}/{row.section}</p></div>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed">
          The student's record and full fee history are kept. Recurring (monthly) fees are billed only
          <span className="font-semibold text-slate-800"> up to and including the month below</span> — no
          further monthly fee is charged. Session / one-time fees stay fully due and can be waived later
          via a discount.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bill fees until *" type="month" value={monthInput} onChange={e=>setMonthInput(e.target.value)}/>
          <Input label="Left date (optional)" type="date" value={leftDate} onChange={e=>setLeftDate(e.target.value)}/>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" onClick={submit} disabled={submitting} className="flex-1">{submitting?"Saving...":"Mark Inactive"}</Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Student Details" subtitle="Manage all enrolled students" icon={<Users size={18}/>}>
        <Button variant="secondary" size="sm" icon={<Upload size={13}/>} onClick={() => navigate("/students/upload")}>Import</Button>
        <ExportButton filename="students.csv" rows={filteredStudents} columns={EXPORT_COLS} />
        <Button size="sm" icon={<Plus size={13}/>} onClick={()=>setAddOpen(true)}>Add Student</Button>
      </PageHeader>
      
      <Card noPadding>
        {(error || fetchError) && <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-4 rounded-lg text-sm">{error || fetchError}</div>}
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100 items-end">
          <SearchInput value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name / roll / father / mother..." className="w-52"/>
          <Select value={cls} onChange={e=>{setCls(e.target.value);setSection("");setPage(1);}} options={classFilterOpts} className="w-44"/>
          <Select value={section} onChange={e=>{setSection(e.target.value);setPage(1);}} options={sectionFilterOpts} className="w-36" disabled={!cls}/>
          <Select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} options={STATUS_OPT} className="w-40"/>
          <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} label="Admission" />
          <Button variant="secondary" size="sm" icon={<Filter size={12}/>} onClick={()=>{setSearch("");setCls("");setSection("");setFee("");setStatus("");setDateRange({from:"",to:""});setPage(1);}}>Clear</Button>
          <span className="ml-auto text-[11px] text-slate-500">{loading ? "Loading..." : `${filteredStudents.length} of ${total} students`}</span>
        </div>
        <DataTable columns={COLUMNS} data={filteredStudents} loading={loading}/>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage}/>
      </Card>
      <Modal open={!!viewRow} onClose={()=>setViewRow(null)} title="Student Details" size="md">
        {viewRow&&<div className="space-y-4"><div className="flex items-center gap-4 pb-4 border-b border-slate-100"><Avatar name={viewRow.name} size="lg"/><div><h3 className="font-bold text-slate-800">{viewRow.name}</h3><p className="text-xs text-slate-400">{viewRow.roll} · Class {viewRow.class}/{viewRow.section}</p><Badge variant={FEE_BADGE[viewRow.fees]} className="mt-1">{viewRow.fees}</Badge></div></div><div className="grid grid-cols-2 gap-3">{[["Date of Birth",viewRow.dob],["Gender",viewRow.gender],["Blood Group",viewRow.blood],["Phone",viewRow.phone],["Class",`${viewRow.class}/${viewRow.section}`],["Roll No",viewRow.roll]].map(([l,v])=><div key={l} className="bg-slate-50 rounded-lg p-3"><p className="text-[10px] text-slate-400 font-medium">{l}</p><p className="text-[13px] font-semibold text-slate-700 mt-0.5">{v}</p></div>)}</div><div className="flex gap-2 pt-2"><Button size="sm" className="flex-1">Edit Student</Button><Button size="sm" variant="secondary" className="flex-1">ID Card</Button></div></div>}
      </Modal>
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add New Student" size="lg">
        <AddStudentForm onSubmit={handleAddStudent} onCancel={()=>setAddOpen(false)}/>
      </Modal>
      <Modal open={!!inactiveRow} onClose={()=>setInactiveRow(null)} title="Mark Student Inactive" size="md">
        {inactiveRow && <InactivateForm row={inactiveRow} onCancel={()=>setInactiveRow(null)}/>}
      </Modal>
    </div>
  );
}
