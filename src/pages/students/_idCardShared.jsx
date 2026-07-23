/**
 * Shared ID-card model used by the ID Card Editor and the Student ID Print
 * list. Templates designed in the editor are saved here (localStorage) so the
 * print page can pick any of them.
 *
 * The drawing itself lives in components/idcard/IdCardRenderer — this file just
 * maps a Student onto that renderer's neutral props, so student and staff cards
 * share every layout.
 */
import IdCardRenderer from "../../components/idcard/IdCardRenderer";

export const TEMPLATES_KEY = "id_card_templates_v1";
const LEGACY_KEY = "id_card_design_v1";

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export function makeDefaultCfg(schoolName) {
  return {
    orientation: "vertical",
    twoSided: false,
    layout: "classic",
    photoShape: "rect",
    decorColor: "#6366f1",
    headerColor: "#facc15",
    headerTextColor: "#1f2937",
    headerText: schoolName || "School Name",
    subHeader: "STUDENT IDENTITY CARD",
    accentColor: "#6366f1",
    footerColor: "#6366f1",
    footerTextColor: "#ffffff",
    bodyColor: "#ffffff",
    showName: true,
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
    fields: { photo: true, name: true, klass: true, roll: true, admission: true, dob: true, blood: true, gender: false, phone: false, father: false, mother: false, guardian: false, address: false, barcode: true },
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
/**
 * Maps a Student onto the shared renderer. Every visible piece is gated on the
 * admin's field selection (`cfg.fields`) — an unticked field is not passed
 * down at all, so no layout can accidentally reintroduce it.
 */
export function IdCardFace({ cfg, student, face = "front", logo, scale = 1 }) {
  const f = cfg?.fields || {};
  const name = `${student?.user?.firstName ?? ""} ${student?.user?.lastName ?? ""}`.trim() || "Student Name";
  const klass = `${student?.section?.class?.name ?? ""}-${student?.section?.name ?? ""}`.replace(/^-|-$/g, "");

  const rows = [
    f.roll && ["Roll No", student?.rollNumber || "—"],
    f.admission && ["Adm No", student?.admissionNumber || "—"],
    f.dob && ["D.O.B", fmtDate(student?.dateOfBirth)],
    f.blood && ["Blood", student?.bloodGroup || "—"],
    f.gender && ["Gender", student?.gender || "—"],
    f.phone && ["Phone", student?.user?.phone || "—"],
    f.father && ["Father", student?.fatherName || "—"],
    f.mother && ["Mother", student?.motherName || "—"],
    f.guardian && ["Guardian", student?.guardianName || "—"],
    f.address && ["Address", student?.address || "—"],
  ].filter(Boolean);

  return (
    <IdCardRenderer
      cfg={cfg}
      logo={logo}
      face={face}
      scale={scale}
      showPhoto={!!f.photo}
      photo={student?.photo || ""}
      title={f.name ? name : ""}
      subtitle={f.klass && klass ? `Class ${klass}` : ""}
      rows={rows}
      barcodeText={f.barcode ? student?.rollNumber || "—" : ""}
    />
  );
}
