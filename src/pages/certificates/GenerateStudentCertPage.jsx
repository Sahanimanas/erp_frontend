/**
 * GenerateStudentCertPage.jsx
 * Module : certificates
 * Page   : Student Certificate Generate — matches screenshots 10 & 11
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select } from "../../components/ui";

const CLASS_OPTIONS = [{ value: "", label: "Select" }, ...[...Array(12)].map((_, i) => ({ value: String(i+1), label: `Class ${i+1}` }))];
const TEMPLATES = ["TC", "Bonafide", "Character Certificate"];

export default function GenerateStudentCertPage() {
  usePageTitle("Student Certificate Generate");
  const [filters, setFilters] = useState({ class: "", section: "", template: "" });
  const [results, setResults] = useState(null);
  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));

  const handleFilter = () => {
    if (!filters.class || !filters.section || !filters.template) {
      alert("Please select Class, Section and Template.");
      return;
    }
    setResults([]);
  };

  return (
    <div>
      <PageHeader title="Student Certificate Generate" subtitle="Generate certificates for students" icon="📜" />
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Ground</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select label="Class *" value={filters.class} onChange={set("class")} options={CLASS_OPTIONS} />
          <Select label="Section *" value={filters.section} onChange={set("section")}
            options={[{ value: "", label: filters.class ? "Select" : "Select Class First" },
              ...( filters.class ? ["A","B","C","D"].map(s => ({ value: s, label: s })) : []) ]} />
          <Select label="Template *" value={filters.template} onChange={set("template")}
            options={[{ value: "", label: "Select" }, ...TEMPLATES.map(t => ({ value: t, label: t }))]} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button variant="secondary" onClick={handleFilter}>🔍 Filter</Button>
        </div>
      </Card>

      {results !== null && (
        <Card className="mt-4">
          <div className="px-4 py-10 text-center text-xs text-slate-400">
            {results.length === 0 ? "No students found for the selected criteria." : ""}
          </div>
        </Card>
      )}
    </div>
  );
}
