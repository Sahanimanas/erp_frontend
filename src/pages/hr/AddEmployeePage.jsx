/**
 * AddEmployeePage.jsx — create an employee with full bio + work experience
 * GET /employees/departments, /employees/designations, /employees (reporting-to)
 * POST /employees
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea } from "../../components/ui";
import { UserPlus, Plus, Trash2, Camera, X, FileDown, Eye, EyeOff } from "lucide-react";
import apiClient from "../../services/axios";
import { uploadImageFile } from "../../services/upload";
import { printRecord } from "../../utils/printPdf";
import CameraCapture from "../../components/CameraCapture";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = [{ value: "", label: "Select" }, { value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }];
const ROLES = [
  { value: "TEACHER", label: "Teacher" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "SCHOOL_ADMIN", label: "Admin" },
];

export default function AddEmployeePage() {
  usePageTitle("Add Employee");
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "TEACHER",
    city: "", address: "", permanentAddress: "", joiningDate: "", employeeCode: "",
    departmentId: "", designationId: "", reportingToId: "",
    fatherName: "", husbandName: "", bloodGroup: "", rfidNumber: "", qualification: "", photo: "",
  });
  const [experiences, setExperiences] = useState([{ employer: "", role: "", totalExperience: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, g, e] = await Promise.all([
          apiClient.get("/employees/departments"),
          apiClient.get("/employees/designations"),
          apiClient.get("/employees?limit=500"),
        ]);
        if (d.data.success) setDepartments(d.data.data || []);
        if (g.data.success) setDesignations(g.data.data || []);
        if (e.data.success) setEmployees(e.data.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Upload a chosen/captured image File to Cloudinary and store its URL.
  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImageFile(file, "employees");
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    uploadPhoto(file);
  };

  const setExp = (i, k) => (e) => setExperiences((rows) => rows.map((r, idx) => idx === i ? { ...r, [k]: e.target.value } : r));
  const addExp = () => setExperiences((r) => [...r, { employer: "", role: "", totalExperience: "" }]);
  const removeExp = (i) => setExperiences((r) => r.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, Email and Password are required");
      return;
    }
    const parts = form.name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || parts[0];

    setSaving(true);
    try {
      const payload = {
        firstName, lastName,
        email: form.email, password: form.password, phone: form.phone, role: form.role,
        city: form.city, address: form.address, permanentAddress: form.permanentAddress,
        dateOfJoining: form.joiningDate || undefined, employeeCode: form.employeeCode || undefined,
        departmentId: form.departmentId || undefined, designationId: form.designationId || undefined,
        reportingToId: form.reportingToId || undefined, fatherName: form.fatherName,
        husbandName: form.husbandName, bloodGroup: form.bloodGroup || undefined,
        rfidNumber: form.rfidNumber, qualification: form.qualification,
        photo: form.photo || undefined,
        experiences: experiences.filter((x) => x.employer.trim()),
      };
      const res = await apiClient.post("/employees", payload);
      if (res.data.success) {
        setSuccess(`Employee "${firstName} ${lastName}" added (code ${res.data.data.employeeCode}).`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setForm((f) => ({ ...f, name: "", email: "", phone: "", password: "", employeeCode: "", photo: "" }));
        setExperiences([{ employer: "", role: "", totalExperience: "" }]);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to add employee");
    } finally { setSaving(false); }
  };

  const deptOptions = [{ value: "", label: "Select" }, ...departments.map((d) => ({ value: d.id, label: d.name }))];
  const desigOptions = [{ value: "", label: "Select" }, ...designations.map((d) => ({ value: d.id, label: d.name }))];
  const empOptions = [{ value: "", label: "None" }, ...employees.map((e) => ({ value: e.id, label: e.user ? `${e.user.firstName} ${e.user.lastName}` : e.employeeCode }))];

  const savePdf = () => {
    const deptName = departments.find((d) => d.id === form.departmentId)?.name || "";
    const desigName = designations.find((d) => d.id === form.designationId)?.name || "";
    printRecord({
      title: "Employee Record",
      subtitle: [form.name, desigName, form.employeeCode && `Code ${form.employeeCode}`].filter(Boolean).join("  ·  "),
      photo: form.photo,
      sections: [
        { heading: "Basic Details", rows: [
          ["Name", form.name], ["Email", form.email], ["Phone", form.phone], ["City", form.city],
          ["Joining Date", form.joiningDate], ["Employee Code", form.employeeCode], ["Department", deptName], ["Designation", desigName],
          ["Father's Name", form.fatherName], ["Husband Name", form.husbandName], ["Blood Group", form.bloodGroup],
          ["RFID Card", form.rfidNumber], ["Qualification", form.qualification], ["Access Role", form.role],
        ] },
        { heading: "Address", rows: [["Address", form.address], ["Permanent Address", form.permanentAddress]] },
        ...(experiences.some((x) => x.employer?.trim()) ? [{
          heading: "Work Experience",
          rows: experiences.filter((x) => x.employer?.trim()).map((x, i) => [
            `#${i + 1} ${x.employer}`, [x.role, x.totalExperience && `(${x.totalExperience})`].filter(Boolean).join(" "),
          ]),
        }] : []),
      ],
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Add Employee" subtitle="Create a staff record" icon={<UserPlus size={18} />}>
        <Button size="sm" variant="outline" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
        <Button size="sm" variant="secondary" onClick={() => navigate("/employee/list")}>Employee List</Button>
      </PageHeader>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}

      <form onSubmit={submit} className="space-y-5">
        <Card title="Basic Details">
          <div className="p-5 flex flex-col lg:flex-row gap-6">
          {/* Photo uploader */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative w-32 h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
              {form.photo ? (
                <>
                  <img src={form.photo} alt="Employee" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-slate-600 shadow hover:bg-white">
                    <X size={13} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={26} />
                  <span className="text-[10px]">{uploading ? "Uploading…" : "No photo"}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className={`text-[12px] font-medium ${uploading ? "text-slate-400 cursor-wait" : "text-indigo-600 hover:text-indigo-700 cursor-pointer"}`}>
                {uploading ? "Uploading…" : form.photo ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="hidden" />
              </label>
              <span className="text-slate-300">·</span>
              <button type="button" onClick={() => setCameraOpen(true)} disabled={uploading}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed">
                <Camera size={13} /> Use camera
              </button>
            </div>
            <span className="text-[10px] text-slate-400">JPG/PNG · max 2MB</span>
          </div>

          <CameraCapture open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={uploadPhoto} />

          <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Name *" value={form.name} onChange={set("name")} placeholder="Full name" />
            <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="Login email" />
            <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="Mobile no." />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="Joining Date" type="date" value={form.joiningDate} onChange={set("joiningDate")} />
            <Input label="Employee Code" value={form.employeeCode} onChange={set("employeeCode")} placeholder="Auto if blank" />
            <Select label="Department" value={form.departmentId} onChange={set("departmentId")} options={deptOptions} />
            <Select label="Designation" value={form.designationId} onChange={set("designationId")} options={desigOptions} />
            <Select label="Reporting To" value={form.reportingToId} onChange={set("reportingToId")} options={empOptions} />
            <Input label="Father's Name" value={form.fatherName} onChange={set("fatherName")} />
            <Input label="Husband Name" value={form.husbandName} onChange={set("husbandName")} />
            <Select label="Blood Group" value={form.bloodGroup} onChange={set("bloodGroup")} options={[{ value: "", label: "Select" }, ...BLOOD_GROUPS.map((b) => ({ value: b, label: b }))]} />
            <Input label="RFID Card Number" value={form.rfidNumber} onChange={set("rfidNumber")} />
            <Input label="Qualification" value={form.qualification} onChange={set("qualification")} />
            <Select label="Access Role" value={form.role} onChange={set("role")} options={ROLES} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Textarea label="Address" value={form.address} onChange={set("address")} />
            <Textarea label="Permanent Address" value={form.permanentAddress} onChange={set("permanentAddress")} />
          </div>
          </div>
          </div>
        </Card>

        <Card title="Work Experience" action={<Button type="button" size="xs" icon={<Plus size={12} />} onClick={addExp}>Add Row</Button>}>
          <div className="p-5 space-y-3">
            {experiences.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5"><Input label={i === 0 ? "Employer" : ""} value={row.employer} onChange={setExp(i, "employer")} placeholder="Previous employer" /></div>
                <div className="sm:col-span-3"><Input label={i === 0 ? "Role" : ""} value={row.role} onChange={setExp(i, "role")} placeholder="Role" /></div>
                <div className="sm:col-span-3"><Input label={i === 0 ? "Total Experience" : ""} value={row.totalExperience} onChange={setExp(i, "totalExperience")} placeholder="e.g. 5 years" /></div>
                <div className="sm:col-span-1">
                  <button type="button" onClick={() => removeExp(i)} disabled={experiences.length === 1}
                    className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Login Details">
          <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Login Email *" type="email" value={form.email} onChange={set("email")} placeholder="Used to sign in" />
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Set a password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  title={showPwd ? "Hide password" : "Show password"}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">The employee signs in with this email and password.</p>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate("/employee/list")}>Cancel</Button>
          <Button type="button" variant="outline" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Employee"}</Button>
        </div>
      </form>
    </div>
  );
}
