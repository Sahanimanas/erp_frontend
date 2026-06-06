/**
 * HouseCategories.jsx
 * Module : house-system
 * Page   : House Categories (Point Categories)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { Tag, Save, RotateCcw, Edit2, Trash2, ChevronDown } from "lucide-react";

const AUTO_RULE_OPTIONS = [
  "Manual (submitted by users)",
  "Attendance",
  "Exam Topper",
  "Sports",
  "Custom Rule",
];

const DEFAULT_FORM = {
  id: null,
  name: "",
  description: "",
  defaultPoints: 10,
  min: 0,
  max: 100,
  allowNegative: false,
  requiresCaptainApproval: true,
  requiresTeacherApproval: false,
  autoRule: "Manual (submitted by users)",
  icon: "star",
  sortOrder: 0,
};

export default function HouseCategories() {
  usePageTitle("House Categories");

  const [form, setForm]         = useState({ ...DEFAULT_FORM });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors]     = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    if (form.id !== null) {
      setCategories(prev => prev.map(c => c.id === form.id ? { ...form } : c));
    } else {
      setCategories(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setForm({ ...DEFAULT_FORM });
    setErrors({});
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_FORM });
    setErrors({});
  };

  const handleEdit = (cat) => setForm({ ...cat });

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
    if (form.id === id) handleReset();
  };

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">House Categories</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── LEFT: Add / Edit Form ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 w-full lg:w-[420px] shrink-0">
          <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <span className="text-slate-500">+</span> {form.id ? "Edit Category" : "Add Or Edit Category"}
          </h3>

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => set("description", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Default Points / Min / Max */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Default Points</label>
                <input type="number" value={form.defaultPoints} onChange={e => set("defaultPoints", +e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min</label>
                <input type="number" value={form.min} onChange={e => set("min", +e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max</label>
                <input type="number" value={form.max} onChange={e => set("max", +e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.allowNegative} onChange={e => set("allowNegative", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Allow negative (for deductions)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.requiresCaptainApproval} onChange={e => set("requiresCaptainApproval", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Requires captain approval
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.requiresTeacherApproval} onChange={e => set("requiresTeacherApproval", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Requires teacher-in-charge approval
              </label>
            </div>

            {/* Auto Rule */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Auto Rule</label>
              <div className="relative">
                <select
                  value={form.autoRule}
                  onChange={e => set("autoRule", e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
                >
                  {AUTO_RULE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Icon</label>
              <input
                value={form.icon}
                onChange={e => set("icon", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => set("sortOrder", +e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Save / Reset */}
          <div className="flex flex-col gap-2 mt-5">
            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">
              <Save size={13} /> Save
            </button>
            <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg">
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* ── RIGHT: Point Categories Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex-1 min-w-0">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Tag size={13} className="text-indigo-500" /> Point Categories
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-slate-50">
                  {["NAME","DEFAULT PTS","AUTO","APPROVAL","ACTION"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400">No categories yet</td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.defaultPoints}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">{c.autoRule}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {c.requiresCaptainApproval && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 w-fit">Captain</span>
                          )}
                          {c.requiresTeacherApproval && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 w-fit">Teacher</span>
                          )}
                          {!c.requiresCaptainApproval && !c.requiresTeacherApproval && (
                            <span className="text-slate-400 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-amber-50 text-amber-500"><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-72 shadow-2xl">
            <h3 className="font-bold mb-2 text-slate-800">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}