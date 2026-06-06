/**
 * ConfigReceptionPage.jsx
 * URL: /reception/config  (and sub-paths)
 * Images 5,7,8,9,10: Reference | Response | Calling Purpose | Visiting Purpose | Complaint Type
 * Each tab: left panel = Add form, right panel = List table
 */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

// Determine initial tab from URL path
function getTabFromPath(path) {
  if (path.includes("response"))        return "response";
  if (path.includes("calling"))         return "calling";
  if (path.includes("visiting"))        return "visiting";
  if (path.includes("complaint"))       return "complaint";
  return "reference";
}

const TABS = [
  { key: "reference", label: "Reference",       icon: "☰" },
  { key: "response",  label: "Response",         icon: "✎" },
  { key: "calling",   label: "Calling Purpose",  icon: "✎" },
  { key: "visiting",  label: "Visiting Purpose", icon: "✎" },
  { key: "complaint", label: "Complaint Type",   icon: "✎" },
];

const PAGE_TITLES = {
  reference: "Reference",
  response:  "Response",
  calling:   "Calling Purpose",
  visiting:  "Visiting Purpose",
  complaint: "Complaint Type",
};

const FORM_TITLES = {
  reference: "Add Reference",
  response:  "Add Response",
  calling:   "Add Calling Purpose",
  visiting:  "Add Visiting Purpose",
  complaint: "Complaint Type Visiting Purpose",
};

const LIST_TITLES = {
  reference: "Reference List",
  response:  "Response List",
  calling:   "Calling Purpose List",
  visiting:  "Visiting Purpose List",
  complaint: "Complaint Type List",
};

function ConfigPanel({ sectionKey, data, setData }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const save = () => {
    if (!name.trim()) return;
    setData(p => [...p, { id: Date.now(), name: name.trim() }]);
    setName("");
  };

  const update = (id) => {
    setData(p => p.map(x => x.id === id ? { ...x, name: editName } : x));
    setEditId(null); setEditName("");
  };

  const hasData = data.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Add Form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
          <Edit2 size={14} className="text-slate-500" /> {FORM_TITLES[sectionKey]}
        </h3>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Name <span className="text-red-500 normal-case">*</span>
          </label>
          <input
            className={inp}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()}
            placeholder="Enter name"
          />
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={13} /> Save
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-sm text-slate-700 flex items-center gap-2">
          ☰ {LIST_TITLES[sectionKey]}
        </div>
        {!hasData ? (
          <div className="p-10 text-center text-sm font-semibold text-red-400">
            No Information Available
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">SL</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">NAME</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {editId === row.id ? (
                        <input
                          className={inp + " py-1"}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && update(row.id)}
                          autoFocus
                        />
                      ) : row.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {editId === row.id ? (
                          <button
                            onClick={() => update(row.id)}
                            className="p-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                          >
                            <Plus size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setEditId(row.id); setEditName(row.name); }}
                            className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setData(p => p.filter(x => x.id !== row.id))}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfigReceptionPage() {
  const location = useLocation();
  const [active, setActive] = useState(getTabFromPath(location.pathname));

  const [reference, setReference] = useState([]);
  const [response,  setResponse]  = useState([]);
  const [calling,   setCalling]   = useState([]);
  const [visiting,  setVisiting]  = useState([]);
  const [complaint, setComplaint] = useState([{ id: 1, name: "Suraj Bhan Singh" }]);

  const stores  = { reference, response, calling, visiting, complaint };
  const setters = { reference: setReference, response: setResponse, calling: setCalling, visiting: setVisiting, complaint: setComplaint };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">{PAGE_TITLES[active]}</h1>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 pt-0 border-b border-slate-100 flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                ${active === t.key
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <span className="text-xs">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          <ConfigPanel
            key={active}
            sectionKey={active}
            data={stores[active]}
            setData={setters[active]}
          />
        </div>
      </div>
    </div>
  );
}
