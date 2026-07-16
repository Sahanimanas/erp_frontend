/**
 * Ready-made ID-card design presets (shared by the Student and Employee ID Card
 * editors). A preset is just a bundle of the VISUAL cfg fields — colours and a
 * few typography accents. Applying one leaves the card's *content* untouched
 * (header text / school name, sub-header, selected fields, sizes, orientation,
 * watermark, back text), so an admin can pick a finished look in one click and
 * then still tweak or Save it as their own template.
 *
 * Because every value here already exists in the card `cfg` schema, presets
 * render and print identically to a hand-built template — no new plumbing.
 */

/** The cfg keys a preset is allowed to set — everything else is preserved. */
export const PRESET_KEYS = [
  "headerColor", "headerTextColor", "subHeaderColor", "accentColor",
  "footerColor", "footerTextColor", "bodyColor",
  "nameColor", "contentColor", "contentLabelColor",
];

export const CARD_PRESETS = [
  {
    id: "amber-navy",
    name: "Amber Navy",
    cfg: {
      headerColor: "#facc15", headerTextColor: "#1e293b", subHeaderColor: "#1e293b",
      accentColor: "#1e3a8a", footerColor: "#1e3a8a", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#1e293b", contentColor: "#334155", contentLabelColor: "#94a3b8",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    cfg: {
      headerColor: "#6d28d9", headerTextColor: "#ffffff", subHeaderColor: "#ede9fe",
      accentColor: "#7c3aed", footerColor: "#6d28d9", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#4c1d95", contentColor: "#334155", contentLabelColor: "#a78bda",
    },
  },
  {
    id: "teal-green",
    name: "Teal Green",
    cfg: {
      headerColor: "#0d9488", headerTextColor: "#ffffff", subHeaderColor: "#ccfbf1",
      accentColor: "#14b8a6", footerColor: "#0f766e", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#134e4a", contentColor: "#334155", contentLabelColor: "#5eead4",
    },
  },
  {
    id: "navy-orange",
    name: "Navy Orange",
    cfg: {
      headerColor: "#1e3a8a", headerTextColor: "#ffffff", subHeaderColor: "#dbeafe",
      accentColor: "#f97316", footerColor: "#f97316", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#1e3a8a", contentColor: "#334155", contentLabelColor: "#94a3b8",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    cfg: {
      headerColor: "#2563eb", headerTextColor: "#ffffff", subHeaderColor: "#dbeafe",
      accentColor: "#3b82f6", footerColor: "#1d4ed8", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#1e3a8a", contentColor: "#334155", contentLabelColor: "#93c5fd",
    },
  },
  {
    id: "crimson-red",
    name: "Crimson Red",
    cfg: {
      headerColor: "#dc2626", headerTextColor: "#ffffff", subHeaderColor: "#fee2e2",
      accentColor: "#ef4444", footerColor: "#b91c1c", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#7f1d1d", contentColor: "#334155", contentLabelColor: "#fca5a5",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    cfg: {
      headerColor: "#15803d", headerTextColor: "#ffffff", subHeaderColor: "#dcfce7",
      accentColor: "#22c55e", footerColor: "#166534", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#14532d", contentColor: "#334155", contentLabelColor: "#86efac",
    },
  },
  {
    id: "clean-blue",
    name: "Clean Blue",
    cfg: {
      headerColor: "#ffffff", headerTextColor: "#1d4ed8", subHeaderColor: "#2563eb",
      accentColor: "#2563eb", footerColor: "#2563eb", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#0f172a", contentColor: "#334155", contentLabelColor: "#94a3b8",
    },
  },
  {
    id: "slate-professional",
    name: "Slate Pro",
    cfg: {
      headerColor: "#0f172a", headerTextColor: "#ffffff", subHeaderColor: "#cbd5e1",
      accentColor: "#0ea5e9", footerColor: "#334155", footerTextColor: "#ffffff",
      bodyColor: "#ffffff", nameColor: "#0f172a", contentColor: "#334155", contentLabelColor: "#94a3b8",
    },
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    cfg: {
      headerColor: "#f1f5f9", headerTextColor: "#0f172a", subHeaderColor: "#475569",
      accentColor: "#6366f1", footerColor: "#e2e8f0", footerTextColor: "#0f172a",
      bodyColor: "#ffffff", nameColor: "#0f172a", contentColor: "#334155", contentLabelColor: "#94a3b8",
    },
  },
];

/** Merge a preset's visual fields onto an existing cfg, keeping all content. */
export function applyPreset(cfg, preset) {
  return { ...cfg, ...preset.cfg };
}
