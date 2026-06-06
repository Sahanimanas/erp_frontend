/**
 * GlobalSettingsPage — Images 2,3,4,5,6
 * Tabs: General Settings | Theme Settings | Logo | Upload file settings
 */
import { useState } from "react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

function PageTitle({ title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
      <h1 className="text-[15px] font-bold text-slate-800">{title}</h1>
    </div>
  );
}

const TABS = [
  { k:"general",  l:"General Settings",    i:"⚙" },
  { k:"theme",    l:"Theme Settings",       i:"🎨" },
  { k:"logo",     l:"Logo",                 i:"🔷" },
  { k:"upload",   l:"Upload file settings", i:"📁" },
];

// ─── Field helpers ────────────────────────────────────────────────────────────
function F({ label, req, children }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium pt-2 text-right">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function SaveBtn({ onClick }) {
  return (
    <div className="flex justify-center mt-6">
      <button onClick={onClick} className="flex items-center gap-2 px-8 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
        ➕ Save
      </button>
    </div>
  );
}

// ─── General Settings Tab (Images 2 & 3) ──────────────────────────────────────
function GeneralTab() {
  const [form, setForm] = useState({
    instituteName:"GenEduServe", institutionCode:"RSM-", mobile:"8507770022",
    address:"Noida", email:"GenEduServe@gmail.com", cmsBranch:"",
    cacheControl:"No", currency:"INR", currencySymbol:"₹",
    currencyFormat:"12300000.50", symbolPosition:"$123,000.00",
    language:"English", academicSession:"2025-2026",
    timezone:"(GMT+05:30) Asia, Kolkata", animations:"fadeInUp",
    preloaderBackend:"Yes", footerBranchSwitcher:"Yes",
    dateFormat:"dd.mmm.yyyy", footerText:"", facebookUrl:"",
    twitterUrl:"", linkedinUrl:"", youtubeUrl:""
  });
  const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <div className="max-w-2xl">
      <F label="Institute Name"><input className={inp} value={form.instituteName} onChange={set("instituteName")}/></F>
      <F label="Institution Code">
        <div>
          <input className={inp} value={form.institutionCode} onChange={set("institutionCode")}/>
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <span>🟡</span> The Institute Code will be used as the prefix for Student (Registration No).
          </p>
        </div>
      </F>
      <F label="Mobile No"><input className={inp} value={form.mobile} onChange={set("mobile")}/></F>
      <F label="Address"><textarea className={inp} rows={2} value={form.address} onChange={set("address")}/></F>
      <F label="Email"><input className={inp} type="email" value={form.email} onChange={set("email")}/></F>
      <F label="Cms Default Branch" req>
        <select className={sel} value={form.cmsBranch} onChange={set("cmsBranch")}>
          <option value="">Select</option><option>GenEduServe</option>
        </select>
      </F>
      <F label="Cache Control (Store)" req>
        <select className={sel} value={form.cacheControl} onChange={set("cacheControl")}>
          <option>No</option><option>Yes</option>
        </select>
      </F>
      <F label="Currency"><input className={inp} value={form.currency} onChange={set("currency")}/></F>
      <F label="Currency Symbol"><input className={inp} value={form.currencySymbol} onChange={set("currencySymbol")}/></F>
      <F label="Currency Formats" req>
        <select className={sel} value={form.currencyFormat} onChange={set("currencyFormat")}>
          <option>12300000.50</option><option>1,23,00,000.50</option><option>12,300,000.50</option>
        </select>
      </F>
      <F label="Symbol Position" req>
        <select className={sel} value={form.symbolPosition} onChange={set("symbolPosition")}>
          <option>$123,000.00</option><option>123,000.00$</option>
        </select>
      </F>
      <F label="Language">
        <select className={sel} value={form.language} onChange={set("language")}>
          <option>English</option><option>Hindi</option><option>Urdu</option>
        </select>
      </F>
      <F label="Academic Session">
        <select className={sel} value={form.academicSession} onChange={set("academicSession")}>
          {["2025-2026","2026-2027","2024-2025"].map(s=><option key={s}>{s}</option>)}
        </select>
      </F>
      <F label="Timezone">
        <select className={sel} value={form.timezone} onChange={set("timezone")}>
          <option>(GMT+05:30) Asia, Kolkata</option><option>(GMT+00:00) UTC</option>
        </select>
      </F>
      <F label="Animations">
        <select className={sel} value={form.animations} onChange={set("animations")}>
          <option>fadeInUp</option><option>fadeIn</option><option>slideInLeft</option><option>none</option>
        </select>
      </F>
      <F label="Preloader Backend">
        <select className={sel} value={form.preloaderBackend} onChange={set("preloaderBackend")}>
          <option>Yes</option><option>No</option>
        </select>
      </F>
      <F label="Footer Branch Switcher">
        <select className={sel} value={form.footerBranchSwitcher} onChange={set("footerBranchSwitcher")}>
          <option>Yes</option><option>No</option>
        </select>
      </F>
      <F label="Date Format" req>
        <select className={sel} value={form.dateFormat} onChange={set("dateFormat")}>
          <option>dd.mmm.yyyy</option><option>dd/mm/yyyy</option><option>mm/dd/yyyy</option><option>yyyy-mm-dd</option>
        </select>
      </F>
      <F label="Footer Text">
        <div>
          <input className={inp} value={form.footerText} onChange={set("footerText")} placeholder="© 2026 School Name"/>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">🔒 Centrally managed by GenSkyTech — not editable per school.</p>
        </div>
      </F>
      <F label="Facebook URL"><input className={inp} value={form.facebookUrl} onChange={set("facebookUrl")}/></F>
      <F label="Twitter URL"><input className={inp} value={form.twitterUrl} onChange={set("twitterUrl")}/></F>
      <F label="Linkedin URL"><input className={inp} value={form.linkedinUrl} onChange={set("linkedinUrl")}/></F>
      <F label="Youtube URL"><input className={inp} value={form.youtubeUrl} onChange={set("youtubeUrl")}/></F>
      <SaveBtn/>
    </div>
  );
}

