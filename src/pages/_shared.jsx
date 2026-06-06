// Shared micro-components reused across pages
export const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
export const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

export function PageTitle({ title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
      <h1 className="text-[15px] font-bold text-slate-800">{title}</h1>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="px-5 border-b border-slate-100 flex gap-0 overflow-x-auto">
      {tabs.map(t => (
        <button key={t.k} onClick={() => onChange(t.k)}
          className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
            ${active === t.k ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          <span className="text-xs">{t.i || "☰"}</span> {t.l}
        </button>
      ))}
    </div>
  );
}

export function ExportBar({ search, setSearch }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-1">
        {["©","C","E","P","🖨","⊞"].map((ic,i)=>(
          <button key={i} className="p-1.5 w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 text-xs font-bold">{ic}</button>
        ))}
      </div>
      {setSearch !== undefined && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">🔍</span>
          <input value={search||""} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
            className="pl-7 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"/>
        </div>
      )}
    </div>
  );
}

export function Pagination({ page, total, setPage, count, from, to }) {
  return (
    <div className="flex items-center justify-between mt-3 text-xs text-slate-500 flex-wrap gap-2">
      <span>Showing {from} to {to} of {count} entries</span>
      <div className="flex items-center gap-2">
        <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"><option>25</option><option>50</option></select>
        <span>rows per page</span>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40">‹</button>
        {[...Array(total)].map((_,i)=>(
          <button key={i} onClick={()=>setPage(i+1)} className={`w-7 h-7 rounded text-[11px] font-semibold ${page===i+1?"bg-indigo-600 text-white":"hover:bg-slate-100 text-slate-600"}`}>{i+1}</button>
        ))}
        <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40">›</button>
      </div>
    </div>
  );
}

export function FilterCard({ children, title="Select Ground" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
      <h3 className="text-sm font-semibold text-slate-600 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function Card2({ children, className="" }) {
  return <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>{children}</div>;
}

export function SaveBtn({ onClick, label="Save", icon="+" }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors">
      <span>{icon}</span> {label}
    </button>
  );
}

export function Field3({ label, req, children }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium pt-2 text-right">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

export const CLASSES = ["Play","Nursery","LKG","UKG",...Array.from({length:12},(_,i)=>`Class ${i+1}`)];
export const SECTIONS = ["A","B","C","D","E"];
