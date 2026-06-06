/**
 * UnitPage.jsx
 * Module : inventory
 * Page   : Unit (Add Unit + Unit List) — matches screenshot 1
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";

const INITIAL_UNITS = [
  { id: 1, branch: "GenEduServe", name: "Piece" },
  { id: 2, branch: "GenEduServe", name: "BANDAL" },
];

export default function UnitPage() {
  usePageTitle("Unit");

  const [units, setUnits] = useState(INITIAL_UNITS);
  const [unitName, setUnitName] = useState("");
  const [editing, setEditing] = useState(null);

  const handleSave = () => {
    if (!unitName.trim()) return;
    if (editing) {
      setUnits((u) => u.map((r) => r.id === editing.id ? { ...r, name: unitName } : r));
      setEditing(null);
    } else {
      setUnits((u) => [...u, { id: Date.now(), branch: "GenEduServe", name: unitName }]);
    }
    setUnitName("");
  };

  const handleEdit = (row) => { setEditing(row); setUnitName(row.name); };
  const handleDelete = (id) => setUnits((u) => u.filter((r) => r.id !== id));

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Unit management" icon="📦" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Add Unit */}
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                ✏ {editing ? "Edit Unit" : "Add Unit"}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <Input
                label="Unit Name *"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder=""
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">✚ Save</Button>
                {editing && (
                  <Button variant="secondary" size="sm" onClick={() => { setEditing(null); setUnitName(""); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Unit List */}
        <div className="lg:col-span-2">
          <Card title="Unit List">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-14">SL</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {units.map((row, i) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{i + 1}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.branch}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEdit(row)} className="w-7 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center text-xs">✏</button>
                          <button onClick={() => handleDelete(row.id)} className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {units.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
