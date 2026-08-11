/**
 * EmployeeListPage.jsx — Full-featured employee management page
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, DataTable, Badge, Button,
  SearchInput, Select, Pagination, Modal,
  Input, Avatar, DateRangeFilter, ExportButton,
} from "../../components/ui";
import { Users, Plus, Eye, Edit2, Trash2, Filter, Upload, Camera, X } from "lucide-react";
import apiClient from "../../services/axios";
import { filterByDateRange } from "../../utils/exportExcel";
import { uploadImageFile } from "../../services/upload";
import toast from "react-hot-toast";

const STATUS_BADGE = { ACTIVE: "success", INACTIVE: "default", ON_LEAVE: "warning" };
// Values must match the backend UserRole enum (staff roles only).
const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "SCHOOL_ADMIN", label: "Admin" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "TEACHER", label: "Teacher" },
  { value: "ACCOUNTANT", label: "Accountant" },
];
const DEPT_OPTIONS = [{ value: "", label: "All Departments" }]; // Will be populated from API

export default function EmployeeListPage() {
  usePageTitle("Employees");
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editRow, setEditRow] = useState(null);
  const [viewRow, setViewRow] = useState(null);
  const [deptOptions, setDeptOptions] = useState(DEPT_OPTIONS);
  const [desigOptions, setDesigOptions] = useState([{ value: "", label: "All Designations" }]);
  const PAGE_SIZE = 10;

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(search && { search }),
          ...(role && { role }),
          ...(department && { departmentId: department }),
        });

        const response = await apiClient.get(`/employees?${params}`);
        if (response.data.success) {
          setEmployees(response.data.data || []);
          setTotal(response.data.pagination?.total || 0);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch employees");
        console.error("Employee fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, search, role, department]);

  // Fetch departments and designations on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptsRes, desigRes] = await Promise.all([
          apiClient.get("/employees/departments"),
          apiClient.get("/employees/designations"),
        ]);

        if (deptsRes.data.success) {
          const depts = deptsRes.data.data || [];
          setDeptOptions([
            { value: "", label: "All Departments" },
            ...depts.map(d => ({ value: d.id, label: d.name })),
          ]);
        }

        if (desigRes.data.success) {
          const desigs = desigRes.data.data || [];
          setDesigOptions([
            { value: "", label: "All Designations" },
            ...desigs.map(d => ({ value: d.id, label: d.name })),
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  const handleEditEmployee = async (formData) => {
    try {
      await apiClient.put(`/employees/${editRow.id}`, formData);
      setEditRow(null);
      // Refresh list
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(search && { search }),
      });
      const response = await apiClient.get(`/employees?${params}`);
      if (response.data.success) {
        setEmployees(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update employee");
    }
  };

  const handleDelete = async (employeeId) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await apiClient.patch(`/employees/${employeeId}/deactivate`);
        setEmployees(employees.filter(e => e.id !== employeeId));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete employee");
      }
    }
  };

  // Format employee data for display
  const displayEmployees = employees.map((e, idx) => ({
    id: e.id,
    sl: (page - 1) * PAGE_SIZE + idx + 1,
    name: `${e.user?.firstName || ''} ${e.user?.lastName || ''}`,
    email: e.user?.email || '-',
    phone: e.user?.phone || '-',
    employeeCode: e.employeeCode || '',
    designation: e.designation?.name || '-',
    department: e.department?.name || '-',
    dateOfJoining: e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString('en-IN') : '-',
    status: e.user?.isActive === false ? 'INACTIVE' : 'ACTIVE',
    photo: e.photo || '',
    createdAt: e.createdAt,
    original: e,
  }));

  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // Date-wise filter (by joining/created date) over the current page.
  const filteredEmployees = filterByDateRange(
    displayEmployees,
    (r) => r.original.dateOfJoining || r.createdAt,
    dateRange.from, dateRange.to
  );

  // For "Export all data": fetch every employee matching the active
  // search/role/department filters, mapped to the same export shape.
  const fetchAllEmployees = async () => {
    const params = new URLSearchParams({
      page: "1", limit: "100000",
      ...(search && { search }),
      ...(role && { role }),
      ...(department && { departmentId: department }),
    });
    const res = await apiClient.get(`/employees?${params}`);
    const list = res.data?.data || [];
    const mapped = list.map((e) => ({
      name: `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.trim(),
      email: e.user?.email || '-',
      phone: e.user?.phone || '-',
      employeeCode: e.employeeCode || '',
      designation: e.designation?.name || '-',
      department: e.department?.name || '-',
      dateOfJoining: e.dateOfJoining ? new Date(e.dateOfJoining).toLocaleDateString('en-IN') : '-',
      status: e.user?.isActive === false ? 'INACTIVE' : 'ACTIVE',
      createdAt: e.createdAt, original: e,
    }));
    return filterByDateRange(mapped, (r) => r.original.dateOfJoining || r.createdAt, dateRange.from, dateRange.to);
  };

  const EXPORT_COLS = [
    { label: "Name", get: (r) => r.name },
    { label: "Email", get: (r) => r.email },
    { label: "Phone", get: (r) => r.phone },
    { label: "Employee Code", get: (r) => r.employeeCode },
    { label: "Designation", get: (r) => r.designation },
    { label: "Department", get: (r) => r.department },
    { label: "Date of Joining", get: (r) => r.dateOfJoining },
    { label: "Create Date", get: (r) => fmtDateTime(r.createdAt) },
    { label: "Status", get: (r) => r.status },
  ];

  const COLUMNS = [
    { key: "sl", label: "SL", render: v => <span className="text-[11px] text-slate-500">{v}</span> },
    {
      key: "name",
      label: "Employee",
      render: (v, r) => <div className="flex items-center gap-2.5">
        <Avatar name={v} src={r.photo} size="sm" />
        <div>
          <p className="font-semibold text-slate-800 text-[12px]">{v}</p>
          <p className="text-[10px] text-slate-400">{r.email}</p>
        </div>
      </div>
    },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone" },
    { key: "employeeCode", label: "Employee Code", render: v => v || "N/A" },
    { key: "dateOfJoining", label: "Joining Date" },
    { key: "createdAt", label: "Create Date", render: v => <span className="text-[12px] whitespace-nowrap">{fmtDateTime(v)}</span> },
    {
      key: "status",
      label: "Status",
      render: v => <Badge variant={STATUS_BADGE[v] || "default"}>{v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ')}</Badge>
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_, r) => <div className="flex gap-1">
        <button onClick={() => setViewRow(r)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500">
          <Eye size={13} />
        </button>
        <button onClick={() => setEditRow(r)} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-500">
          <Edit2 size={13} />
        </button>
        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
    },
  ];

  function EmployeeForm({ onSubmit, onCancel, initialData = null }) {
    const [form, setForm] = useState(
      initialData
        ? {
            firstName: initialData.original?.user?.firstName || '',
            lastName: initialData.original?.user?.lastName || '',
            email: initialData.original?.user?.email || '',
            phone: initialData.original?.user?.phone || '',
            dateOfBirth: initialData.original?.dateOfBirth?.split('T')[0] || '',
            gender: initialData.original?.gender || '',
            departmentId: initialData.original?.departmentId || '',
            designationId: initialData.original?.designationId || '',
            dateOfJoining: initialData.original?.dateOfJoining?.split('T')[0] || '',
            baseSalary: initialData.original?.baseSalary || '',
            photo: initialData.original?.photo || '',
          }
        : {
            firstName: '',
            lastName: '',
            email: '',
            password: 'employee123',
            phone: '',
            dateOfBirth: '',
            gender: '',
            departmentId: '',
            designationId: '',
            dateOfJoining: '',
            baseSalary: '',
            photo: '',
          }
    );
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const onPhoto = async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploadingPhoto(true);
      try {
        const url = await uploadImageFile(file, "employees");
        setForm((f) => ({ ...f, photo: url }));
      } catch (err) {
        toast.error(err?.response?.data?.error || err.message || "Photo upload failed");
      } finally {
        setUploadingPhoto(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.firstName || !form.lastName || !form.email || !form.departmentId || !form.designationId) {
        setError("Please fill all required fields");
        return;
      }
      setSubmitLoading(true);
      try {
        await onSubmit(form);
      } finally {
        setSubmitLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile photo */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
            {form.photo ? (
              <>
                <img src={form.photo} alt="Employee" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/90 text-slate-600 shadow hover:bg-white"><X size={11} /></button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-0.5 text-slate-400">
                <Camera size={20} />
                <span className="text-[9px]">{uploadingPhoto ? "Uploading…" : "No photo"}</span>
              </div>
            )}
          </div>
          <div>
            <label className={`text-[12px] font-medium ${uploadingPhoto ? "text-slate-400 cursor-wait" : "text-indigo-600 hover:text-indigo-700 cursor-pointer"}`}>
              {uploadingPhoto ? "Uploading…" : form.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={onPhoto} disabled={uploadingPhoto} className="hidden" />
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">JPG/PNG · max 2MB (Cloudinary)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name *"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            placeholder="Employee first name"
          />
          <Input
            label="Last Name *"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            placeholder="Employee last name"
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
          />
          {!initialData && (
            <Input
              label="Password *"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Login password"
            />
          )}
          <Input
            label="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Contact number"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
          />
          <Select
            label="Department *"
            value={form.departmentId}
            onChange={e => setForm({ ...form, departmentId: e.target.value })}
            options={deptOptions.map(o => (o.value ? o : { ...o, label: "Select Department" }))}
          />
          <Select
            label="Designation *"
            value={form.designationId}
            onChange={e => setForm({ ...form, designationId: e.target.value })}
            options={desigOptions.map(o => (o.value ? o : { ...o, label: "Select Designation" }))}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            options={[
              { value: "", label: "Select" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
          />
          <Input
            label="Date of Joining"
            type="date"
            value={form.dateOfJoining}
            onChange={e => setForm({ ...form, dateOfJoining: e.target.value })}
          />
          <Input
            label="Base Salary"
            type="number"
            value={form.baseSalary}
            onChange={e => setForm({ ...form, baseSalary: e.target.value })}
            placeholder="Annual salary"
          />
        </div>
        <div className="flex gap-2 pt-3">
          <Button type="submit" disabled={submitLoading} className="flex-1">
            {submitLoading ? "Saving..." : initialData ? "Update Employee" : "Add Employee"}
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <PageHeader
        title="Employee Management"
        subtitle="Manage all staff and employees"
        icon={<Users size={18} />}
      >
        <Button variant="secondary" size="sm" icon={<Upload size={13} />}>Import</Button>
        <ExportButton filename="employees.csv" rows={filteredEmployees} columns={EXPORT_COLS} fetchAll={fetchAllEmployees} />
        <Button size="sm" icon={<Plus size={13} />} onClick={() => navigate("/employee/add")}>Add Employee</Button>
      </PageHeader>

      <Card noPadding>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-4 rounded-lg text-sm">{error}</div>}
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100 items-end">
          <SearchInput
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-52"
          />
          <Select
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
            options={ROLE_OPTIONS}
            className="w-36"
          />
          <Select
            value={department}
            onChange={e => { setDepartment(e.target.value); setPage(1); }}
            options={deptOptions}
            className="w-36"
          />
          <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} label="Joining" />
          <Button
            variant="secondary"
            size="sm"
            icon={<Filter size={12} />}
            onClick={() => {
              setSearch("");
              setRole("");
              setDepartment("");
              setDateRange({ from: "", to: "" });
              setPage(1);
            }}
          >
            Clear
          </Button>
          <span className="ml-auto text-[11px] text-slate-500">
            {loading ? "Loading..." : `${filteredEmployees.length} of ${total} employees`}
          </span>
        </div>
        <DataTable columns={COLUMNS} data={filteredEmployees} loading={loading} />
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <Modal open={!!viewRow} onClose={() => setViewRow(null)} title="Employee Details" size="md">
        {viewRow && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar name={viewRow.name} src={viewRow.photo} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800">{viewRow.name}</h3>
                <p className="text-xs text-slate-400">{viewRow.designation} · {viewRow.department}</p>
                <Badge variant={STATUS_BADGE[viewRow.status]} className="mt-1">
                  {viewRow.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Email", viewRow.email],
                ["Phone", viewRow.phone],
                ["Date of Joining", viewRow.dateOfJoining],
                ["Designation", viewRow.designation],
                ["Department", viewRow.department],
                ["Status", viewRow.status.replace(/_/g, ' ')],
              ].map(([l, v]) => (
                <div key={l} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 font-medium">{l}</p>
                  <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1" onClick={() => {
                setViewRow(null);
                setEditRow(viewRow);
              }}>
                Edit Employee
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                View Leaves
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Edit Employee" size="lg">
        {editRow && <EmployeeForm onSubmit={handleEditEmployee} onCancel={() => setEditRow(null)} initialData={editRow} />}
      </Modal>
    </div>
  );
}
