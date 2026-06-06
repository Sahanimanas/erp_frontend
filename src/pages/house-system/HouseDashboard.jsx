/**
 * HouseDashboard.jsx
 * Module : house-system
 * Page   : House Dashboard + Create House (single page, view toggle)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { Zap, Home, Users, Tag, Activity, Save, X } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS  = ["2024","2025","2026","2027"];
const TEACHERS = ["— none —","Mr. Ramesh K.","Ms. Priya S.","Mr. Anil M.","Ms. Sunita J.","Mr. Vivek G."];

const DEFAULT_HOUSE = { name:"", color:"#3b3fe8", motto:"", emblem:null, teacherInCharge:"— none —", viceTeacher:"— none —", sortOrder:0 };

function CreateHouseForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT_HOUSE });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
      {/* Section header */}
      <h3 className="text-sm font-semibold text-slate-700 mb-6 flex items-center gap-2">
        <Home size={14} className="text-indigo-500" /> Create House
      </h3>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          />
          {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Color */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Color</label>
          <input
            type="color"
            value={form.color}
            onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
            className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
          />
        </div>

        {/* Motto */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Motto</label>
          <input
            value={form.motto}
            onChange={e => setForm(p => ({ ...p, motto: e.target.value }))}
            placeholder="e.g., Strength and Honor"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Emblem */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emblem <span className="text-slate-400 font-normal">(PNG / JPG)</span></label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={e => setForm(p => ({ ...p, emblem: e.target.files[0] || null }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 file:mr-3 file:px-3 file:py-1 file:rounded file:border file:border-slate-300 file:text-xs file:bg-white file:text-slate-600 cursor-pointer"
          />
        </div>

        {/* Teacher In Charge */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Teacher In Charge</label>
          <div className="relative">
            <select
              value={form.teacherInCharge}
              onChange={e => setForm(p => ({ ...p, teacherInCharge: e.target.value }))}
              className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
            >
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
          </div>
        </div>

        {/* Vice Teacher */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vice Teacher</label>
          <div className="relative">
            <select
              value={form.viceTeacher}
              onChange={e => setForm(p => ({ ...p, viceTeacher: e.target.value }))}
              className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
            >
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={e => setForm(p => ({ ...p, sortOrder: +e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
        >
          <Save size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function HouseDashboard() {
  usePageTitle("House Dashboard");

  const [view, setView]     = useState("dashboard"); // "dashboard" | "create"
  const [houses, setHouses] = useState([]);

  // Quick Actions state
  const [qaHouse, setQaHouse]   = useState("");
  const [qaPoints, setQaPoints] = useState("");
  const [qaReason, setQaReason] = useState("");
  const [qaMonth, setQaMonth]   = useState("May");
  const [qaYear, setQaYear]     = useState("2026");
  const [qaExam, setQaExam]     = useState("");

  const handleSaveHouse = (form) => {
    setHouses(prev => [...prev, { ...form, id: Date.now() }]);
    setView("dashboard");
  };

  if (view === "create") {
    return (
      <div>
        {/* Page title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center text-base">🏠</div>
          <h1 className="text-[15px] font-bold text-slate-800">Create House</h1>
        </div>
        <CreateHouseForm onSave={handleSaveHouse} onCancel={() => setView("dashboard")} />
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">House Dashboard</h1>
      </div>

      {/* House Leaderboard Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            🏆 House Leaderboard
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setView("create")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
            >
              + Create House
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg">
              <Users size={13} /> Members
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg">
              <Tag size={13} /> Categories
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg">
              <Activity size={13} /> Activities
            </button>
          </div>
        </div>

        <div className="px-5 py-10 text-center text-sm text-slate-400">
          {houses.length === 0 ? "No Houses Created Yet" : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {houses.map((h) => (
                <div key={h.id} className="rounded-xl border border-slate-100 p-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-4" style={{ borderColor: h.color, background: h.color + "22" }} />
                  <p className="text-sm font-bold text-slate-800">{h.name}</p>
                  {h.motto && <p className="text-[11px] text-slate-400 italic">{h.motto}</p>}
                  <p className="text-xs text-slate-500">0 pts</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <Zap size={14} className="text-amber-500" /> Quick Actions
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Award Bonus Or Deduction */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-4 uppercase tracking-wider">Award Bonus Or Deduction</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">House</label>
                <div className="relative">
                  <select
                    value={qaHouse}
                    onChange={e => setQaHouse(e.target.value)}
                    className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
                  >
                    <option value="">— Select —</option>
                    {houses.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Points <span className="text-slate-400 font-normal">(negative for deduction)</span></label>
                <input
                  type="number"
                  value={qaPoints}
                  onChange={e => setQaPoints(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Reason</label>
                <input
                  value={qaReason}
                  onChange={e => setQaReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg w-fit">
                <Save size={13} /> Apply
              </button>
            </div>
          </div>

          {/* Right — Run Auto Rules */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-4 uppercase tracking-wider">Run Auto Rules</p>
            <div className="flex flex-col gap-4">
              {/* Month + Year row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Month</label>
                  <div className="relative">
                    <select
                      value={qaMonth}
                      onChange={e => setQaMonth(e.target.value)}
                      className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
                    >
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
                  <input
                    type="number"
                    value={qaYear}
                    onChange={e => setQaYear(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Attendance button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg w-fit">
                ▶ Attendance
              </button>

              {/* Select exam + Exam Topper row */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Exam</label>
                  <div className="relative">
                    <select
                      value={qaExam}
                      onChange={e => setQaExam(e.target.value)}
                      className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700"
                    >
                      <option value="">— Select exam —</option>
                      <option>Mid Term</option>
                      <option>Final Term</option>
                      <option>Unit Test 1</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg whitespace-nowrap">
                  ▶ Exam Topper
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}