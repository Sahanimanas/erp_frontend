/**
 * AlumniListPage.jsx — Images 16 & 17
 * Image 16: Alumni - Manage Alumni (Passing Session*, Class*, Section, Filter)
 * Image 17: Alumni - Events (Events List table + Calendar widget)
 */
import { useState } from "react";
import { Filter, Plus, Edit2, Trash2 } from "lucide-react";
import { sel, PageTitle, Card2, CLASSES, SECTIONS } from "../_shared";

const SESSIONS = ["2026-2027","2025-2026","2024-2025","2023-2024","2022-2023"];

function ManageAlumni() {
  const [session, setSession] = useState("2026-2027");
  const [cls, setCls] = useState(""); const [sec, setSec] = useState("");
  const [filtered, setFiltered] = useState(false);

  return (
    <div>
      <PageTitle title="Alumni"/>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Select Ground</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Passing Session <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={session} onChange={e=>setSession(e.target.value)}>
              {SESSIONS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Class <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={cls} onChange={e=>{setCls(e.target.value);setSec("")}}>
              <option value="">Select</option>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Section</label>
            <select className={sel} value={sec} onChange={e=>setSec(e.target.value)}>
              <option value="">Select Class First</option>
              {cls && SECTIONS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={()=>setFiltered(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
            <Filter size={13}/> Filter
          </button>
        </div>
      </div>
      {filtered && (
        <Card2>
          <div className="p-8 text-center text-slate-400 text-sm">No alumni found for {session} {cls && `- ${cls}`}{sec && ` Section ${sec}`}.</div>
        </Card2>
      )}
    </div>
  );
}

function AlumniEvents() {
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(4); // May
  const [year, setYear] = useState(2026);
  const [view, setView] = useState("Month");

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [...Array(adjustedFirst).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while(cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  return (
    <div>
      <PageTitle title="Alumni"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Events List */}
        <Card2>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">🕐 Events List</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
              <Plus size={12}/> Add Events
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"><option>25</option></select>
                <span className="text-xs text-slate-500">rows per page</span>
              </div>
              <input className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg w-40 focus:outline-none" placeholder="Search..."/>
            </div>
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50">
                  {["#","TITLE","PHOTO","DATE","AUDIENCE","ACTION"].map(h=>(
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {events.length===0
                    ? <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-slate-400">No data available in table</td></tr>
                    : events.map((e,i)=>(
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-3 text-slate-500">{i+1}</td>
                        <td className="px-3 py-3 font-semibold">{e.title}</td>
                        <td className="px-3 py-3">—</td>
                        <td className="px-3 py-3 text-slate-600">{e.date}</td>
                        <td className="px-3 py-3 text-slate-600">{e.audience||"All"}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <button className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={12}/></button>
                            <button onClick={()=>setEvents(p=>p.filter(x=>x.id!==e.id))} className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Showing 0 to {events.length} of {events.length} entries</span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-slate-100">‹</button>
                <button className="p-1 rounded hover:bg-slate-100">›</button>
              </div>
            </div>
          </div>
        </Card2>

        {/* Calendar */}
        <Card2>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded hover:bg-slate-100 text-slate-600">‹</button>
                <button onClick={nextMonth} className="p-1.5 rounded hover:bg-slate-100 text-slate-600">›</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{setMonth(new Date().getMonth());setYear(new Date().getFullYear());}}
                  className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50">Today</button>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>📅</span> {MONTH_NAMES[month]} {year}
                </span>
              </div>
              <div className="flex gap-1">
                {["Month","Week","Day","List"].map(v=>(
                  <button key={v} onClick={()=>setView(v)}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors
                      ${view===v?"bg-amber-500 text-white":"border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px border border-slate-100 rounded-xl overflow-hidden">
              {DAY_NAMES.map(d=>(
                <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 bg-slate-50">{d}</div>
              ))}
              {cells.map((d,i)=>(
                <div key={i} className={`min-h-[70px] border-t border-slate-100 p-1.5 text-xs
                  ${d===null?"bg-slate-50/50":"bg-white hover:bg-indigo-50/30 cursor-pointer"}
                  ${d===27&&month===4?"bg-yellow-50":""}`}>
                  {d && (
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-[11px] font-medium
                      ${d===27&&month===4?"bg-yellow-200 text-amber-800":"text-slate-600"}`}>
                      {d}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card2>
      </div>
    </div>
  );
}

export default function AlumniListPage() {
  const [section, setSection] = useState("manage");
  return (
    <div>
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {[{k:"manage",l:"Manage Alumni"},{k:"events",l:"Events"}].map(t=>(
          <button key={t.k} onClick={()=>setSection(t.k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${section===t.k?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
            {t.l}
          </button>
        ))}
      </div>
      {section==="manage" ? <ManageAlumni/> : <AlumniEvents/>}
    </div>
  );
}
