/**
 * StudentListPage.jsx — Full-featured student management page
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, DataTable, Badge, Button,
  SearchInput, Select, Pagination, Modal,
  Input, Textarea, Avatar, DateRangeFilter, ExportButton,
} from "../../components/ui";
import { Users, Plus, Eye, Edit2, Trash2, Filter, Upload } from "lucide-react";
import apiClient from "../../services/axios";
import { filterByDateRange } from "../../utils/exportExcel";

const FEE_BADGE = { PAID:"success", PENDING:"danger", PARTIAL:"warning" };
const CLASS_OPT = [{ value:"", label:"All Classes" }, ...Array.from({length:12},(_,i)=>({ value:String(i+1), label:`Class ${i+1}` }))];
const SEC_OPT   = [{ value:"", label:"All Sections" }, ...["A","B","C","D"].map(s=>({ value:s, label:`Section ${s}` }))];
const FEE_OPT   = [{ value:"", label:"All Status" }, { value:"PAID",label:"Paid" }, { value:"PENDING",label:"Pending" }, { value:"PARTIAL",label:"Partial" }];

export default function StudentListPage() {
  usePageTitle("Students");
  const navigate = useNavigate();
  const [students,setStudents]=useState([]); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const [search,setSearch]=useState(""); const [cls,setCls]=useState(""); const [section,setSection]=useState(""); const [feeStatus,setFee]=useState("");
  const [page,setPage]=useState(1); const [total,setTotal]=useState(0); const [addOpen,setAddOpen]=useState(false); const [viewRow,setViewRow]=useState(null);
  const [classes,setClasses]=useState([]);
  const [dateRange,setDateRange]=useState({from:"",to:""});
  const PAGE_SIZE=10;

  // Fetch classes on mount (drives the Class dropdown in the add form)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get("/academic/classes?limit=100");
        if (response.data.success) {
          setClasses(response.data.data || []);
        }
      } catch (err) {
        console.error("Class fetch error:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(search && { search }),
        });

        const response = await apiClient.get(`/students?${params}`);
        if (response.data.success) {
          setStudents(response.data.data || []);
          setTotal(response.data.pagination?.total || 0);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch students");
        console.error("Student fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, search]);

  const handleAddStudent = async (formData) => {
    try {
      await apiClient.post("/students", formData);
      setAddOpen(false);
      setError("");
      // Refresh list
      setPage(1);
      // Reload students
      const params = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE) });
      const response = await apiClient.get(`/students?${params}`);
      if (response.data.success) {
        setStudents(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to add student");
    }
  };

  const handleDelete = async (studentId) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await apiClient.delete(`/students/${studentId}`);
        setStudents(students.filter(s => s.id !== studentId));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete student");
      }
    }
  };
  // Format student data for display
  const displayStudents = students.map(s => ({
    id: s.id,
    roll: s.rollNumber,
    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`,
    class: s.section?.class?.name || '',
    section: s.section?.name || '',
    dob: s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN') : '-',
    gender: s.gender || '-',
    blood: s.bloodGroup || '-',
    phone: s.user?.phone || '-',
    fees: 'PENDING', // TODO: Integrate with fee module
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
    { label: "Date of Birth", get: (r) => r.dob },
    { label: "Gender", get: (r) => r.gender },
    { label: "Blood Group", get: (r) => r.blood },
    { label: "Phone", get: (r) => r.phone },
  ];

  const COLUMNS=[
    {key:"roll",label:"Roll No",render:v=><span className="font-mono text-[11px] text-indigo-600 font-semibold">{v}</span>},
    {key:"name",label:"Student",render:(v,r)=><div className="flex items-center gap-2.5"><Avatar name={v} size="sm"/><div><p className="font-semibold text-slate-800 text-[12px]">{v}</p><p className="text-[10px] text-slate-400">{r.gender} · {r.blood}</p></div></div>},
    {key:"class",label:"Class",render:(v,r)=><span className="font-medium">{v}/{r.section}</span>},
    {key:"dob",label:"D.O.B."},
    {key:"phone",label:"Phone"},
    {key:"fees",label:"Fee Status",render:v=><Badge variant={FEE_BADGE[v] || "default"}>{v.charAt(0).toUpperCase()+v.slice(1)}</Badge>},
    {key:"id",label:"Actions",sortable:false,render:(_,r)=><div className="flex gap-1"><button onClick={()=>setViewRow(r)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500"><Eye size={13}/></button><button className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500"><Edit2 size={13}/></button><button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13}/></button></div>},
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
  return (
    <div>
      <PageHeader title="Student Details" subtitle="Manage all enrolled students" icon={<Users size={18}/>}>
        <Button variant="secondary" size="sm" icon={<Upload size={13}/>} onClick={() => navigate("/students/upload")}>Import</Button>
        <ExportButton filename="students.csv" rows={filteredStudents} columns={EXPORT_COLS} />
        <Button size="sm" icon={<Plus size={13}/>} onClick={()=>setAddOpen(true)}>Add Student</Button>
      </PageHeader>
      
      <Card noPadding>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-4 rounded-lg text-sm">{error}</div>}
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100 items-end">
          <SearchInput value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by name or roll..." className="w-52"/>
          <Select value={cls} onChange={e=>{setCls(e.target.value);setPage(1);}} options={CLASS_OPT} className="w-36"/>
          <Select value={section} onChange={e=>{setSection(e.target.value);setPage(1);}} options={SEC_OPT} className="w-36"/>
          <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} label="Admission" />
          <Button variant="secondary" size="sm" icon={<Filter size={12}/>} onClick={()=>{setSearch("");setCls("");setSection("");setFee("");setDateRange({from:"",to:""});setPage(1);}}>Clear</Button>
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
    </div>
  );
}