// ─── Theme Settings Tab (Image 4) ─────────────────────────────────────────────
function ThemeTab() {
  const [theme, setTheme] = useState("dark"); const [border, setBorder] = useState("bordered");
  return (
    <div className="max-w-3xl">
      <F label="UI Theme Version">
        <select className={sel} defaultValue="v3">
          <option value="v3">v3 — Premium Indigo (modern)</option>
          <option value="v2">v2 — Classic</option>
        </select>
      </F>
      <p className="text-xs text-slate-500 mb-5 ml-[34%]">v3 me topbar/sidebar customizer panel enable hota hai (bottom-right gear icon). Switch karte hi saari pages pe naya design apply hoga.</p>
      <div className="grid grid-cols-3 items-start gap-4 mb-5">
        <label className="text-sm text-slate-600 font-medium pt-2 text-right">Theme</label>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {[{k:"light",label:"Light"},{k:"dark",label:"Dark"}].map(t=>(
            <div key={t.k} onClick={()=>setTheme(t.k)}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${theme===t.k?"border-amber-500":"border-slate-200"}`}>
              <div className={`h-32 ${t.k==="dark"?"bg-gray-900":"bg-white"} flex items-center justify-center`}>
                <div className="w-full h-full p-2">
                  <div className={`h-3 rounded mb-1 ${t.k==="dark"?"bg-gray-700":"bg-slate-200"}`}/>
                  <div className={`h-16 rounded ${t.k==="dark"?"bg-gray-800":"bg-slate-100"}`}/>
                </div>
              </div>
              {theme===t.k && <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 items-start gap-4 mb-5">
        <label className="text-sm text-slate-600 font-medium pt-2 text-right">Border</label>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {[{k:"borderless",label:"Borderless"},{k:"bordered",label:"Bordered"}].map(b=>(
            <div key={b.k} onClick={()=>setBorder(b.k)}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${border===b.k?"border-amber-500":"border-slate-200"}`}>
              <div className="h-24 bg-gray-900 flex items-center justify-center p-3">
                <div className={`w-full h-full rounded-lg flex items-center justify-between px-3 ${b.k==="bordered"?"border border-gray-600":""} bg-gray-800`}>
                  <div className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center"><span className="text-white text-xs">28</span></div>
                  <span className="text-gray-300 text-[10px]">Employees</span>
                </div>
              </div>
              {border===b.k && <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
            </div>
          ))}
        </div>
      </div>
      <SaveBtn/>
    </div>
  );
}

