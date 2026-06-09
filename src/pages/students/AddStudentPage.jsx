/**
 * Student → Add Student
 * Full admission form (academic · admission · parent/communication) wired to
 * POST /students. Class+Section use real academic data; a STUDENT login account
 * is created automatically.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select } from "../../components/ui";
import { UserPlus, Save } from "lucide-react";
import { useCreateStudentMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetSectionsQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["", "General", "OBC", "SC", "ST", "EWS"];

const EMPTY = {
  firstName: "", lastName: "", email: "", phone: "", password: "Student@123",
  gender: "Male", dateOfBirth: "", bloodGroup: "", caste: "", religion: "", motherTongue: "",
  aadharNumber: "", category: "",
  classId: "", sectionName: "", rollNumber: "", admissionNumber: "", admissionDate: "",
  fatherName: "", motherName: "", guardianPhone: "", address: "", city: "",
};

export default function AddStudentPage() {
  usePageTitle("Add Student");
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(form.classId, { skip: !form.classId });
  const [createStudent, { isLoading }] = useCreateStudentMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.classId || !form.sectionName || !form.rollNumber || !form.dateOfBirth) {
      toast.error("Name, class, section, roll number and date of birth are required");
      return;
    }
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName || form.firstName,
      email: form.email || `${form.rollNumber.toLowerCase()}@student.local`,
      password: form.password || "Student@123",
      phone: form.phone,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      classId: form.classId,
      sectionName: form.sectionName,
      rollNumber: form.rollNumber,
      admissionNumber: form.admissionNumber || undefined,
      bloodGroup: form.bloodGroup || undefined,
      caste: form.caste || undefined,
      religion: form.religion || undefined,
      motherTongue: form.motherTongue || undefined,
      aadharNumber: form.aadharNumber || undefined,
    };
    try {
      await createStudent(payload).unwrap();
      toast.success("Student admitted successfully");
      navigate("/students/search");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create student");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-5xl mx-auto">
      <PageHeader title="Add Student" subtitle="Admit a new student" icon={<UserPlus size={18} />}>
        <Button type="submit" loading={isLoading} icon={<Save size={14} />}>Save Student</Button>
      </PageHeader>

      <Card title="Academic Information">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="First Name *" value={form.firstName} onChange={set("firstName")} />
          <Input label="Last Name" value={form.lastName} onChange={set("lastName")} />
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="auto from roll no if blank" />
          <Select label="Gender *" value={form.gender} onChange={set("gender")} options={GENDERS.map((g) => ({ value: g, label: g }))} />
          <Input label="Date of Birth *" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          <Select label="Blood Group" value={form.bloodGroup} onChange={set("bloodGroup")} options={BLOOD.map((b) => ({ value: b, label: b || "Select" }))} />
          <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORIES.map((c) => ({ value: c, label: c || "Select" }))} />
          <Input label="Religion" value={form.religion} onChange={set("religion")} />
          <Input label="Caste" value={form.caste} onChange={set("caste")} />
          <Input label="Mother Tongue" value={form.motherTongue} onChange={set("motherTongue")} />
          <Input label="Aadhar Number" value={form.aadharNumber} onChange={set("aadharNumber")} />
        </div>
      </Card>

      <Card title="Admission Information">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={form.session} onChange={set("session")}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Class *" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, sectionName: "" }))}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section *" value={form.sectionName} onChange={set("sectionName")}
            options={[{ value: "", label: form.classId ? "Select Section" : "Pick a class first" }, ...sections.map((s) => ({ value: s.name, label: s.name }))]} />
          <Input label="Roll Number *" value={form.rollNumber} onChange={set("rollNumber")} />
          <Input label="Admission Number" value={form.admissionNumber} onChange={set("admissionNumber")} />
          <Input label="Admission Date" type="date" value={form.admissionDate} onChange={set("admissionDate")} />
          <Input label="Login Password" value={form.password} onChange={set("password")} />
        </div>
      </Card>

      <Card title="Parent & Communication Details">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Father Name" value={form.fatherName} onChange={set("fatherName")} />
          <Input label="Mother Name" value={form.motherName} onChange={set("motherName")} />
          <Input label="Guardian Phone" value={form.guardianPhone} onChange={set("guardianPhone")} />
          <Input label="Address" value={form.address} onChange={set("address")} className="md:col-span-2" />
          <Input label="City" value={form.city} onChange={set("city")} />
        </div>
        <p className="px-5 pb-4 text-[11px] text-slate-400">Parent/guardian details are captured with the admission record. A linked parent login can be created later from the Parents module.</p>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate("/students/search")}>Cancel</Button>
        <Button type="submit" loading={isLoading} icon={<Save size={14} />}>Save Student</Button>
      </div>
    </form>
  );
}
