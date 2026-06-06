/**
 * MultipleImportPage.jsx
 * Module : admission
 * Page   : Multiple Import (matches Multiple Import CSV screenshot)
 */
import { useState, useRef } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select } from "../../components/ui";

const CLASS_OPTIONS = [
  { value: "", label: "Select" },
  ...[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` })),
];

const instructions = [
  "Download the first sample file.",
  "Open the downloaded 'csv' file and carefully fill the details of the student.",
  "The date you are trying to enter the \"Birthday\" and \"AdmissionDate\" column make sure the date format is Y-m-d (2026-05-26).",
  "Do not import the duplicate \"Roll Number\" And \"Register No\".",
  "For student \"Gender\" use Male, Female value.",
  "If enable Automatically Generate login details, leave the \"username\" and \"password\" columns blank.",
];

const notes = [
  { label: "Category is optional", text: "— leave the \"CategoryID\" column blank (or remove it from the CSV) if you don't want to assign one." },
  { label: "Roll number is optional", text: "— leave the \"Roll\" column blank to auto-generate the next available roll for that class & section." },
  { label: "", text: "If a parent is existing / if you want to use the same parent information for multiple students only enter the \"GuardianUsername\" and leave other columns blank." },
];

export default function MultipleImportPage() {
  usePageTitle("Multiple Import");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const sectionOptions = selectedClass
    ? ["A", "B", "C", "D"].map((s) => ({ value: s, label: s }))
    : [];

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSection || !file) {
      alert("Please select class, section and upload a CSV file.");
      return;
    }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setUploading(false);
    alert(`Imported: ${file.name}`);
    setFile(null);
  };

  return (
    <div>
      <PageHeader
        title="Multiple Import"
        subtitle="Import students via CSV"
        icon="📥"
      />

      <Card>
        <div className="p-5 space-y-6">
          {/* Download button */}
          <div className="flex justify-end">
            <Button variant="secondary">
              ⬇ Download Sample Import File
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Instructions:</p>
              <ol className="space-y-1.5">
                {instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-slate-600 flex gap-2">
                    <span className="text-indigo-600 font-semibold flex-shrink-0">{i + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="text-xs text-slate-600">
                  {n.label && (
                    <span className="font-semibold text-indigo-600">{n.label}: </span>
                  )}
                  {n.text}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Select
              label="Class *"
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }}
              options={CLASS_OPTIONS}
            />
            <Select
              label="Section *"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              options={[
                { value: "", label: selectedClass ? "Select" : "Select Class First" },
                ...sectionOptions,
              ]}
              disabled={!selectedClass}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Select CSV File *
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                ${file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <span className="text-4xl">{file ? "📄" : "☁️"}</span>
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-indigo-700">{file.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Drag and drop a file here or click</p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {file && (
              <Button variant="secondary" onClick={() => setFile(null)}>
                Clear
              </Button>
            )}
            <Button loading={uploading} onClick={handleUpload}>
              Import Students
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
