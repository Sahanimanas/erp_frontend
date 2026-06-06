/**
 * NewAdmissionPage.jsx
 * Module : admission
 * Page   : Create Admission (matches Create Admission form screenshot)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select } from "../../components/ui";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const GENDERS = ["Male", "Female", "Other"];

const currentYear = new Date().getFullYear();
const ACADEMIC_YEARS = [
  `${currentYear}-${currentYear + 1}`,
  `${currentYear - 1}-${currentYear}`,
];

export default function NewAdmissionPage() {
  usePageTitle("Create Admission");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    academicYear: ACADEMIC_YEARS[0],
    registerNo: "",
    roll: "",
    admissionDate: today,
    class: "",
    section: "",
    category: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    bloodGroup: "",
    dateOfBirth: "",
    religion: "",
    caste: "",
    mobileNo: "",
    email: "",
    city: "",
    state: "",
    presentAddress: "",
    permanentAddress: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    alert("Admission created successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Create Admission"
        subtitle="Student Admission"
        icon="🎓"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Academic Details */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
              🏫 Academic Details
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Academic Year *"
              value={form.academicYear}
              onChange={set("academicYear")}
              options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))}
            />
            <Input
              label="Register No *"
              placeholder=""
              value={form.registerNo}
              onChange={set("registerNo")}
              required
            />
            <Input
              label="Roll"
              placeholder=""
              value={form.roll}
              onChange={set("roll")}
            />
            <Input
              label="Admission Date *"
              type="date"
              value={form.admissionDate}
              onChange={set("admissionDate")}
              required
            />
            <Select
              label="Class *"
              value={form.class}
              onChange={set("class")}
              options={[
                ...[...Array(12)].map((_, i) => ({
                  value: String(i + 1),
                  label: `Class ${i + 1}`,
                })),
              ]}
            />
            <Select
              label="Section *"
              value={form.section}
              onChange={set("section")}
              options={
                form.class
                  ? ["A", "B", "C", "D"].map((s) => ({ value: s, label: s }))
                  : []
              }
              placeholder={form.class ? "Select" : "Select Class First"}
            />
            <Select
              label="Category *"
              value={form.category}
              onChange={set("category")}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </Card>

        {/* Student Details */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
              👤 Student Details
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="First Name *"
              placeholder=""
              value={form.firstName}
              onChange={set("firstName")}
              required
              icon={<span>👤</span>}
            />
            <Input
              label="Last Name *"
              placeholder=""
              value={form.lastName}
              onChange={set("lastName")}
              required
              icon={<span>👤</span>}
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={set("gender")}
              options={GENDERS.map((g) => ({ value: g, label: g }))}
            />
            <Select
              label="Blood Group"
              value={form.bloodGroup}
              onChange={set("bloodGroup")}
              options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))}
            />
            <Input
              label="Date Of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
            />
            <div /> {/* spacer */}
            <Input
              label="Religion"
              value={form.religion}
              onChange={set("religion")}
            />
            <Input
              label="Caste"
              value={form.caste}
              onChange={set("caste")}
            />
            <div /> {/* spacer */}
            <Input
              label="Mobile No"
              type="tel"
              value={form.mobileNo}
              onChange={set("mobileNo")}
              icon={<span>📞</span>}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              icon={<span>✉️</span>}
            />
            <Input
              label="City"
              value={form.city}
              onChange={set("city")}
            />
            <Input
              label="State"
              value={form.state}
              onChange={set("state")}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Present Address
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                rows={3}
                value={form.presentAddress}
                onChange={set("presentAddress")}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Permanent Address
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                rows={3}
                value={form.permanentAddress}
                onChange={set("permanentAddress")}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Admission
          </Button>
        </div>
      </form>
    </div>
  );
}
