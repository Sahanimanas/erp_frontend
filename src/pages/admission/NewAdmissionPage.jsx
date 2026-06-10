/**
 * NewAdmissionPage.jsx
 * Module : admission
 * Page   : Create Admission
 *
 * Create Admission uses the full student admission form (Basic · Academic ·
 * Admission · Hostel · Transport · Parent/Communication · Documents) — the same
 * form as Add Student, with Cloudinary photo + document upload and submission to
 * POST /students. Reusing it keeps both entry points in sync.
 */
import AddStudentForm from "../students/AddStudentPage";

export default function NewAdmissionPage() {
  return <AddStudentForm title="Create Admission" subtitle="Admit a new student" redirectTo="/admission/list" />;
}
