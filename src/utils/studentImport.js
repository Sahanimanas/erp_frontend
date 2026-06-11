/**
 * studentImport.js — shared helpers for bulk student import (Upload Student &
 * Admission → Multiple Import). Parses .xlsx/.xls/.csv via SheetJS, maps common
 * real-world headers to the backend's field names, and builds a sample template.
 */

// Canonical columns the backend importer understands.
export const STUDENT_IMPORT_COLUMNS = [
  "firstName", "lastName", "rollNumber", "gender", "dateOfBirth", "phone", "email", "section",
  "admissionNumber", "registrationNo", "feePlan", "bloodGroup", "category", "caste", "religion",
  "motherTongue", "aadharNumber", "penNumber", "apaarNo", "smartCardNo", "height", "weight", "remarks",
  "fatherName", "motherName", "fatherAadhar", "motherAadhar", "fatherOccupation", "motherOccupation",
  "fatherQualification", "motherQualification", "guardianName", "guardianPhone", "guardianEmail",
  "address", "permanentAddress", "city", "pincode",
  "hostelAllotted", "hostelName", "hostelRoomNo", "transportAllotted", "transportRoute", "busNo",
];

// Accept common header names exported by other systems → canonical fields.
const HEADER_ALIASES = {
  firstName: ["first name", "firstname"],
  lastName: ["last name", "lastname", "surname"],
  name: ["student name", "name", "full name", "student"],
  rollNumber: ["roll number", "roll no", "rollno", "roll", "class roll no", "class roll"],
  registrationNo: ["student id", "studentid", "student code", "reg no", "reg. no", "register no", "registration no", "registration number", "registration", "enrollment no", "enrolment no"],
  admissionNumber: ["admission no", "admission number", "adm no", "adm. no"],
  section: ["section", "sec"],
  gender: ["gender", "sex"],
  dateOfBirth: ["dob", "date of birth", "birth date", "birthday", "d.o.b", "dob (yyyy-mm-dd)"],
  admissionDate: ["admission date", "admissiondate", "joining date", "join date"],
  phone: ["contact no", "contact number", "contact", "phone", "phone no", "mobile", "mobile no", "mobile number", "phone number"],
  email: ["email", "email id", "e-mail", "mail"],
  fatherName: ["father name", "father's name", "fathers name", "father"],
  motherName: ["mother name", "mother's name", "mothers name", "mother"],
  guardianName: ["guardian name", "guardian", "guardianusername"],
  guardianPhone: ["guardian phone", "guardian contact", "guardian mobile"],
  aadharNumber: ["aadhar", "aadhaar", "aadhar number", "aadhar no", "aadhaar no"],
  penNumber: ["pen", "pen no", "p.e.n", "student pen"],
  apaarNo: ["apaar", "apaar no", "student apaar"],
  category: ["category", "student category", "categoryid"],
  caste: ["caste", "student caste"],
  religion: ["religion"],
  bloodGroup: ["blood group", "blood"],
  address: ["address", "current address"],
  permanentAddress: ["permanent address"],
  city: ["city"],
  pincode: ["pincode", "pin code", "zip"],
  className: ["class", "course", "class name", "course name"], // informational — class is chosen on the page
};
const norm = (h) => String(h).toLowerCase().trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
const LOOKUP = {};
for (const [canon, variants] of Object.entries(HEADER_ALIASES)) variants.forEach((v) => { LOOKUP[v] = canon; });

/** Map a raw sheet row (any headers) → canonical keys the backend reads. */
export function aliasStudentRow(raw) {
  const out = {};
  for (const [h, val] of Object.entries(raw)) {
    const key = LOOKUP[norm(h)];
    const v = typeof val === "string" ? val.trim() : val;
    if (key && (out[key] === undefined || out[key] === "")) out[key] = v;
    else if (!key) out[h] = v; // keep unknowns; backend ignores them
  }
  if (out.name && !out.firstName) {
    const parts = String(out.name).trim().split(/\s+/);
    out.firstName = parts[0];
    out.lastName = parts.slice(1).join(" ") || parts[0];
  }
  // Some sheets put the SECTION letter in the "Roll No" column and the real
  // unique id in "Student Id". If roll looks like a section letter and a unique
  // id exists, treat the letter as the section and the id as the roll number.
  if (out.registrationNo && /^[A-Za-z]{1,3}$/.test(String(out.rollNumber || ""))) {
    out.section = String(out.rollNumber);
    out.rollNumber = out.registrationNo;
  }
  // Fall back to the unique id as roll number when none was provided.
  if (!out.rollNumber && out.registrationNo) out.rollNumber = out.registrationNo;
  return out;
}

/** Parse an uploaded .xlsx/.xls/.csv file into an array of raw row objects. */
export async function parseStudentsFile(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
}

const SAMPLE_ROWS = [
  {
    firstName: "John", lastName: "Doe", rollNumber: "R001", gender: "Male", dateOfBirth: "2012-04-01",
    phone: "9876500001", email: "", section: "A", admissionNumber: "ADM2001", registrationNo: "REG2001",
    feePlan: "REGULAR", bloodGroup: "O+", category: "General", religion: "Hindu",
    fatherName: "Robert Doe", motherName: "Mary Doe", city: "Pune", pincode: "411001",
    hostelAllotted: "No", transportAllotted: "Yes", transportRoute: "Route 5", busNo: "MH12-AB-1234",
  },
  {
    firstName: "Jane", lastName: "Roe", rollNumber: "R002", gender: "Female", dateOfBirth: "2012-08-15",
    phone: "9876500002", email: "", section: "A", admissionNumber: "ADM2002", registrationNo: "REG2002",
    feePlan: "REGULAR", bloodGroup: "A+", category: "OBC", religion: "Hindu",
    fatherName: "Sam Roe", motherName: "Lisa Roe", city: "Pune", pincode: "411002",
    hostelAllotted: "Yes", hostelName: "Block A", hostelRoomNo: "A-101", transportAllotted: "No",
  },
];

/** Download an .xlsx sample template with every supported column. */
export async function downloadStudentSample(filename = "student-import-sample.xlsx") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: STUDENT_IMPORT_COLUMNS });
  ws["!cols"] = STUDENT_IMPORT_COLUMNS.map(() => ({ wch: 16 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, filename);
}
