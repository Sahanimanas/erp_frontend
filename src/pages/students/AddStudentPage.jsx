/**
 * Student → Add Student
 * Full admission form: Basic · Academic (prior education) · Admission · Hostel ·
 * Transport · Parent/Communication · Documents. Wired to POST /students and the
 * Cloudinary-backed upload + student-documents endpoints. A STUDENT login is
 * created automatically.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea, Modal } from "../../components/ui";
import { UserPlus, Save, Camera, X, Plus, Trash2, Upload, FileText, FileDown, SwitchCamera, Aperture } from "lucide-react";
import { useCreateStudentMutation, useUpdateStudentMutation, useGetStudentQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { uploadImageFile, uploadDocumentFile } from "../../services/upload";
import { printRecord } from "../../utils/printPdf";
import apiClient from "../../services/axios";

const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["", "Male", "Female", "Other"];
const CATEGORIES = ["", "General", "OBC", "SC", "ST", "EWS"];
const FEE_PLANS = ["REGULAR", "CONCESSION", "RTE", "STAFF WARD"];
const QUALIFICATIONS = ["", "Below 10th", "10th", "12th", "Graduate", "Post Graduate", "Doctorate", "Other"];
// Sections A–Z (the backend find-or-creates the section under the class).
const SECTIONS_AZ = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
// Academic sessions: previous → current (Apr–Mar cycle). e.g. 2025-2026, 2026-2027.
const SESSIONS = (() => {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return [`${y - 1}-${y}`, `${y}-${y + 1}`];
})();

const EMPTY = {
  name: "", email: "", phone: "", password: "Student@123",
  gender: "", dateOfBirth: "", bloodGroup: "", category: "", caste: "", religion: "", motherTongue: "",
  aadharNumber: "", penNumber: "", apaarNo: "", smartCardNo: "", height: "", weight: "", remarks: "",
  enabled: true, photo: "",
  session: SESSIONS[SESSIONS.length - 1], feePlan: "REGULAR", classId: "", sectionName: "",
  rollNumber: "", admissionNumber: "", admissionDate: "", registrationNo: "",
  hostelAllotted: false, hostelName: "", hostelRoomNo: "",
  transportAllotted: false, transportRoute: "", busNo: "",
  fatherName: "", motherName: "", fatherOccupation: "", motherOccupation: "",
  fatherQualification: "", motherQualification: "", fatherAadhar: "", motherAadhar: "",
  guardianName: "", guardianPhone: "", guardianEmail: "",
  address: "", permanentAddress: "", city: "", pincode: "",
};

const EMPTY_EDU = { courseName: "", passingYear: "", marksOrGrade: "", schoolName: "" };

// Map a student record (from the list row or GET /students/:id) onto the form
// shape so editing prefills every field with current values.
const iso = (d) => (d ? String(d).slice(0, 10) : "");
function mapStudentToForm(s) {
  return {
    ...EMPTY,
    name: [s.user?.firstName, s.user?.lastName].filter(Boolean).join(" ").trim(),
    email: s.user?.email || "",
    phone: s.user?.phone || "",
    password: "", // leave blank — only updates the login password if filled
    gender: s.gender || "",
    dateOfBirth: iso(s.dateOfBirth),
    bloodGroup: s.bloodGroup || "", category: s.category || "", caste: s.caste || "",
    religion: s.religion || "", motherTongue: s.motherTongue || "",
    aadharNumber: s.aadharNumber || "", penNumber: s.penNumber || "", apaarNo: s.apaarNo || "",
    smartCardNo: s.smartCardNo || "", height: s.height || "", weight: s.weight || "", remarks: s.remarks || "",
    enabled: s.user?.isActive ?? true, photo: s.photo || "",
    session: EMPTY.session, feePlan: s.feePlan || "REGULAR",
    classId: s.section?.class?.id || "", sectionName: s.section?.name || "",
    rollNumber: s.rollNumber || "", admissionNumber: s.admissionNumber || "",
    admissionDate: iso(s.admissionDate), registrationNo: s.registrationNo || "",
    hostelAllotted: s.hostelAllotted || false, hostelName: s.hostelName || "", hostelRoomNo: s.hostelRoomNo || "",
    transportAllotted: s.transportAllotted || false, transportRoute: s.transportRoute || "", busNo: s.busNo || "",
    fatherName: s.fatherName || "", motherName: s.motherName || "",
    fatherOccupation: s.fatherOccupation || "", motherOccupation: s.motherOccupation || "",
    fatherQualification: s.fatherQualification || "", motherQualification: s.motherQualification || "",
    fatherAadhar: s.fatherAadhar || "", motherAadhar: s.motherAadhar || "",
    guardianName: s.guardianName || "", guardianPhone: s.guardianPhone || "", guardianEmail: s.guardianEmail || "",
    address: s.address || "", permanentAddress: s.permanentAddress || "", city: s.city || "", pincode: s.pincode || "",
  };
}

export default function AddStudentPage({ title = "Add Student", subtitle = "Admit a new student", redirectTo = "/students/search" } = {}) {
  const [params] = useSearchParams();
  const editId = params.get("id") || "";
  const isEdit = !!editId;
  // View mode (?view=1): same form layout, read-only — used as the full student
  // profile page. Fields are disabled via a <fieldset disabled> wrapper.
  const isView = params.get("view") === "1";
  const pageTitle = isView ? "Student Profile" : isEdit ? "Edit Student" : title;
  const pageSubtitle = isView ? "Complete student record" : isEdit ? "Update student details and fill in missing fields" : subtitle;
  const doneTo = isEdit ? "/students/list" : redirectTo;

  usePageTitle(pageTitle);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [education, setEducation] = useState([{ ...EMPTY_EDU }]);
  const [docs, setDocs] = useState([]); // { file, name, status }
  const [uploading, setUploading] = useState(false);

  const { data: classes = [] } = useGetClassesQuery();
  // Sessions configured under Settings → Sessions feed this dropdown; fall back to
  // the computed Apr–Mar defaults when none have been set up yet.
  const { data: sessionList = [] } = useGetSessionsQuery();
  const sessionOptions = [...new Set([
    ...(sessionList.length ? sessionList.map((s) => s.name) : SESSIONS),
  ])];
  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();
  const isLoading = creating || updating;

  // Edit mode: prefill the whole form so the admin can change current values and
  // fill empty fields. When we arrive from the Student List we already have the
  // full row (passed via navigation state) — prefill instantly and skip the
  // network round-trip. Only fetch when the page is opened directly by URL.
  const location = useLocation();
  const stateStudent = location.state?.student || null;
  const { data: existingRes } = useGetStudentQuery(editId, { skip: !isEdit || !!stateStudent });
  useEffect(() => {
    const s = stateStudent ?? existingRes?.data ?? existingRes;
    if (!isEdit || !s) return;
    setForm(mapStudentToForm(s));
    setEducation(Array.isArray(s.educationHistory) && s.educationHistory.length ? s.educationHistory.map((r) => ({ ...EMPTY_EDU, ...r })) : [{ ...EMPTY_EDU }]);
  }, [existingRes, stateStudent, isEdit]);

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

  // ── camera capture ───────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facing, setFacing] = useState("user"); // "user" (front) | "environment" (back)

  // Start/stop the webcam stream whenever the camera modal opens or the camera is
  // flipped; always tear the stream down on close/unmount so the light goes off.
  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
      } catch (err) {
        toast.error("Could not access the camera. Check browser permissions (and use HTTPS).");
        setCameraOpen(false);
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    };
  }, [cameraOpen, facing]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { toast.error("Camera not ready yet"); return; }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) { toast.error("Could not capture the photo"); return; }
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setCameraOpen(false); // stops the stream via the effect cleanup
      setUploading(true);
      try {
        const url = await uploadImageFile(file, "students");
        setForm((f) => ({ ...f, photo: url }));
        toast.success("Photo captured");
      } catch (err) {
        toast.error(err?.response?.data?.error || err.message || "Photo upload failed");
      } finally {
        setUploading(false);
      }
    }, "image/jpeg", 0.92);
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
    if (isView) return; // read-only profile view never submits
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
      // On create, fall back to the default login password. On edit, only send a
      // password when the admin typed a new one (handled below).
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
      let studentId = editId;
      if (isEdit) {
        const editPayload = { ...payload, enabled: form.enabled };
        if (form.password) editPayload.password = form.password; else delete editPayload.password;
        await updateStudent({ id: editId, ...editPayload }).unwrap();
      } else {
        const created = await createStudent(payload).unwrap();
        studentId = created?.data?.id ?? created?.id;
      }

      // Upload any newly selected documents now that we have the student id.
      if (studentId && docs.length) {
        for (const d of docs) {
          try {
            const fileUrl = await uploadDocumentFile(d.file, "students");
            await apiClient.post(`/students/${studentId}/documents`, { type: d.name, fileUrl });
          } catch (docErr) {
            toast.error(`Could not upload "${d.name}": ${docErr?.response?.data?.error || docErr.message}`);
          }
        }
        setDocs([]);
      }

      toast.success(isEdit ? "Student updated successfully" : "Student admitted successfully");
      navigate(doneTo);
    } catch (err) {
      toast.error(err?.data?.error || (isEdit ? "Failed to update student" : "Failed to create student"));
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
      <PageHeader title={pageTitle} subtitle={pageSubtitle} icon={<UserPlus size={18} />}>
        <Button type="button" variant="secondary" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
        {isView ? (
          <Button type="button" icon={<UserPlus size={14} />} onClick={() => navigate(`/students/add?id=${editId}`)}>Edit Student</Button>
        ) : (
          <Button type="submit" loading={isLoading} icon={<Save size={14} />}>{isEdit ? "Update Student" : "Save Student"}</Button>
        )}
      </PageHeader>

      {/* All fields live inside a fieldset so view mode can disable them all at once. */}
      <fieldset disabled={isView} className="space-y-4 w-full min-w-0 border-0 p-0 m-0">

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
            {!isView && (
              <>
                <label className={`text-[12px] font-medium ${uploading ? "text-slate-400 cursor-wait" : "text-indigo-600 hover:text-indigo-700 cursor-pointer"}`}>
                  {uploading ? "Uploading…" : form.photo ? "Change photo" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-400"
                >
                  <Camera size={13} /> Use camera
                </button>
                <span className="text-[10px] text-slate-400">JPG/PNG · take a photo or upload</span>
              </>
            )}
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
            options={[...new Set([...sessionOptions, form.session].filter(Boolean))].map((s) => ({ value: s, label: s }))} />
          <Select label="Fee Plan *" value={form.feePlan} onChange={set("feePlan")}
            options={FEE_PLANS.map((p) => ({ value: p, label: p }))} />
          <Select label="Class *" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value, sectionName: "" }))}
            options={[{ value: "", label: "Select..." }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section *" value={form.sectionName} onChange={set("sectionName")}
            options={[{ value: "", label: "Select Section" }, ...SECTIONS_AZ.map((s) => ({ value: s, label: s }))]} />
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

      </fieldset>

      {isView ? (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/students/list")}>Back to List</Button>
          <Button type="button" icon={<UserPlus size={14} />} onClick={() => navigate(`/students/add?id=${editId}`)}>Edit Student</Button>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(doneTo)}>Cancel</Button>
          <Button type="button" variant="outline" icon={<FileDown size={14} />} onClick={savePdf}>Save as PDF</Button>
          <Button type="submit" loading={isLoading} icon={<Save size={14} />}>{isEdit ? "Update" : "Submit"}</Button>
        </div>
      )}

      {/* Camera capture */}
      <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} title="Take a photo" size="md">
        <div className="space-y-4">
          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="secondary" icon={<SwitchCamera size={15} />}
              onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
              Flip
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setCameraOpen(false)}>Cancel</Button>
              <Button type="button" icon={<Aperture size={15} />} onClick={capturePhoto}>Capture &amp; Upload</Button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Allow camera access when prompted. Camera requires HTTPS (works on localhost).
          </p>
        </div>
      </Modal>
    </form>
  );
}
