/**
 * Student → ID Card Editor
 * ─────────────────────────────────────────────────────────────────────────────
 * Design student ID cards: header colour + text, content colour, faded
 * watermark logo, photo + detail fields, front/back sides and vertical /
 * horizontal orientation (auto-aligns). Multiple named templates can be saved;
 * saved templates appear in the Student ID Print list.
 */
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input } from "../../components/ui";
import { CreditCard as IdCard, Printer, Save, Plus, Trash2, Copy } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { selectUser } from "../../redux/slices/authSlice";
import { IdCardFace, makeDefaultCfg, loadTemplates, saveTemplates } from "./_idCardShared";
import CardPresetGallery from "../../components/CardPresetGallery";
import { LAYOUTS } from "../../components/idcard/IdCardRenderer";
import { CARD_PRESETS, PRESET_KEYS, applyPreset } from "../../utils/cardPresets";

const FIELDS = [
  { key: "photo", label: "Photo" },
  { key: "name", label: "Student Name" },
  { key: "klass", label: "Class / Section" },
  { key: "roll", label: "Roll No" },
  { key: "admission", label: "Admission No" },
  { key: "dob", label: "Date of Birth" },
  { key: "blood", label: "Blood Group" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Phone" },
  { key: "father", label: "Father Name" },
  { key: "mother", label: "Mother Name" },
  { key: "guardian", label: "Guardian Name" },
  { key: "address", label: "Address" },
  { key: "barcode", label: "Barcode" },
];

const SAMPLE = {
  user: { firstName: "Student", lastName: "Name", phone: "9999999999" },
  section: { name: "A", class: { name: "10" } },
  rollNumber: "10A01", admissionNumber: "ADM0001", gender: "Male",
  bloodGroup: "O+", dateOfBirth: "2010-01-01", photo: "",
  fatherName: "Father Name", motherName: "Mother Name",
  guardianName: "Guardian Name", address: "123, Sample Street, City",
};

// Browser-only id (this file never runs in the workflow sandbox).
const newId = () => `tpl-${Date.now()}`;

export default function IdCardEditorPage() {
  usePageTitle("ID Card Editor");
  const user = useSelector(selectUser);
  const defaultCfg = useMemo(() => makeDefaultCfg(user?.schoolName), [user?.schoolName]);

  const [templates, setTemplates] = useState([]);
  const [currentId, setCurrentId] = useState(null); // id of the loaded template (null = unsaved/new)
  const [name, setName] = useState("Template 1");
  const [cfg, setCfg] = useState(defaultCfg);
  const [side, setSide] = useState("front");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");

  // Load saved templates once; open the first one if any exist.
  useEffect(() => {
    const list = loadTemplates();
    setTemplates(list);
    if (list.length) {
      setCurrentId(list[0].id);
      setName(list[0].name);
      setCfg({ ...makeDefaultCfg(user?.schoolName), ...list[0].cfg });
    } else {
      setName("Template 1");
    }
  }, []); // eslint-disable-line

  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery({ classId, limit: 200 }, { skip: !classId });
  const students = studentList?.data ?? [];
  const previewStudent = students.find((s) => s.id === studentId) || students[0] || SAMPLE;

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const setField = (k, v) => setCfg((c) => ({ ...c, fields: { ...c.fields, [k]: v } }));

  // Which ready-made preset (if any) the current colours match — highlights the tile.
  const activePresetId = CARD_PRESETS.find((p) => PRESET_KEYS.every((k) => cfg[k] === p.cfg[k]))?.id;
  const applyDesign = (p) => { setCfg((c) => applyPreset(c, p)); toast.success(`Applied “${p.name}” design`); };

  const persist = (list) => { setTemplates(list); saveTemplates(list); };

  const loadTemplate = (id) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setCurrentId(t.id);
    setName(t.name);
    setCfg({ ...makeDefaultCfg(user?.schoolName), ...t.cfg });
  };

  const startNew = () => {
    setCurrentId(null);
    setName(`Template ${templates.length + 1}`);
    setCfg(defaultCfg);
  };

  // Save: update the loaded template, or create a new one.
  const save = () => {
    const tplName = name.trim() || `Template ${templates.length + 1}`;
    if (currentId && templates.some((t) => t.id === currentId)) {
      persist(templates.map((t) => (t.id === currentId ? { ...t, name: tplName, cfg } : t)));
      toast.success(`Saved “${tplName}”`);
    } else {
      const id = newId();
      persist([...templates, { id, name: tplName, cfg }]);
      setCurrentId(id);
      toast.success(`Created “${tplName}”`);
    }
  };

  // Save As: always create a copy under a new name.
  const saveAsNew = () => {
    const id = newId();
    const tplName = (name.trim() || `Template ${templates.length + 1}`);
    const finalName = templates.some((t) => t.name === tplName) ? `${tplName} (copy)` : tplName;
    persist([...templates, { id, name: finalName, cfg }]);
    setCurrentId(id);
    setName(finalName);
    toast.success(`Created “${finalName}”`);
  };

  const remove = () => {
    if (!currentId) return;
    if (!window.confirm(`Delete template “${name}”?`)) return;
    const list = templates.filter((t) => t.id !== currentId);
    persist(list);
    if (list.length) loadTemplate(list[0].id);
    else startNew();
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-4">
      <style>{`@media print {
        .no-print { display:none !important; }
        body { background:#fff !important; }
        .id-print-area { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; gap:24px; padding:24px; }
      }`}</style>

      <div className="no-print">
        <PageHeader title="ID Card Editor" subtitle="Design ID card templates — saved templates show up in Student ID Print" icon={<IdCard size={18} />}>
          <Button variant="secondary" icon={<Plus size={14} />} onClick={startNew}>New</Button>
          <Button icon={<Save size={14} />} onClick={save}>Save</Button>
          <Button icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:items-start">
        {/* ── Controls (only this column scrolls) ──────────────────────── */}
        <div className="no-print space-y-4 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:pr-2">
          <Card title="Template">
            <div className="p-4 space-y-3">
              {templates.length > 0 && (
                <Select label="Open Template" value={currentId || ""} onChange={(e) => (e.target.value ? loadTemplate(e.target.value) : startNew())}
                  options={[{ value: "", label: "— New (unsaved) —" }, ...templates.map((t) => ({ value: t.id, label: t.name }))]} />
              )}
              <Input label="Template Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Template 1" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" icon={<Save size={13} />} onClick={save}>Save</Button>
                <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={saveAsNew}>Save as New</Button>
                {currentId && <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={remove}>Delete</Button>}
              </div>
            </div>
          </Card>

          <Card title="Ready-made Templates">
            <div className="p-4 space-y-2">
              <p className="text-[11px] text-slate-500">
                Pick a finished design — each tile is the real card. Then tick only the fields you
                want under <b>Fields</b>, fine-tune below, and Save it as your template.
              </p>
              <CardPresetGallery
                cfg={cfg}
                activeId={activePresetId}
                onPick={applyDesign}
                renderCard={(c, s) => <IdCardFace cfg={c} student={previewStudent} face="front" logo={user?.schoolLogo} scale={s} />}
              />
            </div>
          </Card>

          <Card title="Preview Data">
            <div className="p-4 grid grid-cols-1 gap-3">
              <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}
                options={[{ value: "", label: "Sample (no class)" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
              <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                options={[{ value: "", label: students.length ? "First in class" : "Pick a class first" },
                  ...students.map((s) => ({ value: s.id, label: `${s.rollNumber} · ${s.user?.firstName} ${s.user?.lastName}` }))]} />
            </div>
          </Card>

          <Card title="Layout">
            <div className="p-4 space-y-3">
              <Select label="Card Design" value={cfg.layout || "classic"} onChange={(e) => set("layout", e.target.value)}
                options={LAYOUTS.map((l) => ({ value: l.id, label: l.name }))} />
              <Select label="Orientation" value={cfg.orientation} onChange={(e) => set("orientation", e.target.value)}
                options={[{ value: "vertical", label: "Vertical (portrait)" }, { value: "horizontal", label: "Horizontal (landscape)" }]} />
              <Select label="Photo Shape" value={cfg.photoShape || "rect"} onChange={(e) => set("photoShape", e.target.value)}
                options={[{ value: "rect", label: "Rounded square" }, { value: "circle", label: "Circle" }]} />
              <label className="flex items-center gap-2 text-[13px] text-slate-700">
                <input type="checkbox" checked={cfg.twoSided} onChange={(e) => set("twoSided", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Two-sided card (front + back)
              </label>
              {cfg.twoSided && (
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-max">
                  {["front", "back"].map((s) => (
                    <button key={s} onClick={() => setSide(s)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize ${side === s ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
                      {s} side
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Header">
            <div className="p-4 space-y-3">
              <Input label="Header Text (school / title)" value={cfg.headerText} onChange={(e) => set("headerText", e.target.value)} />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sub-header (multi-line)</label>
                <textarea value={cfg.subHeader} onChange={(e) => set("subHeader", e.target.value)} rows={2}
                  placeholder="Address line 1&#10;Address line 2"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Header Color" value={cfg.headerColor} onChange={(v) => set("headerColor", v)} />
                <ColorField label="Header Text" value={cfg.headerTextColor} onChange={(v) => set("headerTextColor", v)} />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-slate-700">
                <input type="checkbox" checked={cfg.showName !== false} onChange={(e) => set("showName", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Show school name in header
              </label>
              {user?.schoolLogo && (
                <label className="flex items-center gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" checked={cfg.showLogo} onChange={(e) => set("showLogo", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                  Show school logo in header
                </label>
              )}
            </div>
          </Card>

          <Card title="Colors">
            <div className="p-4 grid grid-cols-2 gap-3">
              <ColorField label="Content Area" value={cfg.bodyColor} onChange={(v) => set("bodyColor", v)} />
              <ColorField label="Accent" value={cfg.accentColor} onChange={(v) => set("accentColor", v)} />
              {/* Drives the ribbon / wave / arc / diagonal decoration. */}
              <ColorField label="Decoration" value={cfg.decorColor || cfg.accentColor} onChange={(v) => set("decorColor", v)} />
              <ColorField label="Footer" value={cfg.footerColor} onChange={(v) => set("footerColor", v)} />
              <ColorField label="Footer Text" value={cfg.footerTextColor} onChange={(v) => set("footerTextColor", v)} />
            </div>
          </Card>

          <Card title="Typography & Sizes">
            <div className="p-4 grid grid-cols-2 gap-3">
              <NumField label="Photo Size" value={cfg.photoSize} onChange={(v) => set("photoSize", v)} min={48} max={200} />
              <NumField label="Header Size" value={cfg.headerSize} onChange={(v) => set("headerSize", v)} />
              <NumField label="Logo Size" value={cfg.logoSize} onChange={(v) => set("logoSize", v)} min={16} max={160} />
              <NumField label="Sub-header Size" value={cfg.subHeaderSize} onChange={(v) => set("subHeaderSize", v)} />
              <ColorField label="Sub-header Color" value={cfg.subHeaderColor} onChange={(v) => set("subHeaderColor", v)} />
              <NumField label="Name Size" value={cfg.nameSize} onChange={(v) => set("nameSize", v)} />
              <ColorField label="Name Color" value={cfg.nameColor} onChange={(v) => set("nameColor", v)} />
              <NumField label="Content Size" value={cfg.contentSize} onChange={(v) => set("contentSize", v)} />
              <ColorField label="Content Color" value={cfg.contentColor} onChange={(v) => set("contentColor", v)} />
              <ColorField label="Label Color" value={cfg.contentLabelColor} onChange={(v) => set("contentLabelColor", v)} />
              <NumField label="Footer Size" value={cfg.footerSize} onChange={(v) => set("footerSize", v)} />
            </div>
          </Card>

          <Card title="Watermark Logo">
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2 text-[13px] text-slate-700">
                <input type="checkbox" checked={cfg.watermark} onChange={(e) => set("watermark", e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                Show faded logo behind content
              </label>
              {!user?.schoolLogo && <p className="text-[11px] text-amber-600">No school logo set — add one in My Profile → Edit School Info.</p>}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transparency · {Math.round(cfg.watermarkOpacity * 100)}%</label>
                <input type="range" min="0" max="0.5" step="0.01" value={cfg.watermarkOpacity}
                  onChange={(e) => set("watermarkOpacity", Number(e.target.value))} disabled={!cfg.watermark}
                  className="w-full accent-indigo-600 disabled:opacity-40" />
              </div>
            </div>
          </Card>

          <Card title="Fields">
            <div className="p-4 grid grid-cols-2 gap-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" checked={!!cfg.fields[f.key]} onChange={(e) => setField(f.key, e.target.checked)} className="accent-indigo-600 w-4 h-4" />
                  {f.label}
                </label>
              ))}
            </div>
          </Card>

          {cfg.twoSided && (
            <Card title="Back Side Text">
              <div className="p-4">
                <textarea value={cfg.backText} onChange={(e) => set("backText", e.target.value)} rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
            </Card>
          )}
        </div>

        {/* ── Live preview (pinned — does not scroll) ──────────────────── */}
        <div className="lg:sticky lg:top-4 self-start">
          <div className="no-print bg-slate-100 rounded-2xl border border-slate-200 p-8 flex flex-wrap items-start justify-center gap-8 min-h-[480px]">
            {(cfg.twoSided ? [side] : ["front"]).map((s) => (
              <IdCardFace key={s} cfg={cfg} student={previewStudent} face={s} logo={user?.schoolLogo} />
            ))}
          </div>
          <div className="id-print-area hidden print:flex">
            <IdCardFace cfg={cfg} student={previewStudent} face="front" logo={user?.schoolLogo} />
            {cfg.twoSided && <IdCardFace cfg={cfg} student={previewStudent} face="back" logo={user?.schoolLogo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0" />
        <span className="text-[11px] font-mono text-slate-500 uppercase">{value}</span>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, min = 6, max = 48 }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label} (px)</label>
      <input type="number" min={min} max={max} value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
    </div>
  );
}
