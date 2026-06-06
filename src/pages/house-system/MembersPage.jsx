/**
 * HouseMembers.jsx
 * Module : house-system
 * Page   : House Members
 */
import { useState } from "react";
import { Filter, Shuffle, Search, ChevronDown } from "lucide-react";
import { usePageTitle } from "../../hooks";

const mockStudents = [
  { roll: 0, name: "JAYSAL KUMARI", classSection: "3 / A", regNo: "H1341", house: "", role: "Member" },
  { roll: 0, name: "RAGANI KUMARI", classSection: "3 / B", regNo: "F732",  house: "", role: "Member" },
  { roll: 0, name: "ANMOL SHARMA",  classSection: "3 / C", regNo: "G1133", house: "", role: "Member" },
  { roll: 0, name: "ARYAN KUMAR",   classSection: "2 / B", regNo: "I1706", house: "", role: "Member" },
  { roll: 0, name: "SHERYA KUMARI", classSection: "3 / C", regNo: "F731",  house: "", role: "Member" },
  { roll: 0, name: "KRITY SINGH",   classSection: "3 / D", regNo: "J1877", house: "", role: "Member" },
  { roll: 0, name: "ANISH KUMAR",   classSection: "2 / D", regNo: "J2167", house: "", role: "Member" },
];

const houseOptions = ["— None —", "Red House", "Blue House", "Green House", "Yellow House"];
const roleOptions  = ["Member", "Captain", "Vice Captain"];
const classOptions = ["1","2","3","4","5","6","7","8","9","10"];

function Sel({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function HouseMembers() {
  usePageTitle("House Members");

  const [students, setStudents]           = useState(mockStudents);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [keepSiblings, setKeepSiblings]   = useState(true);

  const handleHouseChange = (index, value) =>
    setStudents(prev => prev.map((s, i) => i === index ? { ...s, house: value } : s));

  const handleRoleChange = (index, value) =>
    setStudents(prev => prev.map((s, i) => i === index ? { ...s, role: value } : s));

  const handleRunAssignment = () =>
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        house: houseOptions[Math.floor(Math.random() * (houseOptions.length - 1)) + 1],
      }))
    );

  const filtered = students.filter(s => {
    if (selectedClass && !s.classSection.startsWith(selectedClass + " /")) return false;
    if (selectedSection && !s.classSection.endsWith("/ " + selectedSection)) return false;
    return true;
  });

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">House Members</h1>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Filter size={13} className="text-indigo-500" /> Filter
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <Sel
            label="Class"
            value={selectedClass}
            onChange={v => { setSelectedClass(v); setSelectedSection(""); }}
            options={["Select", ...classOptions]}
          />
          <Sel
            label="Section"
            value={selectedSection}
            onChange={setSelectedSection}
            options={selectedClass ? ["Pick class first", "A", "B", "C", "D"] : ["Pick class first"]}
            disabled={!selectedClass}
          />
          <div className="flex items-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg w-full justify-center">
              <Search size={13} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Random Assignment Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Shuffle size={13} className="text-indigo-500" /> Bulk Random Assignment
        </h3>
        <p className="text-xs text-slate-400 mb-4">Assigns Unassigned Students Randomly Siblings Together</p>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={keepSiblings}
              onChange={e => setKeepSiblings(e.target.checked)}
              className="accent-indigo-600 w-4 h-4"
            />
            Keep Siblings In Same House
          </label>
          <button
            onClick={handleRunAssignment}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg"
          >
            ⚡ Run Random Assignment
          </button>
        </div>
      </div>

      {/* Students Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">👥 Students ({filtered.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50">
                {["ROLL", "NAME", "CLASS / SECTION", "REG NO", "HOUSE", "ROLE"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-400">
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{s.roll}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.classSection}</td>
                    <td className="px-4 py-3 text-slate-600">{s.regNo}</td>

                    {/* House dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={s.house || ""}
                          onChange={e => handleHouseChange(i, e.target.value)}
                          className="appearance-none border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700 pr-7 min-w-[130px] cursor-pointer"
                        >
                          {houseOptions.map(h => (
                            <option key={h} value={h === "— None —" ? "" : h}>{h}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </td>

                    {/* Role dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={s.role}
                          onChange={e => handleRoleChange(i, e.target.value)}
                          className="appearance-none border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 bg-white text-slate-700 pr-7 min-w-[120px] cursor-pointer"
                        >
                          {roleOptions.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
  );
}
