/**
 * Shared ID-card model + renderer used by the ID Card Editor and the Student ID
 * Print list. Templates designed in the editor are saved here (localStorage) so
 * the print page can pick any of them.
 */
export const TEMPLATES_KEY = "id_card_templates_v1";
const LEGACY_KEY = "id_card_design_v1";

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export function makeDefaultCfg(schoolName) {
  return {
    orientation: "vertical",
    twoSided: false,
    headerColor: "#facc15",
    headerTextColor: "#1f2937",
    headerText: schoolName || "School Name",
    subHeader: "STUDENT IDENTITY CARD",
    accentColor: "#6366f1",
    footerColor: "#6366f1",
    footerTextColor: "#ffffff",
    bodyColor: "#ffffff",
    showLogo: true,
    watermark: true,
    watermarkOpacity: 0.08,
    // Typography (sizes in px)
    headerSize: 15,
    subHeaderSize: 9,
    subHeaderColor: "#1f2937",
    nameSize: 15,
    nameColor: "#1f2937",
    contentSize: 11,
    contentColor: "#334155",
    contentLabelColor: "#94a3b8",
    footerSize: 14,
    logoSize: 28,
    photoSize: 96,
    fields: { photo: true, name: true, klass: true, roll: true, admission: true, dob: true, blood: true, gender: false, phone: false, barcode: true },
    backText: "This card is the property of the school. If found, please return it to the school office.",
  };
}

// ─── Template persistence (localStorage) ─────────────────────────────────────
export function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
    // One-time migration of the old single-design key into a named template.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const list = [{ id: "tpl-legacy", name: "Template 1", cfg: JSON.parse(legacy) }];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
      return list;
    }
  } catch { /* ignore */ }
  return [];
}

export function saveTemplates(list) {
  try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

// ─── Card renderer (one face) ────────────────────────────────────────────────
export function IdCardFace({ cfg, student, face = "front", logo, scale = 1 }) {
  const horizontal = cfg.orientation === "horizontal";
  const name = `${student?.user?.firstName ?? ""} ${student?.user?.lastName ?? ""}`.trim() || "Student Name";
  const klass = `${student?.section?.class?.name ?? ""}-${student?.section?.name ?? ""}`.replace(/^-|-$/g, "") || "—";
  const f = cfg.fields || {};

  const base = horizontal ? { width: 460, height: 290 } : { width: 300, height: 460 };
  const size = { width: base.width * scale, height: base.height * scale };

  // Typography with fallbacks (templates saved before these existed still work).
  const t = {
    headerSize: cfg.headerSize ?? 15,
    subHeaderSize: cfg.subHeaderSize ?? 9,
    subHeaderColor: cfg.subHeaderColor ?? cfg.headerTextColor,
    nameSize: cfg.nameSize ?? 15,
    nameColor: cfg.nameColor ?? "#1f2937",
    contentSize: cfg.contentSize ?? 11,
    contentColor: cfg.contentColor ?? "#334155",
    contentLabelColor: cfg.contentLabelColor ?? "#94a3b8",
    footerSize: cfg.footerSize ?? 14,
    logoSize: cfg.logoSize ?? 28,
    photoSize: cfg.photoSize ?? 96,
  };

  const Watermark = cfg.watermark && logo ? (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <img src={logo} alt="" className="w-3/5 max-h-[60%] object-contain" style={{ opacity: cfg.watermarkOpacity }} />
    </div>
  ) : null;

  const rows = [
    f.roll && ["Roll No", student?.rollNumber || "—"],
    f.admission && ["Adm No", student?.admissionNumber || "—"],
    f.dob && ["D.O.B", fmtDate(student?.dateOfBirth)],
    f.blood && ["Blood", student?.bloodGroup || "—"],
    f.gender && ["Gender", student?.gender || "—"],
    f.phone && ["Phone", student?.user?.phone || "—"],
  ].filter(Boolean);

  const Header = (
    <div className="px-3 py-2.5 text-center shrink-0" style={{ backgroundColor: cfg.headerColor, color: cfg.headerTextColor }}>
      <div className="flex items-center justify-center gap-2">
        {cfg.showLogo && logo && <img src={logo} alt="" className="rounded object-cover bg-white" style={{ width: t.logoSize, height: t.logoSize }} />}
        <p className="font-extrabold leading-tight tracking-tight" style={{ fontSize: t.headerSize }}>{cfg.headerText}</p>
      </div>
      {cfg.subHeader && <p className="font-semibold mt-0.5 tracking-wider whitespace-pre-line" style={{ fontSize: t.subHeaderSize, color: t.subHeaderColor }}>{cfg.subHeader}</p>}
    </div>
  );

  const Footer = f.name ? (
    <div className="px-3 py-2 text-center shrink-0" style={{ backgroundColor: cfg.footerColor, color: cfg.footerTextColor }}>
      <p className="font-bold uppercase truncate" style={{ fontSize: t.footerSize }}>{name}</p>
    </div>
  ) : null;

  if (face === "back") {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 flex flex-col" style={size}>
        {Header}
        <div className="relative flex-1 p-4 flex flex-col" style={{ backgroundColor: cfg.bodyColor }}>
          {Watermark}
          <p className="relative z-10 leading-relaxed flex-1 whitespace-pre-line" style={{ fontSize: t.contentSize, color: t.contentColor }}>{cfg.backText}</p>
          <div className="relative z-10 mt-4">
            <div className="border-t border-slate-300 pt-1 text-center text-[10px] text-slate-500">Authorised Signatory</div>
          </div>
        </div>
        {Footer}
      </div>
    );
  }

  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const photoBox = { width: t.photoSize, height: t.photoSize };
  const Photo = f.photo && (
    <div className="shrink-0">
      {student?.photo
        ? <img src={student.photo} alt={name} className="object-cover rounded-lg border border-slate-200" style={photoBox} />
        : <div className="rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-500" style={{ ...photoBox, fontSize: Math.max(12, t.photoSize / 3) }}>{initials}</div>}
    </div>
  );

  // Top row: photo beside only the student name (+ class). Other details go below.
  const NameBlock = (f.name || f.klass) ? (
    <div className="flex-1 min-w-0">
      {f.name && <p className="font-bold leading-tight" style={{ fontSize: t.nameSize, color: t.nameColor }}>{name}</p>}
      {f.klass && <p className="font-semibold mt-0.5" style={{ color: cfg.accentColor, fontSize: t.contentSize + 1 }}>Class {klass}</p>}
    </div>
  ) : null;

  const DetailRows = (
    <div className="w-full">
      <div className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3" style={{ fontSize: t.contentSize }}>
            <span style={{ color: t.contentLabelColor }}>{label}</span>
            <span className="font-semibold truncate" style={{ color: t.contentColor }}>{value}</span>
          </div>
        ))}
      </div>
      {f.barcode && (
        <div className="mt-3">
          <div className="h-9 w-full rounded-sm" style={{ background: "repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 4px,#111 4px 5px,#fff 5px 8px)" }} />
          <p className="text-[8px] text-center text-slate-400 tracking-[0.3em] mt-0.5">{student?.rollNumber || "—"}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 flex flex-col" style={size}>
      {Header}
      <div className="relative flex-1" style={{ backgroundColor: cfg.bodyColor }}>
        {Watermark}
        <div className="relative z-10 h-full p-4 flex flex-col gap-3 text-left">
          {/* Photo beside the name only */}
          <div className="flex flex-row items-center gap-4">
            {Photo}
            {NameBlock}
          </div>
          {DetailRows}
        </div>
      </div>
      {Footer}
    </div>
  );
}
