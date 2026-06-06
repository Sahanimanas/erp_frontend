/**
 * EventListPage.jsx — Student & Staff Birthday DOB List (Images 13 & 14)
 * Also handles Events List (from earlier)
 */
import { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { PageTitle, Card2 } from "../_shared";

function BirthdayFilter({ title }) {
  const [date] = useState("2026/05/27 - 2026/05/27");
  const [filtered, setFiltered] = useState(false);
  return (
    <div>
      <PageTitle title={title}/>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Select Ground</h3>
        <div className="max-w-md mx-auto">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date <span className="text-red-500 normal-case">*</span></label>
          <div className="flex">
            <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400">📅</span>
            <input readOnly className="flex-1 border border-slate-200 rounded-r-lg px-3 py-2 text-sm bg-white" value={date}/>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={()=>setFiltered(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
            <Filter size={13}/> Filter
          </button>
        </div>
      </div>
      {filtered && (
        <Card2><div className="p-8 text-center text-slate-400 text-sm">No birthdays found for the selected date range.</div></Card2>
      )}
    </div>
  );
}

// Export a default that handles both student and staff birthday from URL
export default function EventListPage() {
  // Check if this is the alumni events page
  const { pathname } = useLocation();
  const isAlumniEvent = pathname.includes("alumni");
  if (isAlumniEvent) {
    return <AlumniEvents/>;
  }
  // Default: student birthday
  return <BirthdayFilter title="Student Date Of Birth List"/>;
}

function AlumniEvents() {
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(4); // May = index 4
  const [year, setYear] = useState(2026);

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const adjustedFirst = (firstDay === 0 ? 6 : firstDay - 1); // Mon=0
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const cells = [...Array(adjustedFirst).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while(cells.length % 7 !== 0) cells.push(null);

  const today = 27;

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
              <input className="pl-3 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-40 focus:outline-none" placeholder="Search..."/>
            </div>
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50">
                  {["#","TITLE","PHOTO","DATE","AUDIENCE","ACTION"].map(h=>(
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-slate-400">No data available in table</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Showing 0 entries</span>
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
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }} className="p-1.5 rounded hover:bg-slate-100">‹</button>
              <div className="flex items-center gap-3">
                <button onClick={()=>{setMonth(new Date().getMonth());setYear(new Date().getFullYear());}} className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50">Today</button>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">📅 {months[month]} {year}</span>
                <div className="flex gap-1">
                  {["Month","Week","Day","List"].map(v=>(
                    <button key={v} className={`px-2.5 py-1 text-xs rounded font-medium ${v==="Month"?"bg-amber-500 text-white":"border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <button onClick={()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }} className="p-1.5 rounded hover:bg-slate-100">›</button>
            </div>
            <div className="grid grid-cols-7 gap-px">
              {days.map(d=><div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>)}
              {cells.map((d,i)=>(
                <div key={i} className={`min-h-[70px] border border-slate-100 p-1 text-xs
                  ${d===null?"bg-slate-50":"bg-white hover:bg-slate-50"}
                  ${d===today && month===4?"bg-yellow-50":""}`}>
                  {d && <span className={`font-medium ${d===today&&month===4?"text-amber-600":"text-slate-600"}`}>{d}</span>}
                </div>
              ))}
            </div>
          </div>
        </Card2>
      </div>
    </div>
  );
}
