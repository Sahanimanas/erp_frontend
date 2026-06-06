/**
 * SendEmailPage.jsx — Image 8: SMS/Email Reports
 * Campaign Type*, Send Type* (Both default), Date range, Filter
 */
import { useState } from "react";
import { Filter } from "lucide-react";
import { sel, PageTitle, Card2 } from "../_shared";

export default function SendEmailPage() {
  const [campType, setCampType] = useState("");
  const [sendType, setSendType] = useState("Both");
  const [date] = useState("2026/05/21 - 2026/05/27");
  const [filtered, setFiltered] = useState(false);

  return (
    <div>
      <PageTitle title="Bulk Sms And Email"/>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Select Ground</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Campaign Type <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={campType} onChange={e=>setCampType(e.target.value)}>
              <option value="">Select</option>
              <option>SMS Campaign</option><option>Email Campaign</option><option>Both</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Send Type <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={sendType} onChange={e=>setSendType(e.target.value)}>
              <option>Both</option><option>Sent</option><option>Scheduled</option><option>Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date <span className="text-red-500 normal-case">*</span></label>
            <div className="flex">
              <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400">📅</span>
              <input readOnly className="flex-1 border border-slate-200 rounded-r-lg px-3 py-2 text-sm bg-white focus:outline-none" value={date}/>
            </div>
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
          <div className="p-8 text-center text-slate-400 text-sm">No campaign reports found for the selected criteria.</div>
        </Card2>
      )}
    </div>
  );
}