// ─── Logo Tab (Image 5) ────────────────────────────────────────────────────────
function LogoTab() {
  const UploadBox = ({label,hint}) => (
    <div className="flex flex-col items-center">
      <div className="w-full h-28 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors bg-slate-50 mb-1">
        <span className="text-2xl mb-1">☁</span>
        <span className="text-xs text-slate-500">Drag & drop or click</span>
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );

  return (
    <div>
      {/* PWA */}
      <div className="mb-6 p-5 border border-amber-200 bg-amber-50 rounded-xl">
        <h3 className="text-sm font-bold text-amber-700 mb-1">📱 PWA / Mobile App (Add to Home Screen)</h3>
        <p className="text-xs text-amber-600 mb-4">Yahan se aap PWA ka App Name, Short Name aur Icon set kar sakte hain. Save karte hi <code className="bg-amber-100 px-1 rounded">manifest.json</code> aur sabhi icon sizes (48–512) auto-generate ho jaate hain.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">App Name (Full Name)</label>
            <input className={inp} defaultValue="KPS KENDRIYA VIDYALAYA"/>
            <p className="text-xs text-slate-400 mt-1">Home screen icon ke neeche full naam.</p>
            <label className="block text-xs font-semibold text-slate-600 mb-1 mt-3">Short Name</label>
            <input className={inp} defaultValue="KPS"/>
            <p className="text-xs text-slate-400 mt-1">12 characters tak. Phone home screen pe yahi dikhega.</p>
            <label className="block text-xs font-semibold text-slate-600 mb-1 mt-3">Description (optional)</label>
            <input className={inp} placeholder="School Management ERP"/>
            <p className="text-xs text-slate-400 mt-1">App store / install prompt mein dikhega.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Theme Color</label>
            <input type="color" className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer" defaultValue="#1976D2"/>
            <p className="text-xs text-slate-400 mt-1">Phone status bar / browser address bar color.</p>
            <label className="block text-xs font-semibold text-slate-600 mb-1 mt-3">Background Color</label>
            <input type="color" className="w-full h-10 border border-slate-200 rounded-lg cursor-pointer" defaultValue="#ffffff"/>
            <p className="text-xs text-slate-400 mt-1">App splash screen background.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">App Icon (PNG, square, ≥ 512×512 recommended)</label>
            <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors bg-slate-50">
              <span className="text-slate-400 text-xs">Upload Icon</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Upload karte hi 6 sizes (48, 72, 96, 144, 192, 512) generate ho jaayenge.</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">
            💾 Save PWA Settings
          </button>
        </div>
      </div>
      {/* Logo */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-amber-600 mb-3">🔷 Logo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["System Logo","Text Logo","Printing Logo","Report Card"].map(n=>(
            <div key={n}>
              <p className="text-xs font-semibold text-slate-600 mb-2">{n}</p>
              <div className="h-24 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 cursor-pointer hover:border-indigo-400 transition-colors">
                <span className="text-slate-400 text-xs">Upload</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Login Background */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-amber-600 mb-3">🔑 Login Background</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Slider 1","Slider 2","Slider 3"].map((n,i)=>(
            <div key={n}>
              <p className="text-xs font-semibold text-slate-600 mb-2">{n}</p>
              <div className={`h-24 rounded-xl overflow-hidden border border-slate-200 ${["bg-amber-100","bg-blue-100","bg-purple-100"][i]}`}>
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Click to upload</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Upload file settings Tab (Image 6) ───────────────────────────────────────
function UploadTab() {
  const [imgExt, setImgExt] = useState("jpeg, jpg, bmp, png");
  const [imgSize, setImgSize] = useState("1024");
  const [maxDim, setMaxDim] = useState("1200");
  const [quality, setQuality] = useState("92");
  const [skipJpeg, setSkipJpeg] = useState("800");
  const [skipPng, setSkipPng] = useState("500");
  const [autoCompress, setAutoCompress] = useState(true);
  const [fileExt, setFileExt] = useState("txt, pdf, doc, xls, docx, xlsx, jpg, jpeg, png, gif, bmp, zip, mp4, 7z, wmv, rar");
  const [fileSize, setFileSize] = useState("2024");

  return (
    <div className="max-w-3xl space-y-6">
      {/* Settings For Image */}
      <div>
        <h3 className="text-sm font-bold text-amber-600 mb-3">🖼 Settings For Image</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Allowed Extension <span className="text-red-500">*</span></label>
            <textarea className={inp} rows={2} value={imgExt} onChange={e=>setImgExt(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Size (in KB) <span className="text-red-500">*</span></label>
            <input className={inp} value={imgSize} onChange={e=>setImgSize(e.target.value)}/>
          </div>
        </div>
      </div>
      {/* Image Auto-Compression */}
      <div>
        <h3 className="text-sm font-bold text-amber-600 mb-1">⚙ Image Auto-Compression</h3>
        <p className="text-xs text-slate-500 mb-3">Bade photos (e.g. mobile camera 4-5 MB) automatically resize aur compress ho jaate hain upload pe — visual quality kharab nahi hoti, sirf storage save hota hai.</p>
        <div className="space-y-3">
          {[
            {l:"Max Dimension (in pixels)",v:maxDim,sv:setMaxDim,hint:"Width / height ka maximum. Recommended: 1200. Range: 200-4000."},
            {l:"Quality (1-98)",v:quality,sv:setQuality,hint:"JPEG re-encode quality. Recommended: 92."},
            {l:"Skip-recompress JPEG below (KB)",v:skipJpeg,sv:setSkipJpeg,hint:"Iss size se chhote JPEG files as-is save honge. Recommended: 800 KB."},
            {l:"Skip-recompress PNG below (KB)",v:skipPng,sv:setSkipPng,hint:"Iss size se chhote PNG files as-is save honge. Recommended: 500 KB."},
          ].map(f=>(
            <div key={f.l}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{f.l}</label>
              <input className={inp} value={f.v} onChange={e=>f.sv(e.target.value)}/>
              {f.hint && <p className="text-xs text-slate-400 mt-0.5">{f.hint}</p>}
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoCompress} onChange={e=>setAutoCompress(e.target.checked)} className="rounded accent-indigo-600"/>
            <span className="text-sm text-slate-700 font-medium">Auto-compress photos on upload (recommended)</span>
          </label>
          <p className="text-xs text-slate-400">Off karoge to original photo as-is upload hoga (storage zyaada lagega).</p>
        </div>
      </div>
      {/* Settings For Files */}
      <div>
        <h3 className="text-sm font-bold text-amber-600 mb-3">📁 Settings For Files</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Allowed Extension <span className="text-red-500">*</span></label>
            <textarea className={inp} rows={2} value={fileExt} onChange={e=>setFileExt(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Size (in KB)</label>
            <input className={inp} value={fileSize} onChange={e=>setFileSize(e.target.value)}/>
          </div>
        </div>
      </div>
      <SaveBtn/>
    </div>
  );
}

export default function GeneralSettingsPage() {
  const [tab, setTab] = useState("general");
  const titles = { general:"Global Settings", theme:"Global Settings", logo:"Global Settings", upload:"Global Settings" };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">{titles[tab]}</h1>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 border-b border-slate-100 flex gap-0 overflow-x-auto">
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.i} {t.l}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab==="general" && <GeneralTab/>}
          {tab==="theme" && <ThemeTab/>}
          {tab==="logo" && <LogoTab/>}
          {tab==="upload" && <UploadTab/>}
        </div>
      </div>
    </div>
  );
}
