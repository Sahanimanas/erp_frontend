/**
 * HouseActivities.jsx
 * Module : house-system
 * Page   : House Activities
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { List, Plus, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];
const HOUSE_OPTIONS  = ["All", "Red House", "Blue House", "Green House", "Yellow House"];

const DEFAULT_ACTIVITY = {
  title: "", house: "", status: "Pending", points: 0, description: "",
};

function SubmitForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT_ACTIVITY });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.house)        e.house = "House is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, id: Date.now() });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Plus size={13} className="text-indigo-500" /> Submit Activity
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 text-xs">✕ Cancel</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 ${errors.title ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* House */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">House <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={form.house}
              onChange={e => setForm(p => ({ ...p, house: e.target.value }))}
              className={`w-full appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700 ${errors.house ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            >
              <option value="">— Select House —</option>
              {HOUSE_OPTIONS.filter(h => h !== "All").map(h => <option key={h}>{h}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {errors.house && <p className="text-[10px] text-red-500 mt-1">{errors.house}</p>}
        </div>

        {/* Points */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Points</label>
          <input
            type="number"
            value={form.points}
            onChange={e => setForm(p => ({ ...p, points: +e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
          <div className="relative">
            <select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
            >
              {["Pending","Approved","Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">
          <Plus size={13} /> Submit
        </button>
        <button onClick={onCancel} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
}

const SCOL = {
  Pending:  "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function HouseActivities() {
  usePageTitle("House Activities");

  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterHouse, setFilterHouse]   = useState("All");

  const handleSave = (activity) => {
    setActivities(prev => [activity, ...prev]);
    setShowForm(false);
  };

  const filtered = activities.filter(a => {
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    if (filterHouse  !== "All" && a.house  !== filterHouse)  return false;
    return true;
  });

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">House Activities</h1>
      </div>

      {/* Submit Activity Form */}
      {showForm && <SubmitForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {/* Card Header */}
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <List size={13} className="text-indigo-500" /> House Activities
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
          >
            <Plus size={13} /> Submit Activity
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
              >
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {/* House */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">House</label>
            <div className="relative">
              <select
                value={filterHouse}
                onChange={e => setFilterHouse(e.target.value)}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
              >
                {HOUSE_OPTIONS.map(h => <option key={h}>{h}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table / Empty */}
        {filtered.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-slate-400">No Activities Yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50">
                  {["SL","TITLE","HOUSE","POINTS","STATUS","DESCRIPTION"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{a.title}</td>
                    <td className="px-4 py-3 text-slate-600">{a.house}</td>
                    <td className="px-4 py-3 text-slate-600">{a.points}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SCOL[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{a.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}