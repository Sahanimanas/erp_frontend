/**
 * GenerateEmployeeCertPage.jsx
 * Module : certificates
 * Page   : Employee Certificate Generate — matches screenshot 12
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select } from "../../components/ui";

const ROLES = ["Admin","Teacher","Accountant","Librarian","Receptionist","4th Grade"];
const TEMPLATES = ["Experience Certificate","Appointment Letter","Relieving Letter"];

export default function GenerateEmployeeCertPage() {
  usePageTitle("Employee Certificate Generate");
  const [filters, setFilters] = useState({ role: "", template: "" });
  const [results, setResults] = useState(null);
  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <PageHeader title="Employee Certificate Generate" subtitle="Generate certificates for employees" icon="📜" />
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Ground</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Select label="Role *" value={filters.role} onChange={set("role")}
            options={[{ value: "", label: "Select" }, ...ROLES.map(r => ({ value: r, label: r }))]} />
          <Select label="Template *" value={filters.template} onChange={set("template")}
            options={[{ value: "", label: "Select" }, ...TEMPLATES.map(t => ({ value: t, label: t }))]} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button variant="secondary" onClick={() => setResults([])}>🔍 Filter</Button>
        </div>
      </Card>

      {results !== null && (
        <Card className="mt-4">
          <div className="px-4 py-10 text-center text-xs text-slate-400">
            {results.length === 0 ? "No employees found for the selected criteria." : ""}
          </div>
        </Card>
      )}
    </div>
  );
}
