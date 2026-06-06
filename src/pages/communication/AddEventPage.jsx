// Student Birthday
import { useState } from "react";
import { Filter } from "lucide-react";
import { PageTitle, Card2 } from "../_shared";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

export default function AddEventPage() {
  const [filtered, setFiltered] = useState(false);
  const [date] = useState("2026/05/27 - 2026/05/27");
  return (
    <div>
      <PageTitle title="Student Date Of Birth List"/>
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
          <button onClick={()=>setFiltered(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm"><Filter size={13}/> Filter</button>
        </div>
      </div>
      {filtered && <Card2><div className="p-8 text-center text-slate-400 text-sm">No student birthdays for the selected date range.</div></Card2>}
    </div>
  );
}
