/**
 * Ready-made ID-card templates (shared by the Student and Employee ID Card
 * editors).
 *
 * A template = a LAYOUT (how the card is arranged and decorated — see
 * `LAYOUTS` in components/idcard/IdCardRenderer.jsx) + a PALETTE (colours and a
 * couple of shape accents). Applying one leaves the card's *content* untouched:
 * header text, sub-header, the admin's field selection, sizes, orientation,
 * watermark and back text all survive. So an admin can pick a finished design
 * in one click, tick the fields they want, and save it as their own template.
 *
 * Every value here already exists in the card `cfg` schema, so a preset renders
 * and prints exactly like a hand-built template — no extra plumbing.
 */

/** The cfg keys a preset is allowed to set — everything else is preserved. */
export const PRESET_KEYS = [
  "layout", "photoShape", "decorColor",
  "headerColor", "headerTextColor", "subHeaderColor", "accentColor",
  "footerColor", "footerTextColor", "bodyColor",
  "nameColor", "contentColor", "contentLabelColor",
];

/** Colour families the templates are built from. */
const PALETTES = {
  amberNavy: {
    headerColor: "#facc15", headerTextColor: "#1e293b", subHeaderColor: "#1e293b",
    accentColor: "#1e3a8a", decorColor: "#1e3a8a", footerColor: "#1e3a8a", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#1e293b", contentColor: "#334155", contentLabelColor: "#94a3b8",
  },
  royalPurple: {
    headerColor: "#6d28d9", headerTextColor: "#ffffff", subHeaderColor: "#ede9fe",
    accentColor: "#7c3aed", decorColor: "#a78bfa", footerColor: "#6d28d9", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#4c1d95", contentColor: "#334155", contentLabelColor: "#a78bfa",
  },
  tealGreen: {
    headerColor: "#0d9488", headerTextColor: "#ffffff", subHeaderColor: "#ccfbf1",
    accentColor: "#14b8a6", decorColor: "#5eead4", footerColor: "#0f766e", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#134e4a", contentColor: "#334155", contentLabelColor: "#5eead4",
  },
  navyOrange: {
    headerColor: "#1e3a8a", headerTextColor: "#ffffff", subHeaderColor: "#dbeafe",
    accentColor: "#f97316", decorColor: "#f97316", footerColor: "#f97316", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#1e3a8a", contentColor: "#334155", contentLabelColor: "#94a3b8",
  },
  oceanBlue: {
    headerColor: "#2563eb", headerTextColor: "#ffffff", subHeaderColor: "#dbeafe",
    accentColor: "#3b82f6", decorColor: "#93c5fd", footerColor: "#1d4ed8", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#1e3a8a", contentColor: "#334155", contentLabelColor: "#93c5fd",
  },
  crimsonRed: {
    headerColor: "#ffffff", headerTextColor: "#1f2937", subHeaderColor: "#ffffff",
    accentColor: "#dc2626", decorColor: "#dc2626", footerColor: "#b91c1c", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#7f1d1d", contentColor: "#334155", contentLabelColor: "#fca5a5",
  },
  forestGreen: {
    headerColor: "#15803d", headerTextColor: "#ffffff", subHeaderColor: "#dcfce7",
    accentColor: "#22c55e", decorColor: "#86efac", footerColor: "#166534", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#14532d", contentColor: "#334155", contentLabelColor: "#86efac",
  },
  slatePro: {
    headerColor: "#0f172a", headerTextColor: "#ffffff", subHeaderColor: "#cbd5e1",
    accentColor: "#0ea5e9", decorColor: "#0ea5e9", footerColor: "#334155", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#0f172a", contentColor: "#334155", contentLabelColor: "#94a3b8",
  },
  minimalLight: {
    headerColor: "#ffffff", headerTextColor: "#0f172a", subHeaderColor: "#64748b",
    accentColor: "#6366f1", decorColor: "#6366f1", footerColor: "#e2e8f0", footerTextColor: "#0f172a",
    bodyColor: "#ffffff", nameColor: "#0f172a", contentColor: "#334155", contentLabelColor: "#94a3b8",
  },
  sunsetPink: {
    headerColor: "#be185d", headerTextColor: "#ffffff", subHeaderColor: "#fce7f3",
    accentColor: "#ec4899", decorColor: "#f9a8d4", footerColor: "#9d174d", footerTextColor: "#ffffff",
    bodyColor: "#ffffff", nameColor: "#831843", contentColor: "#334155", contentLabelColor: "#f9a8d4",
  },
};

const tpl = (id, name, layout, palette, extra = {}) => ({
  id, name, layout,
  cfg: { layout, photoShape: "rect", ...PALETTES[palette], ...extra },
});

/**
 * The gallery. Ordered so the first few are the safe, familiar school-ID looks
 * and the later ones are the more decorative options.
 */
export const CARD_PRESETS = [
  tpl("classic-amber", "Classic Amber", "classic", "amberNavy"),
  tpl("ribbon-red", "Ribbon Red", "ribbon", "crimsonRed"),
  tpl("classic-blue", "Classic Blue", "classic", "oceanBlue"),
  tpl("ribbon-navy", "Ribbon Navy", "ribbon", "navyOrange"),
  tpl("wave-teal", "Wave Teal", "wave", "tealGreen", { photoShape: "circle" }),
  tpl("wave-blue", "Wave Blue", "wave", "oceanBlue", { photoShape: "circle" }),
  tpl("arc-purple", "Arc Purple", "arc", "royalPurple", { photoShape: "circle" }),
  tpl("arc-green", "Arc Green", "arc", "forestGreen", { photoShape: "circle" }),
  tpl("side-slate", "Side Band Slate", "sideband", "slatePro"),
  tpl("side-purple", "Side Band Purple", "sideband", "royalPurple"),
  tpl("diagonal-navy", "Diagonal Navy", "diagonal", "navyOrange", { photoShape: "circle" }),
  tpl("diagonal-pink", "Diagonal Pink", "diagonal", "sunsetPink", { photoShape: "circle" }),
  tpl("hero-slate", "Photo Hero Slate", "hero", "slatePro"),
  tpl("hero-teal", "Photo Hero Teal", "hero", "tealGreen"),
  tpl("minimal-indigo", "Minimal Indigo", "minimal", "minimalLight"),
  tpl("minimal-green", "Minimal Green", "minimal", "forestGreen", {
    headerColor: "#ffffff", headerTextColor: "#14532d", subHeaderColor: "#4b5563",
  }),
];

/** Merge a preset's visual fields onto an existing cfg, keeping all content. */
export function applyPreset(cfg, preset) {
  return { ...cfg, ...preset.cfg };
}
