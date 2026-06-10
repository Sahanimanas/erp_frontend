/**
 * Student → Add Student
 * Full admission form: Basic · Academic (prior education) · Admission · Hostel ·
 * Transport · Parent/Communication · Documents. Wired to POST /students and the
 * Cloudinary-backed upload + student-documents endpoints. A STUDENT login is
 * created automatically.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea } from "../../components/ui";
import { UserPlus, Save, Camera, X, Plus, Trash2, Upload, FileText, FileDown } from "lucide-react";
import { useCreateStudentMutation } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetSectionsQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { uploadImageFile, uploadDocumentFile } from "../../services/upload";
import { printRecord } from "../../utils/printPdf";
import apiClient from "../../services/axios";

const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["", "Male", "Female", "Other"];
const CATEGORIES = ["", "General", "OBC", "SC", "ST", "EWS"];
const FEE_PLANS = ["REGULAR", "CONCESSION", "RTE", "STAFF WARD"];
const QUALIFICATIONS = ["", "Below 10th", "10th", "12th", "Graduate", "Post Graduate", "Doctorate", "Other"];

const EMPTY = {
  name: "", email: "", phone: "", password: "Student@123",
  gender: "", dateOfBirth: "", bloodGroup: "", category: "", caste: "", religion: "", motherTongue: "",
  aadharNumber: "", penNumber: "", apaarNo: "", smartCardNo: "", height: "", weight: "", remarks: "",
  enabled: true, photo: "",
  session: "", feePlan: "REGULAR", classId: "", sectionName: "",
  rollNumber: "", admissionNumber: "", admissionDate: "", registrationNo: "",
  hostelAllotted: false, hostelName: "", hostelRoomNo: "",
  transportAllotted: false, transportRoute: "", busNo: "",
  fatherName: "", motherName: "", fatherOccupation: "", motherOccupation: "",
  fatherQualification: "", motherQualification: "", fatherAadhar: "", motherAadhar: "",
  guardianName: "", guardianPhone: "", guardianEmail: "",
  address: "", permanentAddress: "", city: "", pincode: "",
};

const EMPTY_EDU = { courseName: "", passingYear: "", marksOrGrade: "", schoolName: "" };

export default function AddStudentPage({ title = "Add Student", subtitle = "Admit a new student", redirectTo = "/students/search" } = {}) {
  usePageTitle(title);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [education, setEducation] = useState([{ ...EMPTY_EDU }]);
  const [docs, setDocs] = useState([]); // { file, name, status }
  const [uploading, setUploading] = useState(false);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(form.classId, { skip: !form.classId });
  const [createStudent, { isLoading }] = useCreateStudentMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setChk = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  // ── photo ──────────────────────────────────────────────────────────────────
  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, "students");
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── education rows ───────────────────────────────────────────────────────────
  const setEdu = (i, k) => (e) => setEducation((rows) => rows.map((r, idx) => idx === i ? { ...r, [k]: e.target.value } : r));
  const addEdu = () => setEducation((r) => [...r, { ...EMPTY_EDU }]);
  const removeEdu = (i) => setEducation((r) => (r.length === 1 ? r : r.filter((_, idx) => idx !== i)));

  // ── documents ────────────────────────────────────────────────────────────────
  const onPickDocs = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setDocs((d) => [...d, ...files.map((file) => ({ file, name: file.name, status: "pending" }))]);
  };
  const removeDoc = (i) => setDocs((d) => d.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.classId || !form.sectionName || !form.rollNumber || !form.dateOfBirth) {
      toast.error("Name, class, section, roll number and date of birth are required");
      return;
    }
    const parts = form.name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || parts[0];

    const cleanEdu = education.filter((r) => r.courseName?.trim() || r.schoolName?.trim());

    const payload = {
      firstName,
      lastName,
      email: form.email || `${form.rollNumber.toLowerCase()}@student.local`,
      password: form.password || "Student@123",
      phone: form.phone,
      gender: form.gender || "Male",
      dateOfBirth: form.dateOfBirth,
      classId: form.classId,
      sectionName: form.sectionName,
      rollNumber: form.rollNumber,
      admissionNumber: form.admissionNumber || undefined,
      registrationNo: form.registrationNo || undefined,
      feePlan: form.feePlan || undefined,
      admissionDate: form.admissionDate || undefined,
      bloodGroup: form.bloodGroup || undefined,
      category: form.category || undefined,
      caste: form.caste || undefined,
      religion: form.religion || undefined,
      motherTongue: form.motherTongue || undefined,
      aadharNumber: form.aadharNumber || undefined,
      penNumber: form.penNumber || undefined,
      apaarNo: form.apaarNo || undefined,
      smartCardNo: form.smartCardNo || undefined,
      height: form.height || undefined,
      weight: form.weight || undefined,
      remarks: form.remarks || undefined,
      photo: form.photo || undefined,
      educationHistory: cleanEdu.length ? cleanEdu : undefined,
      fatherName: form.fatherName || undefined,
      motherName: form.motherName || undefined,
      fatherOccupation: form.fatherOccupation || undefined,
      motherOccupation: form.motherOccupation || undefined,
      fatherQualification: form.fatherQualification || undefined,
      motherQualification: form.motherQualification || undefined,
      fatherAadhar: form.fatherAadhar || undefined,
      motherAadhar: form.motherAadhar || undefined,
      guardianName: form.guardianName || undefined,
      guardianPhone: form.guardianPhone || undefined,
      guardianEmail: form.guardianEmail || undefined,
      address: form.address || undefined,
      permanentAddress: form.permanentAddress || undefined,
      city: form.city || undefined,
      pincode: form.pincode || undefined,
      hostelAllotted: form.hostelAllotted,
      hostelName: form.hostelName || undefined,
      hostelRoomNo: form.hostelRoomNo || undefined,
      transportAllotted: form.transportAllotted,
      transportRoute: form.transportRoute || undefined,
      busNo: form.busNo || undefined,
    };

    try {
      const created = await createStudent(payload).unwrap();
      const studentId = created?.data?.id ?? created?.id;

      // Upload any selected documents now that we have the student id.
      if (studentId && docs.length) {
        for (const d of docs) {
          try {
            const fileUrl = await uploadDocumentFile(d.file, "students");
            await apiClient.post(`/students/${studentId}/documents`, { type: d.name, fileUrl });
          } catch (docErr) {
            toast.error(`Could not upload "${d.name}": ${docErr?.response?.data?.error || docErr.message}`);
          }
        }
      }

      toast.success("Student admitted successfully");
      navigate(redirectTo);
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create student");
    }
  };

  const savePdf = () => {
    const className = classes.find((c) => c.id === form.classId)?.name || "";
    printRecord({
      title: "Student Admission Form",
      subtitle: [form.name, className && `Class ${className}`, form.rollNumber && `Roll ${form.rollNumber}`].filter(Boolean).join("  ·  "),
      photo: form.photo,
      sections: [
        { heading: "Basic Information", rows: [
          ["Name", form.name], ["Date of Birth", form.dateOfBirth], ["Phone", form.phone], ["Email", form.email],
          ["Gender", form.gender], ["Blood Group", form.bloodGroup], ["Smart Card No", form.smartCardNo], ["Aadhar Number", form.aadharNumber],
          ["Religion", form.religion], ["Category", form.category], ["Caste", form.caste], ["Height", form.height], ["Weight", form.weight],
          ["P.E.N", form.penNumber], ["APAAR No", form.apaarNo], ["Father's Aadhar", form.fatherAadhar], ["Mother's Aadhar", form.motherAadhar],
          ["Remarks", form.remarks],
        ] },
        { heading: "Admission Information", rows: [
          ["Fee Plan", form.feePlan], ["Class", className], ["Section", form.sectionName], ["Admission No", form.admissionNumber],
          ["Joining Date", form.admissionDate], ["Registration No", form.registrationNo], ["Roll Number", form.rollNumber],
        ] },
        { heading: "Hostel & Transport", rows: [
          ["Hostel Required", form.hostelAllotted ? "Yes" : "No"], ["Hostel Name", form.hostelName], ["Hostel Room", form.hostelRoomNo],
          ["Transport Required", form.transportAllotted ? "Yes" : "No"], ["Transport Route", form.transportRoute], ["Bus No", form.busNo],
        ] },
        { heading: "Parent & Communication", rows: [
          ["Father Name", form.fatherName], ["Mother Name", form.motherName], ["Father Occupation", form.fatherOccupation], ["Mother Occupation", form.motherOccupation],
          ["Father Qualification", form.fatherQualification], ["Mother Qualification", form.motherQualification],
          ["Guardian Name", form.guardianName], ["Guardian Phone", form.guardianPhone], ["Guardian Email", form.guardianEmail],
          ["City", form.city], ["Pincode", form.pincode], ["Current Address", form.address], ["Permanent Address", form.permanentAddress],
        ] },
        ...(education.some((r) => r.courseName || r.schoolName) ? [{
          heading: "Prior Education",
          rows: education.filter((r) => r.courseName || r.schoolName).map((r, i) => [
            `#${i + 1} ${r.courseName || ""}`.trim(),
            [r.schoolName, r.passingYear && `(${r.passingYear})`, r.marksOrGrade && `— ${r.marksOrGrade}`].filter(Boolean).join(" "),
          ]),
        }] : []),
      ],
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 w-full">
      <PageHeader title={title} subtitle={subtitle} icon={<UserPlus size={18} />}>
        <Button type="button" variant="secondary" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
        <Button type="submit" loading={isLoading} icon={<Save size={14} />}>Save Student</Button>
      </PageHeader>

      {/* ── Basic Information ─────────────────────────────────────────────── */}
      <Card title="Basic Information">
        <div className="p-5 flex flex-col lg:flex-row gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative w-36 h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
              {form.photo ? (
                <>
                  <img src={form.photo} alt="Student" className="w-full h-full object-cover" />
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
            <label className={`text-[12px] font-medium ${uploading ? "text-slate-400 cursor-wait" : "text-indigo-600 hover:text-indigo-700 cursor-pointer"}`}>
              {uploading ? "Uploading…" : form.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="hidden" />
            </label>
            <span className="text-[10px] text-slate-400">JPG/PNG · max 2MB</span>
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={set("name")} placeholder="Enter Name" />
            <Input label="Date of Birth *" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
            <Input label="Phone *" value={form.phone} onChange={set("phone")} placeholder="Enter Phone" />
            <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="auto from roll no if blank" />
            <Select label="Gender" value={form.gender} onChange={set("gender")} options={GENDERS.map((g) => ({ value: g, label: g || "Select..." }))} />
            <Select label="Blood Group" value={form.bloodGroup} onChange={set("bloodGroup")} options={BLOOD.map((b) => ({ value: b, label: b || "Select..." }))} />
            <Input label="Smart Card Number" value={form.smartCardNo} onChange={set("smartCardNo")} placeholder="Enter Smart Card Number" />
            <Input label="Aadhar Number" value={form.aadharNumber} onChange={set("aadharNumber")} placeholder="Enter Aadhar Number" />
            <Input label="Religion" value={form.religion} onChange={set("religion")} placeholder="Enter Religion" />
            <Select label="Student Category" value={form.category} onChange={set("category")} options={CATEGORIES.map((c) => ({ value: c, label: c || "Select..." }))} />
            <Input label="Student Caste" value={form.caste} onChange={set("caste")} placeholder="Enter Student Caste" />
            <Input label="Height (In Feet Eg: 3.5)" value={form.height} onChange={set("height")} placeholder="Enter Student Height" />
            <Input label="Weight (In Kg Eg: 33.5)" value={form.weight} onChange={set("weight")} placeholder="Enter Student Weight" />
            <Input label="Student P.E.N" value={form.penNumber} onChange={set("penNumber")} placeholder="Enter Student P.E.N" />
            <Input label="Student APAAR No" value={form.apaarNo} onChange={set("apaarNo")} placeholder="Enter Student APAAR" />
            <Input label="Father's Aadhar Number" value={form.fatherAadhar} onChange={set("fatherAadhar")} placeholder="Enter Father's Aadhar Number" />
            <Input label="Mother's Aadhar Number" value={form.motherAadhar} onChange={set("motherAadhar")} placeholder="Enter Mother's Aadhar Number" />
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mt-6">
              <input type="checkbox" checked={form.enabled} onChange={setChk("enabled")} className="accent-emerald-600 w-4 h-4" />
              Enabled
            </label>
            <div className="md:col-span-2">
              <Textarea label="Remarks" value={form.remarks} onChange={set("remarks")} />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Academic Information (prior education) ────────────────────────── */}
      <Card title="Academic Information" action={<Button type="button" size="xs" icon={<Plus size={12} />} onClick={addEdu}>Add Row</Button>}>
        <div className="p-5 space-y-3">
          {education.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3"><Input label={i === 0 ? "Course/Class Name" : ""} value={row.courseName} onChange={setEdu(i, "courseName")} placeholder="Enter Course/Class Name" /></div>
              <div className="sm:col-span-2"><Input label={i === 0 ? "Passing Year" : ""} value={row.passingYear} onChange={setEdu(i, "passingYear")} placeholder="Enter Passing Year" /></div>
              <div className="sm:col-span-3"><Input label={i === 0 ? "Total Marks or Grade" : ""} value={row.marksOrGrade} onChange={setEdu(i, "marksOrGrade")} placeholder="Enter Marks or Grade" /></div>
              <div className="sm:col-span-3"><Input label={i === 0 ? "College/School Name" : ""} value={row.schoolName} onChange={setEdu(i, "schoolName")} placeholder="Enter College/School Name" /></div>
              <div className="sm:col-span-1">
                <button type="button" onClick={() => removeEdu(i)} disabled={education.length === 1}
                  className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center disabled:opacity-40">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Admission Information ─────────────────────────────────────────── */}
      <Card title="Admission Information">
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Session" value={form.session} onChange={set("session")}
            options={[{ value: "", label: "Select..." }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan *" value={form.feePlan} onChange={set("feePlan")}
            options={FEE_PLANS.map((p) => ({ value: p, label: p }))} />
          <Select label="Class *" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, sectionName: "" }))}
            options={[{ value: "", label: "Select..." }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section *" value={form.sectionName} onChange={set("sectionName")}
            options={[{ value: "", label: form.classId ? "Select Section" : "Pick a class first" }, ...sections.map((s) => ({ value: s.name, label: s.name }))]} />
          <Input label="Admission No" value={form.admissionNumber} onChange={set("admissionNumber")} placeholder="Enter Admission No" />
          <Input label="Joining Date" type="date" value={form.admissionDate} onChange={set("admissionDate")} />
          <Input label="Registration No" value={form.registrationNo} onChange={set("registrationNo")} placeholder="Registration No" />
          <Input label="Roll Number *" value={form.rollNumber} onChange={set("rollNumber")} placeholder="Class Roll No" />
          <Input label="Login Password" value={form.password} onChange={set("password")} />
        </div>
      </Card>

      {/* ── Hostel Information ────────────────────────────────────────────── */}
      <Card title="Hostel Information">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.hostelAllotted} onChange={setChk("hostelAllotted")} className="accent-indigo-600 w-4 h-4" />
            Hostel Required
          </label>
          <Input label="Hostel Name" value={form.hostelName} onChange={set("hostelName")} placeholder="Hostel Name" disabled={!form.hostelAllotted} />
          <Input label="Hostel Room No" value={form.hostelRoomNo} onChange={set("hostelRoomNo")} placeholder="Hostel Room Number" disabled={!form.hostelAllotted} />
        </div>
      </Card>

      {/* ── Transport Information ─────────────────────────────────────────── */}
      <Card title="Transport Information">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.transportAllotted} onChange={setChk("transportAllotted")} className="accent-indigo-600 w-4 h-4" />
            Transport Required
          </label>
          <Input label="Transport Route Name" value={form.transportRoute} onChange={set("transportRoute")} placeholder="Transport Route Name" disabled={!form.transportAllotted} />
          <Input label="Bus No" value={form.busNo} onChange={set("busNo")} placeholder="Bus Number" disabled={!form.transportAllotted} />
        </div>
      </Card>

      {/* ── Parent & Communication ────────────────────────────────────────── */}
      <Card title="Parent and Communication Details">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Father Name *" value={form.fatherName} onChange={set("fatherName")} placeholder="Enter Father Name" />
          <Input label="Mother Name" value={form.motherName} onChange={set("motherName")} placeholder="Enter Mother Name" />
          <Input label="Father Occupation" value={form.fatherOccupation} onChange={set("fatherOccupation")} placeholder="Enter Father Occupation" />
          <Input label="Mother Occupation" value={form.motherOccupation} onChange={set("motherOccupation")} placeholder="Enter Mother Occupation" />
          <Select label="Father Qualification" value={form.fatherQualification} onChange={set("fatherQualification")} options={QUALIFICATIONS.map((q) => ({ value: q, label: q || "Select..." }))} />
          <Select label="Mother Qualification" value={form.motherQualification} onChange={set("motherQualification")} options={QUALIFICATIONS.map((q) => ({ value: q, label: q || "Select..." }))} />
          <Input label="Guardian Name" value={form.guardianName} onChange={set("guardianName")} placeholder="Enter Guardian Name" />
          <Input label="Guardian Phone" value={form.guardianPhone} onChange={set("guardianPhone")} placeholder="Enter Guardian Phone" />
          <Input label="Guardian Email" value={form.guardianEmail} onChange={set("guardianEmail")} placeholder="Enter Guardian Email" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={set("city")} placeholder="Enter City" />
            <Input label="Pincode" value={form.pincode} onChange={set("pincode")} placeholder="Enter Pincode" />
          </div>
          <Textarea label="Current Address" value={form.address} onChange={set("address")} placeholder="Enter Current Address" />
          <Textarea label="Permanent Address" value={form.permanentAddress} onChange={set("permanentAddress")} placeholder="Enter Permanent Address" />
        </div>
      </Card>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <Card title="Upload Document" subtitle="PDF, DOC and JPEG accepted · Max 1MB each"
        action={
          <label className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer">
            <Upload size={13} /> Upload Files
            <input type="file" multiple accept=".pdf,.doc,.docx,image/jpeg,image/png" onChange={onPickDocs} className="hidden" />
          </label>
        }>
        <div className="p-5">
          {docs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No documents selected. They’ll upload after the student is saved.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {docs.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <FileText size={15} className="text-slate-400 shrink-0" />
                  <span className="flex-1 truncate text-slate-700">{d.name}</span>
                  <span className="text-[11px] text-slate-400">{(d.file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => removeDoc(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(redirectTo)}>Cancel</Button>
        <Button type="button" variant="outline" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
        <Button type="submit" loading={isLoading} icon={<Save size={14} />}>Submit</Button>
      </div>
    </form>
  );
}
