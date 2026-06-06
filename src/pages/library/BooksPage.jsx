/**
 * BooksPage.jsx — Images 18 & 19
 * Books List: SL, BOOK TITLE, COVER, EDITION, ISBN NO, CATEGORY, DESCRIPTION, PURCHASE DATE, PRICE, TOTAL STOCK, ISSUED COPIES, ACTION
 * Create Book: Book Title*, Book ISBN No, Author, Edition, Purchase Date*, Book Category*, Publisher*, Description, Price*, Cover Image (drag/drop), Total Stock*
 */
import { useState } from "react";
import { Edit2, Trash2, Plus, Upload } from "lucide-react";
import { inp, sel, PageTitle, Card2, TabBar, ExportBar, Pagination } from "../_shared";

const CATEGORIES = ["Fiction","Non-Fiction","Science","Mathematics","History","Geography","Literature","Computer Science","Reference","Other"];

function CreateBook({ onSave, onCancel }) {
  const [form, setForm] = useState({
    title:"", isbn:"", author:"", edition:"",
    purchaseDate:"2026-05-27", category:"", publisher:"",
    description:"", price:"", totalStock:"0"
  });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const F = ({label,req,children}) => (
    <div className="grid grid-cols-3 items-center gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium text-right">{label}{req&&<span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <F label="Book Title" req><input className={inp} value={form.title} onChange={set("title")}/></F>
      <F label="Book ISBN No"><input className={inp} value={form.isbn} onChange={set("isbn")}/></F>
      <F label="Author"><input className={inp} value={form.author} onChange={set("author")}/></F>
      <F label="Edition"><input className={inp} value={form.edition} onChange={set("edition")}/></F>
      <F label="Purchase Date" req><input className={inp} type="date" value={form.purchaseDate} onChange={set("purchaseDate")}/></F>
      <F label="Book Category" req>
        <select className={sel} value={form.category} onChange={set("category")}>
          <option value="">Select</option>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </F>
      <F label="Publisher" req><input className={inp} value={form.publisher} onChange={set("publisher")}/></F>
      <F label="Description"><input className={inp} value={form.description} onChange={set("description")}/></F>
      <F label="Price" req><input className={inp} type="number" value={form.price} onChange={set("price")}/></F>
      <div className="grid grid-cols-3 items-start gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right pt-2">Cover Image</label>
        <div className="col-span-2">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center cursor-pointer hover:border-indigo-400 transition-colors">
            <Upload size={28} className="text-slate-400 mb-2"/>
            <p className="text-sm text-slate-500">Drag and drop a file here or click</p>
          </div>
        </div>
      </div>
      <F label="Total Stock" req>
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <input className="flex-1 px-3 py-2 text-sm focus:outline-none" type="number" min="0" value={form.totalStock} onChange={set("totalStock")}/>
          <div className="flex flex-col border-l border-slate-200">
            <button className="px-2 py-1 hover:bg-slate-50 text-slate-500 text-xs border-b border-slate-200" onClick={()=>setForm(p=>({...p,totalStock:String(parseInt(p.totalStock||0)+1)}))}>▲</button>
            <button className="px-2 py-1 hover:bg-slate-50 text-slate-500 text-xs" onClick={()=>setForm(p=>({...p,totalStock:String(Math.max(0,parseInt(p.totalStock||0)-1))}))}>▼</button>
          </div>
        </div>
      </F>
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={onCancel} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
        <button onClick={()=>{if(!form.title||!form.category||!form.publisher||!form.price)return;onSave(form);}}
          className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
          <Plus size={13}/> Save
        </button>
      </div>
    </div>
  );
}

const BOOK_COLS = ["SL","BOOK TITLE","COVER","EDITION","ISBN NO","CATEGORY","DESCRIPTION","PURCHASE DATE","PRICE","TOTAL STOCK","ISSUED COPIES","ACTION"];

export default function BooksPage() {
  const [tab, setTab] = useState("list");
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 25;

  const filtered = books.filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()));
  const total = Math.max(1, Math.ceil(filtered.length/PER));
  const rows = filtered.slice((page-1)*PER, page*PER);

  return (
    <div>
      <PageTitle title="Books"/>
      <Card2>
        <TabBar tabs={[{k:"list",l:"Books List",i:"☰"},{k:"create",l:"Create Book",i:"✎"}]} active={tab} onChange={setTab}/>
        {tab==="list" ? (
          <div className="p-5">
            <ExportBar search={search} setSearch={setSearch}/>
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead><tr className="bg-slate-50">
                  {BOOK_COLS.map(h=>(
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.length===0 ? (
                    <tr><td colSpan={BOOK_COLS.length} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                  ) : rows.map((r,i)=>(
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-3 text-slate-500">{(page-1)*PER+i+1}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{r.title}</td>
                      <td className="px-3 py-3">—</td>
                      <td className="px-3 py-3 text-slate-600">{r.edition||"—"}</td>
                      <td className="px-3 py-3 text-slate-600">{r.isbn||"—"}</td>
                      <td className="px-3 py-3 text-slate-600">{r.category}</td>
                      <td className="px-3 py-3 text-slate-600 max-w-[100px] truncate">{r.description||"—"}</td>
                      <td className="px-3 py-3 text-slate-600">{r.purchaseDate}</td>
                      <td className="px-3 py-3 text-slate-600">₹{r.price}</td>
                      <td className="px-3 py-3 text-slate-600">{r.totalStock}</td>
                      <td className="px-3 py-3 text-slate-600">0</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                          <button onClick={()=>setBooks(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} setPage={setPage} count={filtered.length}
              from={filtered.length===0?0:(page-1)*PER+1} to={Math.min(page*PER,filtered.length)}/>
          </div>
        ) : (
          <CreateBook
            onSave={f=>{setBooks(p=>[...p,{id:Date.now(),...f}]);setTab("list");}}
            onCancel={()=>setTab("list")}
          />
        )}
      </Card2>
    </div>
  );
}
