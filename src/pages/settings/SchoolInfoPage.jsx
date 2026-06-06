/**
 * SchoolInfoPage — Images 7–20 (all School Settings sub-pages)
 * Left sidebar nav, right content panel
 * Sub-pages: School Details | Student/Parent Panel | Mobile App Settings |
 *             App Slider | Live Class Settings | Payment Settings |
 *             Sms Settings | Email Settings | Accounting Links |
 *             Whatsapp Chat Settings | Whatsapp Notification Config |
 *             WhatsApp Gateway | Attendance Type
 */
import { useState } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Copy } from "lucide-react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

function SaveBtn({ label="Save", onClick }) {
  return (
    <div className="flex justify-center mt-5">
      <button onClick={onClick} className="flex items-center gap-2 px-8 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
        ➕ {label}
      </button>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 mt-2">{icon} {title}</h3>;
}

function F({ label, req, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
      <label className="text-sm text-slate-600 font-medium w-44 shrink-0 text-right">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}

// ── School Details (Image 7) ───────────────────────────────────────────────────
function SchoolDetails() {
  const [session, setSession] = useState("2026-2027");
  const [form, setForm] = useState({
    branchName:"GenEduServe", schoolName:"GenEduServe",
    email:"geneduserve@gmail.com", mobile:"7739136208",
    city:"siwan", state:"Bihar", address:"Noida",
    language:"English", timezone:"(GMT+05:30) Asia, Kolkata",
    weekends:"Sunday", uniqueRoll:"Section Wise", teacherRestricted:true,
    currency:"INR"
  });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-600">🏫</span>
        <span className="text-sm font-semibold text-slate-700">School Setting</span>
      </div>
      <SectionTitle icon="📅" title="Academic Session"/>
      <div className="flex items-center gap-3 mb-6">
        <select className={sel + " max-w-xs"} value={session} onChange={e=>setSession(e.target.value)}>
          {["2026-2027","2025-2026","2024-2025"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50">✓ Change</button>
      </div>

      <SectionTitle icon="⚙" title="General Setting"/>
      {[
        {l:"Branch Name",k:"branchName",req:true},{l:"School Name",k:"schoolName",req:true},
        {l:"Email",k:"email",req:true},{l:"Mobile No",k:"mobile"},
        {l:"City",k:"city"},{l:"State",k:"state"},
      ].map(f=>(
        <F key={f.k} label={f.l} req={f.req}>
          <input className={inp} value={form[f.k]} onChange={set(f.k)}/>
        </F>
      ))}
      <F label="Address">
        <textarea className={inp} rows={2} value={form.address} onChange={set("address")}/>
      </F>
      {[
        {l:"Language",k:"language",req:true,opts:["English","Hindi","Urdu"]},
        {l:"Timezone",k:"timezone",req:true,opts:["(GMT+05:30) Asia, Kolkata","(GMT+00:00) UTC"]},
        {l:"Weekends",k:"weekends",req:true,opts:["Sunday","Saturday","Both"]},
      ].map(f=>(
        <F key={f.k} label={f.l} req={f.req}>
          <select className={sel} value={form[f.k]} onChange={set(f.k)}>
            {f.opts.map(o=><option key={o}>{o}</option>)}
          </select>
        </F>
      ))}
      <F label="Unique Roll" req>
        <div className="flex gap-4 items-center">
          {["Classes Wise","Section Wise","Disabled"].map(v=>(
            <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600">
              <input type="radio" name="uniqueRoll" value={v} checked={form.uniqueRoll===v} onChange={set("uniqueRoll")} className="accent-indigo-600"/>
              {v}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input type="checkbox" checked={form.teacherRestricted} onChange={e=>setForm(p=>({...p,teacherRestricted:e.target.checked}))} className="rounded accent-amber-500"/>
          <span className="text-sm text-slate-600">Teacher Restricted</span>
        </label>
      </F>

      <SectionTitle icon="💱" title="Currency"/>
      <F label="Currency" req>
        <input className={inp} value={form.currency} onChange={set("currency")}/>
      </F>
      <SaveBtn/>
    </div>
  );
}

// ── Student / Parent Panel (Image 8) ──────────────────────────────────────────
function StudentParentPanel() {
  const [form, setForm] = useState({
    studentLogin:"Yes", parentLogin:"Yes",
    teacherMobileVisible:true, teacherEmailVisible:true,
    admitCardTemplate:"", marksheetTemplate:""
  });
  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center gap-2">
        <span>👥</span><span className="text-sm font-semibold">Student Parent Panel</span>
      </div>
      <SectionTitle icon="🔐" title="User Login"/>
      <F label="Student Login" req>
        <select className={sel + " max-w-xs"} value={form.studentLogin} onChange={e=>setForm(p=>({...p,studentLogin:e.target.value}))}>
          <option>Yes</option><option>No</option>
        </select>
      </F>
      <F label="Parent Login" req>
        <select className={sel + " max-w-xs"} value={form.parentLogin} onChange={e=>setForm(p=>({...p,parentLogin:e.target.value}))}>
          <option>Yes</option><option>No</option>
        </select>
      </F>
      <SectionTitle icon="🔒" title="Privacy"/>
      <div className="ml-44 space-y-2 mb-5">
        {[["teacherMobileVisible","Teachers Mobile Number Visible."],["teacherEmailVisible","Teachers Email Visible."]].map(([k,l])=>(
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.checked}))} className="rounded accent-amber-500"/>
            <span className="text-sm text-slate-600">{l}</span>
          </label>
        ))}
      </div>
      <SectionTitle icon="📋" title="Default Template"/>
      <F label="Admit Card Template" req>
        <select className={sel + " max-w-xs"} value={form.admitCardTemplate} onChange={e=>setForm(p=>({...p,admitCardTemplate:e.target.value}))}>
          <option value="">Select</option><option>Default Admit Card</option>
        </select>
      </F>
      <F label="Marksheet Template" req>
        <select className={sel + " max-w-xs"} value={form.marksheetTemplate} onChange={e=>setForm(p=>({...p,marksheetTemplate:e.target.value}))}>
          <option value="">Select</option><option>Default Marksheet</option>
        </select>
      </F>
      <SaveBtn/>
    </div>
  );
}

// ── Mobile App Settings (Image 9) ─────────────────────────────────────────────
function MobileAppSettings() {
  const [form, setForm] = useState({appName:"GenEduServe App", primaryColor:"#1976D2", apiUrl:"https://aayam.geneduserve.in/"});
  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center gap-2">
        <span>📱</span><span className="text-sm font-semibold">Mobile App Settings</span>
      </div>
      <SectionTitle icon="🎨" title="App Branding"/>
      <F label="App Name" req><input className={inp} value={form.appName} onChange={e=>setForm(p=>({...p,appName:e.target.value}))}/></F>
      <F label="App Logo">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-indigo-400 transition-colors">
          <span className="text-3xl text-slate-400 mb-1">☁</span>
          <span className="text-sm text-slate-500">Drag and drop a file here or click</span>
          <span className="text-xs text-slate-400 mt-1">Recommended: square image, 512×512 px</span>
        </div>
      </F>
      <F label="Splash Screen Image">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-indigo-400 transition-colors">
          <span className="text-3xl text-slate-400 mb-1">☁</span>
          <span className="text-sm text-slate-500">Drag and drop a file here or click</span>
          <span className="text-xs text-slate-400 mt-1">Shown when app opens. Recommended: 1080×1920 px or similar.</span>
        </div>
      </F>
      <F label="Primary Color">
        <div>
          <input className={inp} value={form.primaryColor} onChange={e=>setForm(p=>({...p,primaryColor:e.target.value})) }/>
          <p className="text-xs text-slate-400 mt-1">Hex color (e.g. #1976D2). Used for app theme.</p>
        </div>
      </F>
      <SectionTitle icon="🔗" title="API & URL"/>
      <F label="API Base URL">
        <div>
          <input className={inp} value={form.apiUrl} onChange={e=>setForm(p=>({...p,apiUrl:e.target.value}))}/>
          <p className="text-xs text-slate-400 mt-1">URL that the mobile app uses to connect to this server.</p>
        </div>
      </F>
      <SaveBtn/>
    </div>
  );
}

// ── App Slider (Image 10) ──────────────────────────────────────────────────────
function AppSlider() {
  const [allClasses, setAllClasses] = useState(true);
  const [title, setTitle] = useState("");
  const [sliders, setSliders] = useState([]);
  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center gap-2">
        <span>🖼</span><span className="text-sm font-semibold">App Slider Images (Class-wise)</span>
      </div>
      <p className="text-sm text-slate-600 mb-4">Select <strong>All Classes</strong> to show to everyone, or choose one or multiple classes. These images show on the mobile app home carousel.</p>
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 mb-2">Show to classes</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={allClasses} onChange={e=>setAllClasses(e.target.checked)} className="rounded accent-amber-500"/>
          <span className="text-sm text-slate-700">All Classes</span>
        </label>
        {!allClasses && <p className="text-xs text-slate-400 mt-1">If unchecked, select one or more classes below.</p>}
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Title (optional)</label>
        <input className={inp} placeholder="e.g. Admissions Open 2023-24" value={title} onChange={e=>setTitle(e.target.value)}/>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Image <span className="text-red-500">*</span></label>
        <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-1"/>
      </div>
      <button onClick={()=>{if(title){setSliders(p=>[...p,{id:Date.now(),title}]);setTitle("");}}} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 mb-5">
        <Plus size={13}/> Add Slider
      </button>
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Sliders</h4>
        {sliders.length===0 ? <p className="text-sm text-slate-400">No slider images yet. Add one above.</p>
          : sliders.map(s=>(
            <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg mb-2">
              <span className="text-sm text-slate-700">{s.title}</span>
              <button onClick={()=>setSliders(p=>p.filter(x=>x.id!==s.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Live Class Settings (Images 11 & 12) ──────────────────────────────────────
function LiveClassSettings() {
  const [form, setForm] = useState({sdkClientId:"", sdkClientSecret:"", eachStaff:false, eachStudent:false, zoomRedirectUrl:"https://aayam.geneduserve.in/live_class/zoom_OAuth", saltKey:"", serverBaseUrl:""});
  return (
    <div>
      <div className="mb-5 p-5 border border-slate-200 rounded-xl">
        <SectionTitle icon="⚙" title="Zoom Account Config"/>
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Zoom Credentials</h4>
        <F label="SDK Client ID" req><input className={inp} value={form.sdkClientId} onChange={e=>setForm(p=>({...p,sdkClientId:e.target.value}))}/></F>
        <F label="SDK Client Secret" req><input className={inp} type="password" value={form.sdkClientSecret} onChange={e=>setForm(p=>({...p,sdkClientSecret:e.target.value}))}/></F>
        <div className="ml-44 space-y-2 mb-4">
          {[["eachStaff","Each Staff API Credential"],["eachStudent","Each Student API Credential"]].map(([k,l])=>(
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.checked}))} className="rounded"/>
              <span className="text-sm text-slate-600">{l}</span>
            </label>
          ))}
        </div>
        <SaveBtn label="Save" onClick={()=>{}}/>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">OAuth</h4>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 shrink-0">Set Zoom Redirect Url:</label>
          </div>
          <div className="flex gap-2 mt-2">
            <input className={inp} value={form.zoomRedirectUrl} readOnly/>
            <button onClick={()=>navigator.clipboard?.writeText(form.zoomRedirectUrl)} className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"><Copy size={14}/></button>
          </div>
        </div>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl">
        <SectionTitle icon="⚙" title="BigBlueButton Config"/>
        <F label="Salt Key" req><input className={inp} value={form.saltKey} onChange={e=>setForm(p=>({...p,saltKey:e.target.value}))}/></F>
        <F label="Server Base URL" req><input className={inp} value={form.serverBaseUrl} onChange={e=>setForm(p=>({...p,serverBaseUrl:e.target.value}))}/></F>
        <SaveBtn/>
      </div>
    </div>
  );
}

// ── Payment Settings (Image 13) ───────────────────────────────────────────────
const PAYMENT_GATEWAYS = ["Paypal","Stripe","PayUmoney","Paystack","Razorpay","Midtrans","SSLCommerz","Jazzcash","Flutter Wave","Paytm","PhonePe","toyyibPay","Payhere","Nepalste","bKash","UPI QR Code"];
const PAYMENT_TABS = ["Paypal Config","Stripe Config","PayUmoney Config","Paystack","Razorpay","Midtrans","SSL Commerz","Jazzcash","Flutter Wave","Paytm","PhonePe","toyyibPay","Payhere","Nepalste","bKash","UPI QR Code"];

function PaymentSettings() {
  const [activeGateway, setActiveGateway] = useState("Paypal Config");
  const [enabledGateways, setEnabledGateways] = useState(["Paytm","PhonePe","UPI QR Code"]);
  const [mobileOffline, setMobileOffline] = useState(["Cash (Mobile App)","PhonePe (Mobile App)","Paytm (Mobile App)"]);

  const toggleGateway = g => setEnabledGateways(p => p.includes(g) ? p.filter(x=>x!==g) : [...p,g]);

  const PaypalForm = () => (
    <div className="space-y-3">
      {[["Paypal Username",""],["Paypal Password","password"],["Paypal Signature",""],["Paypal Email","email"]].map(([l,t])=>(
        <div key={l}><label className="block text-xs font-semibold text-slate-500 mb-1">{l}</label>
          <input className={inp} type={t||"text"}/></div>
      ))}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="rounded"/>
        <span className="text-sm text-slate-600">Paypal Sandbox</span>
      </label>
      <SaveBtn/>
    </div>
  );

  const GenericForm = ({name}) => (
    <div className="space-y-3">
      {["API Key","Secret Key","Mode"].map(f=>(
        <div key={f}><label className="block text-xs font-semibold text-slate-500 mb-1">{f}</label>
          <input className={inp}/></div>
      ))}
      <SaveBtn/>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-3">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center gap-2">
          <span>💳</span><span className="text-sm font-semibold">Payment Control</span>
        </div>
        {/* Gateway tabs */}
        <div className="flex flex-wrap gap-0 border-b border-slate-200 mb-5 overflow-x-auto">
          {PAYMENT_TABS.map(t=>(
            <button key={t} onClick={()=>setActiveGateway(t)}
              className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-all
                ${activeGateway===t?"border-indigo-600 text-indigo-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>
        {activeGateway==="Paypal Config" ? <PaypalForm/> : <GenericForm name={activeGateway}/>}
      </div>
      {/* Active Gateway sidebar */}
      <div className="border border-slate-200 rounded-xl p-4 h-fit">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">☰ Active Gateway</h4>
        <div className="space-y-2">
          {PAYMENT_GATEWAYS.map(g=>(
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enabledGateways.includes(g)} onChange={()=>toggleGateway(g)} className="rounded accent-amber-500"/>
              <span className="text-xs text-slate-600">{g}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h5 className="text-xs font-semibold text-slate-600 mb-2">📱 Mobile App — Offline Payment Modes</h5>
          <p className="text-xs text-slate-400 mb-2">Enable these so students can submit offline payment receipts via app</p>
          {["Cash (Mobile App)","PhonePe (Mobile App)","Paytm (Mobile App)"].map(m=>(
            <label key={m} className="flex items-center gap-2 cursor-pointer mb-1.5">
              <input type="checkbox" checked={mobileOffline.includes(m)} onChange={()=>setMobileOffline(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m])} className="rounded"/>
              <span className="text-xs text-slate-600">{m}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SMS Settings (Image 14) ────────────────────────────────────────────────────
const SMS_GATEWAYS = ["Twilio Gateway","Clickatell Gateway","MSG91 Gateway","Bulk Gateway","Text Local Gateway","SMS country Gateway","Bulksmsbd.net Gateway","Custom GET & POST Gateway"];

function SmsSettings() {
  const [tab, setTab] = useState("config");
  const [gateway, setGateway] = useState("Disabled");
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center gap-2">
        <span>💬</span><span className="text-sm font-semibold">Sms Settings</span>
      </div>
      <div className="flex border-b border-slate-200 mb-5">
        {[{k:"config",l:"Sms Config",i:"💬"},{k:"triggers",l:"Sms Triggers",i:"⚙"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all
              ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.i} {t.l}
          </button>
        ))}
      </div>
      {tab==="config" ? (
        <div>
          <div className="p-5 border border-slate-200 rounded-xl mb-4">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">💬 SMS Gateway</h4>
            <div className="max-w-sm">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Activated Sms Gateway <span className="text-red-500">*</span></label>
              <select className={sel} value={gateway} onChange={e=>setGateway(e.target.value)}>
                <option>Disabled</option>
                {SMS_GATEWAYS.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <SaveBtn/>
          </div>
          <div className="space-y-2">
            {SMS_GATEWAYS.map(g=>(
              <div key={g} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={()=>setExpanded(expanded===g?null:g)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50">
                  <span className="text-sm font-semibold text-indigo-600">{g}</span>
                  <span className="text-slate-400">{expanded===g?"▲":"▼"}</span>
                </button>
                {expanded===g && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                    {["API Key","Secret","Sender ID"].map(f=>(
                      <div key={f}><label className="block text-xs font-semibold text-slate-500 mb-1">{f}</label>
                        <input className={inp}/></div>
                    ))}
                    <SaveBtn/>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">Configure SMS triggers for automated notifications (fee reminders, attendance alerts, etc.)</p>
        </div>
      )}
    </div>
  );
}

// ── Email Settings (Image 15) ─────────────────────────────────────────────────
function EmailSettings() {
  const [tab, setTab] = useState("config");
  const [form, setForm] = useState({systemEmail:"", protocol:"PHP Mail", smtpHost:"", smtpUser:"", smtpPass:"", smtpPort:"", smtpSecure:"No", smtpAuth:"Yes"});
  const [testEmail, setTestEmail] = useState("");
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center gap-2">
        <span>✉</span><span className="text-sm font-semibold">Email Settings</span>
      </div>
      <div className="flex border-b border-slate-200 mb-5">
        {[{k:"config",l:"Email Config",i:"✉"},{k:"triggers",l:"Email Triggers",i:"⚙"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all
              ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.i} {t.l}
          </button>
        ))}
      </div>
      {tab==="config" ? (
        <div className="max-w-2xl space-y-4">
          <F label="System Email" req><input className={inp} type="email" placeholder="All Outgoing Email Will be sent from This Email Address." value={form.systemEmail} onChange={set("systemEmail")}/></F>
          <F label="Email Protocol" req>
            <select className={sel} value={form.protocol} onChange={set("protocol")}>
              <option>PHP Mail</option><option>SMTP</option>
            </select>
          </F>
          {["smtpHost","smtpUser","smtpPass","smtpPort"].map((k,i)=>(
            <F key={k} label={["SMTP Host","SMTP Username","SMTP Password","SMTP Port"][i]} req>
              <input className={inp} type={k==="smtpPass"?"password":"text"} value={form[k]} onChange={set(k)}/>
            </F>
          ))}
          <F label="SMTP Secure">
            <select className={sel} value={form.smtpSecure} onChange={set("smtpSecure")}>
              <option>No</option><option>TLS</option><option>SSL</option>
            </select>
          </F>
          <F label="SMTP Auth">
            <select className={sel} value={form.smtpAuth} onChange={set("smtpAuth")}>
              <option>Yes</option><option>No</option>
            </select>
          </F>
          <SaveBtn/>
          <div className="pt-5 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">📧 Send Test Email</h4>
            <F label="Email" req><input className={inp} type="email" placeholder="Email Address" value={testEmail} onChange={e=>setTestEmail(e.target.value)}/></F>
            <p className="text-xs text-slate-400 ml-44 mb-3">* You can use this function to make sure your SMTP settings are correct.</p>
            <div className="flex justify-center">
              <button className="flex items-center gap-2 px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">✉ Test Now</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-slate-200 rounded-xl"><p className="text-sm text-slate-500">Configure email triggers for automated notifications.</p></div>
      )}
    </div>
  );
}

// ── Accounting Links (Image 16) ────────────────────────────────────────────────
function AccountingLinks() {
  const [form, setForm] = useState({depositAccount:"", expenseAccount:"", enabled:false});
  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center gap-2">
        <span>⚙</span><span className="text-sm font-semibold">Accounting Links</span>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl max-w-xl">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-5">⚙ Transactions Default Account</h4>
        <F label="Deposit Account" req>
          <select className={sel} value={form.depositAccount} onChange={e=>setForm(p=>({...p,depositAccount:e.target.value}))}>
            <option value="">Select</option><option>Main Account</option><option>Kps</option>
          </select>
        </F>
        <F label="Expense Account" req>
          <select className={sel} value={form.expenseAccount} onChange={e=>setForm(p=>({...p,expenseAccount:e.target.value}))}>
            <option value="">Select</option><option>Main Account</option><option>Kps</option>
          </select>
        </F>
        <div className="ml-44">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.enabled} onChange={e=>setForm(p=>({...p,enabled:e.target.checked}))} className="rounded"/>
            <span className="text-sm text-slate-600">Enable / Disable</span>
          </label>
        </div>
        <SaveBtn/>
      </div>
    </div>
  );
}

// ── WhatsApp Chat Settings (Image 17) ─────────────────────────────────────────
function WhatsappChatSettings() {
  const [form, setForm] = useState({headerTitle:"", subtitle:"", footerText:"", frontendChat:false, backendChat:false});
  const [agents, setAgents] = useState([]);
  return (
    <div>
      <div className="p-5 border border-slate-200 rounded-xl mb-5">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">💬 Whatsapp Settings</h4>
        {[["headerTitle","Header Title"],["subtitle","Subtitle"],["footerText","Footer Text"]].map(([k,l])=>(
          <F key={k} label={l}><input className={inp} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/></F>
        ))}
        <F label="Frontend Enable Chat">
          <button onClick={()=>setForm(p=>({...p,frontendChat:!p.frontendChat}))}
            className={`w-12 h-6 rounded-full transition-colors ${form.frontendChat?"bg-indigo-600":"bg-slate-300"} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.frontendChat?"left-6":"left-0.5"}`}/>
          </button>
        </F>
        <F label="Backend Enable Chat">
          <button onClick={()=>setForm(p=>({...p,backendChat:!p.backendChat}))}
            className={`w-12 h-6 rounded-full transition-colors ${form.backendChat?"bg-indigo-600":"bg-slate-300"} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.backendChat?"left-6":"left-0.5"}`}/>
          </button>
        </F>
        <SaveBtn/>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">👥 Whatsapp Agent</h4>
          <button onClick={()=>setAgents(p=>[...p,{id:Date.now(),name:"New Agent"}])} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
            <Edit2 size={12}/> Add Agent
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50">
              {["SL","PHOTO","NAME","DESIGNATION","WHATSAPP NUMBER","START TIME","END TIME","WEEKEND","ACTION"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {agents.length===0 ? <tr><td colSpan={9} className="px-3 py-8 text-center text-sm font-semibold text-red-400">No Information Available</td></tr>
                : agents.map((a,i)=>(
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-slate-500">{i+1}</td>
                    <td className="px-3 py-3">—</td>
                    <td className="px-3 py-3 font-semibold">{a.name}</td>
                    <td className="px-3 py-3">—</td><td className="px-3 py-3">—</td>
                    <td className="px-3 py-3">—</td><td className="px-3 py-3">—</td><td className="px-3 py-3">—</td>
                    <td className="px-3 py-3"><button onClick={()=>setAgents(p=>p.filter(x=>x.id!==a.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Notification Config (Image 18) ────────────────────────────────────
function WhatsappNotificationConfig() {
  const [tab, setTab] = useState("config");
  const [gateway, setGateway] = useState("Disabled");
  const [twilioExpanded, setTwilioExpanded] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);

  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center gap-2">
        <span>💬</span><span className="text-sm font-semibold">Whatsapp Notification Config</span>
      </div>
      <div className="flex border-b border-slate-200 mb-5">
        {[{k:"config",l:"Whatsapp Config",i:"💬"},{k:"triggers",l:"Whatsapp Triggers",i:"⚙"}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all
              ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.i} {t.l}
          </button>
        ))}
      </div>
      {tab==="config" ? (
        <div>
          <div className="p-5 border border-slate-200 rounded-xl mb-4">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">💬 WhatsApp Service Provider</h4>
            <div className="max-w-sm">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Activated Whatsapp Gateway <span className="text-red-500">*</span></label>
              <select className={sel} value={gateway} onChange={e=>setGateway(e.target.value)}>
                <option>Disabled</option><option>Twilio</option><option>Meta Cloud API</option>
              </select>
            </div>
            <SaveBtn/>
          </div>
          {[{k:"twilio",l:"Twilio Gateway",exp:twilioExpanded,setExp:setTwilioExpanded},{k:"meta",l:"Meta Cloud API Gateway",exp:metaExpanded,setExp:setMetaExpanded}].map(g=>(
            <div key={g.k} className="border border-slate-200 rounded-xl mb-2 overflow-hidden">
              <button onClick={()=>g.setExp(!g.exp)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50">
                <span className="text-sm font-semibold text-indigo-600">{g.l}</span>
                <span className="text-slate-400">{g.exp?"▲":"▼"}</span>
              </button>
              {g.exp && <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                {["API Key","Account SID","Auth Token"].map(f=>(
                  <div key={f}><label className="block text-xs font-semibold text-slate-500 mb-1">{f}</label><input className={inp}/></div>
                ))}
                <SaveBtn/>
              </div>}
            </div>
          ))}
        </div>
      ) : <div className="p-5 border border-slate-200 rounded-xl"><p className="text-sm text-slate-500">Configure WhatsApp notification triggers.</p></div>}
    </div>
  );
}

// ── WhatsApp Gateway (Image 19) ────────────────────────────────────────────────
function WhatsAppGateway() {
  const [activeGateway, setActiveGateway] = useState("Self-Hosted Bridge");
  const [microUrl, setMicroUrl] = useState("https://geneduserve.in/");
  const [qrLoaded, setQrLoaded] = useState(false);

  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center gap-2">
        <span>💬</span><span className="text-sm font-semibold">WhatsApp Gateway</span>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl mb-5">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-5">⚙ WhatsApp Gateway Settings</h4>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Active Gateway</label>
            <div className="flex gap-4">
              {[{k:"Meta Cloud API",l:"Meta Cloud API (paid)"},{k:"Self-Hosted Bridge",l:"Self-Hosted Bridge (free)"}].map(o=>(
                <label key={o.k} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input type="radio" name="gwType" value={o.k} checked={activeGateway===o.k} onChange={e=>setActiveGateway(e.target.value)} className="accent-indigo-600"/>
                  {o.k==="Meta Cloud API" ? "☁" : "🖥"} {o.l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Microservice URL <span className="text-red-500">*</span></label>
            <input className={inp} value={microUrl} onChange={e=>setMicroUrl(e.target.value)}/>
            <p className="text-xs text-slate-400 mt-1">Base URL of the <code className="bg-slate-100 px-1 rounded">whatsapp-bridge-service</code> (no trailing slash).</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">API Key</label>
            <input className={inp} placeholder="Saved — paste new to change"/>
            <p className="text-xs text-slate-400 mt-1">🔒 Key is saved. Leave blank to keep it; paste a new key to change.</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">💾 Save Gateway</button>
        </div>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl mb-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">⚙ WhatsApp QR Code</h4>
          <button onClick={()=>setQrLoaded(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
            <RefreshCw size={12}/> Refresh QR
          </button>
        </div>
        <div className="flex items-center justify-center h-32 border border-slate-200 rounded-xl bg-slate-50">
          {qrLoaded ? <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_,i)=><div key={i} className="w-12 h-12 bg-slate-800 rounded-sm"/>)}
          </div> : <p className="text-sm text-slate-400">Click <strong>Refresh QR</strong> to load the QR code from your microservice.</p>}
        </div>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">📖 Setup Guide — Self-Hosted Bridge</h4>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600">
          <li>Copy the <code className="bg-slate-100 px-1 rounded text-xs">whatsapp-bridge-service/</code> folder to your VPS.</li>
          <li>Create <code className="bg-slate-100 px-1 rounded text-xs">.env</code> from <code className="bg-slate-100 px-1 rounded text-xs">.env.example</code> and set a strong <code className="bg-slate-100 px-1 rounded text-xs">API_KEY</code>.</li>
          <li>Run <code className="bg-slate-100 px-1 rounded text-xs">npm install</code> then <code className="bg-slate-100 px-1 rounded text-xs">npm start</code> (or use PM2 for persistence).</li>
          <li>Enter the server URL and that same <code className="bg-slate-100 px-1 rounded text-xs">API_KEY</code> above and click <strong>Save</strong>.</li>
          <li>Click <strong>Refresh QR</strong> and scan the code with your WhatsApp phone.</li>
          <li>Once scanned, the session persists automatically via <code className="bg-slate-100 px-1 rounded text-xs">LocalAuth</code>.</li>
        </ol>
        <p className="text-xs text-indigo-500 mt-3">ℹ PM2 quick-start: <code className="bg-slate-100 px-1 rounded">npm install -g pm2 && pm2 start index.js --name whatsapp-bridge && pm2 save && pm2 startup</code></p>
      </div>
    </div>
  );
}

// ── Attendance Type (Image 20) ─────────────────────────────────────────────────
function AttendanceType() {
  const [type, setType] = useState("Day Wise");
  return (
    <div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-center gap-2">
        <span>📊</span><span className="text-sm font-semibold">Attendance Type</span>
      </div>
      <div className="p-5 border border-slate-200 rounded-xl max-w-xl">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Attendance Type</h4>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-xs text-blue-700">Note: This change will not affect Super-admin role. You must log in as another role (Like: Admin, Teacher, etc) to check this affect.</p>
        </div>
        <F label="Attendance Type">
          <select className={sel + " max-w-xs"} value={type} onChange={e=>setType(e.target.value)}>
            <option>Day Wise</option><option>Subject Wise</option><option>Period Wise</option>
          </select>
        </F>
        <SaveBtn/>
      </div>
    </div>
  );
}

// ── Sidebar menu items ─────────────────────────────────────────────────────────
const SCHOOL_MENU = [
  { k:"school-details",     l:"School Details",             i:"🏫" },
  { k:"student-parent",     l:"Student / Parent Panel",     i:"👥" },
  { k:"mobile-app",         l:"Mobile App Settings",        i:"📱" },
  { k:"app-slider",         l:"App Slider (Class-wise)",    i:"🖼" },
  { k:"live-class",         l:"Live Class Settings",        i:"🎥" },
  { k:"payment",            l:"Payment Settings",           i:"💳" },
  { k:"sms",                l:"Sms Settings",               i:"💬" },
  { k:"email",              l:"Email Settings",             i:"✉" },
  { k:"accounting-links",   l:"Accounting Links",           i:"⚙" },
  { k:"whatsapp-chat",      l:"Whatsapp Chat Settings",     i:"💬" },
  { k:"whatsapp-notif",     l:"Whatsapp Notification Config",i:"💬" },
  { k:"whatsapp-gateway",   l:"WhatsApp Gateway",           i:"⚙" },
  { k:"attendance-type",    l:"Attendance Type",            i:"📊" },
];

const PAGE_TITLES = {
  "school-details":"School Settings","student-parent":"Student Parent Panel",
  "mobile-app":"Mobile App Settings","app-slider":"App Slider Images",
  "live-class":"Live Class Settings","payment":"Payment Control",
  "sms":"Sms Settings","email":"Email Settings",
  "accounting-links":"Accounting Links","whatsapp-chat":"Whatsapp Settings",
  "whatsapp-notif":"Whatsapp Notification Config","whatsapp-gateway":"WhatsApp Gateway",
  "attendance-type":"Attendance Type"
};

export default function SchoolInfoPage() {
  const [active, setActive] = useState("school-details");

  const renderContent = () => {
    switch(active) {
      case "school-details":   return <SchoolDetails/>;
      case "student-parent":   return <StudentParentPanel/>;
      case "mobile-app":       return <MobileAppSettings/>;
      case "app-slider":       return <AppSlider/>;
      case "live-class":       return <LiveClassSettings/>;
      case "payment":          return <PaymentSettings/>;
      case "sms":              return <SmsSettings/>;
      case "email":            return <EmailSettings/>;
      case "accounting-links": return <AccountingLinks/>;
      case "whatsapp-chat":    return <WhatsappChatSettings/>;
      case "whatsapp-notif":   return <WhatsappNotificationConfig/>;
      case "whatsapp-gateway": return <WhatsAppGateway/>;
      case "attendance-type":  return <AttendanceType/>;
      default:                 return <SchoolDetails/>;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">{PAGE_TITLES[active]}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {SCHOOL_MENU.map(item=>(
              <button key={item.k} onClick={()=>setActive(item.k)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-all border-b border-slate-50 last:border-0
                  ${active===item.k?"bg-indigo-600 text-white":"text-slate-600 hover:bg-slate-50"}`}>
                <span>{item.i}</span> {item.l}
              </button>
            ))}
          </div>
        </div>
        {/* Right content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
