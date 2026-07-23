/**
 * Shared employee ID-card model + renderer used by the Employee ID Card Editor
 * and the Employee ID Print list. Templates designed in the editor are saved
 * here (localStorage) so the print page can pick any of them.
 *
 * NOTE: this uses a SEPARATE storage key from the student editor — employee and
 * student templates are fully independent. The drawing itself is shared, in
 * components/idcard/IdCardRenderer.
 */
import IdCardRenderer from "../../components/idcard/IdCardRenderer";

export const TEMPLATES_KEY = "emp_id_card_templates_v1";

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
    subHeader: "STAFF IDENTITY CARD",
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
    fields: { photo: true, name: true, designation: true, department: true, code: true, phone: true, email: false, blood: false, doj: false, barcode: true },
    backText: "This card is the property of the school. If found, please return it to the school office.",
  };
}

// ─── Template persistence (localStorage) ─────────────────────────────────────
export function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveTemplates(list) {
  try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

// ─── Card renderer (one face) ────────────────────────────────────────────────
/**
 * Maps an Employee onto the shared renderer (the same one the student cards
 * use, so both sides offer an identical set of designs). Every visible piece is
 * gated on the admin's field selection.
 */
export function EmpIdCardFace({ cfg, employee, face = "front", logo, scale = 1 }) {
  const f = cfg?.fields || {};
  const name = `${employee?.user?.firstName ?? ""} ${employee?.user?.lastName ?? ""}`.trim() || "Employee Name";
  const designation = employee?.designation?.name || employee?.user?.role || "Staff";

  const rows = [
    f.code && ["Code", employee?.employeeCode || "—"],
    f.department && ["Dept", employee?.department?.name || "—"],
    f.phone && ["Phone", employee?.user?.phone || "—"],
    f.email && ["Email", employee?.user?.email || "—"],
    f.blood && ["Blood", employee?.bloodGroup || "—"],
    f.doj && ["Joined", fmtDate(employee?.dateOfJoining)],
  ].filter(Boolean);

  return (
    <IdCardRenderer
      cfg={cfg}
      logo={logo}
      face={face}
      scale={scale}
      showPhoto={!!f.photo}
      photo={employee?.photo || ""}
      title={f.name ? name : ""}
      subtitle={f.designation ? designation : ""}
      rows={rows}
      barcodeText={f.barcode ? employee?.employeeCode || "—" : ""}
    />
  );
}
