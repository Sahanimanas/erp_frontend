/**
 * DepartmentsPage.jsx
 * Module : hr
 * Page   : Add Department + Designation (matches screenshots 6 & 7)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Badge } from "../../components/ui";

const INITIAL_DEPARTMENTS = [
  { id: 1, branch: "GenEduServe", name: "MATHS" },
  { id: 2, branch: "GenEduServe", name: "SCIENCE" },
  { id: 3, branch: "GenEduServe", name: "HINDI" },
  { id: 4, branch: "GenEduServe", name: "ENGLISH" },
  { id: 5, branch: "GenEduServe", name: "SST" },
  { id: 6, branch: "GenEduServe", name: "TRANSPORT" },
  { id: 7, branch: "GenEduServe", name: "HOUSE KEEPING" },
  { id: 8, branch: "GenEduServe", name: "COOK" },
  { id: 9, branch: "GenEduServe", name: "LIBRARIAN" },
  { id: 10, branch: "GenEduServe", name: "ACCOUNTANT" },
  { id: 11, branch: "GenEduServe", name: "SECURITY" },
  { id: 12, branch: "GenEduServe", name: "COMPUTER" },
  { id: 13, branch: "GenEduServe", name: "PRIMARY SECTION (Class 1-5)" },
  { id: 14, branch: "GenEduServe", name: "MIDDLE SECTION (Class 6-8)" },
];

const INITIAL_DESIGNATIONS = [
  { id: 1, branch: "GenEduServe", name: "CHAIRMAN" },
  { id: 2, branch: "GenEduServe", name: "DIRECTOR" },
  { id: 3, branch: "GenEduServe", name: "SECRETARY" },
  { id: 4, branch: "GenEduServe", name: "VICE PRINCIPAL" },
  { id: 5, branch: "GenEduServe", name: "PGT (Post Graduate Teacher)" },
  { id: 6, branch: "GenEduServe", name: "TGT (Trained Graduate Teacher)" },
  { id: 7, branch: "GenEduServe", name: "NTT (Nursery Teacher)" },
  { id: 8, branch: "GenEduServe", name: "COMPUTER TEACHER" },
  { id: 9, branch: "GenEduServe", name: "PET (Physical Education Teacher)" },
  { id: 10, branch: "GenEduServe", name: "Special Educator" },
  { id: 11, branch: "GenEduServe", name: "ACCOUNTANT" },
  { id: 12, branch: "GenEduServe", name: "ACCOUNTS ASSISTANT" },
  { id: 13, branch: "GenEduServe", name: "CASHIER" },
  { id: 14, branch: "GenEduServe", name: "TRANSPORT MANAGER" },
];

function ListTable({ rows, onDelete, onEdit }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12">SL</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3 text-[12.5px] text-slate-700">{i + 1}</td>
              <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.branch}</td>
              <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.name}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(row)}
                    className="w-7 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-colors"
                    title="Edit"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs transition-colors"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function DepartmentsPage() {
  usePageTitle("Departments & Designations");

  const [activeTab, setActiveTab] = useState("department");
  const [deptName, setDeptName] = useState("");
  const [desgName, setDesgName] = useState("");
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS);
  const [editingDept, setEditingDept] = useState(null);
  const [editingDesg, setEditingDesg] = useState(null);

  const handleSaveDept = () => {
    if (!deptName.trim()) return;
    if (editingDept) {
      setDepartments((d) =>
        d.map((r) => (r.id === editingDept.id ? { ...r, name: deptName } : r))
      );
      setEditingDept(null);
    } else {
      setDepartments((d) => [
        ...d,
        { id: Date.now(), branch: "GenEduServe", name: deptName.toUpperCase() },
      ]);
    }
    setDeptName("");
  };

  const handleSaveDesg = () => {
    if (!desgName.trim()) return;
    if (editingDesg) {
      setDesignations((d) =>
        d.map((r) => (r.id === editingDesg.id ? { ...r, name: desgName } : r))
      );
      setEditingDesg(null);
    } else {
      setDesignations((d) => [
        ...d,
        { id: Date.now(), branch: "GenEduServe", name: desgName.toUpperCase() },
      ]);
    }
    setDesgName("");
  };

  return (
    <div>
      <PageHeader title="Employee" subtitle="Departments & Designations" icon="🏢" />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <Button
          variant={activeTab === "department" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("department")}
        >
          🏢 Departments
        </Button>
        <Button
          variant={activeTab === "designation" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("designation")}
        >
          🏷 Designations
        </Button>
      </div>

      {activeTab === "department" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Add Department Form */}
          <div className="lg:col-span-1">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  ✏ {editingDept ? "Edit Department" : "Add Department"}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <Input
                  label="Department Name *"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Enter department name"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveDept} size="sm">
                    ✚ {editingDept ? "Update" : "Save"}
                  </Button>
                  {editingDept && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditingDept(null); setDeptName(""); }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Department List */}
          <div className="lg:col-span-2">
            <Card title="Department List">
              <ListTable
                rows={departments}
                onDelete={(id) => setDepartments((d) => d.filter((r) => r.id !== id))}
                onEdit={(row) => { setEditingDept(row); setDeptName(row.name); }}
              />
            </Card>
          </div>
        </div>
      )}

      {activeTab === "designation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Add Designation Form */}
          <div className="lg:col-span-1">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  ✏ {editingDesg ? "Edit Designation" : "Add Designation"}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <Input
                  label="Designation Name *"
                  value={desgName}
                  onChange={(e) => setDesgName(e.target.value)}
                  placeholder="Enter designation name"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveDesg} size="sm">
                    ✚ {editingDesg ? "Update" : "Save"}
                  </Button>
                  {editingDesg && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditingDesg(null); setDesgName(""); }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Designation List */}
          <div className="lg:col-span-2">
            <Card title="Designation List">
              <ListTable
                rows={designations}
                onDelete={(id) => setDesignations((d) => d.filter((r) => r.id !== id))}
                onEdit={(row) => { setEditingDesg(row); setDesgName(row.name); }}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
