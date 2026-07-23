/**
 * Gallery of ready-made ID-card templates. Each tile is the REAL card renderer
 * scaled down, so the thumbnail is pixel-for-pixel what will print — no
 * approximate mini-mockups that drift from the actual output.
 *
 * The parent supplies `renderCard(cfg, scale)` because the student and employee
 * editors render different entities; everything else (selection, sizing,
 * labels) is shared.
 */
import { CARD_PRESETS, applyPreset } from "../utils/cardPresets";
import { CARD_SIZE } from "./idcard/IdCardRenderer";

export default function CardPresetGallery({ cfg, activeId, onPick, renderCard, scale = 0.34 }) {
  const base = cfg?.orientation === "horizontal" ? CARD_SIZE.horizontal : CARD_SIZE.vertical;
  const box = { width: Math.round(base.width * scale), height: Math.round(base.height * scale) };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {CARD_PRESETS.map((p) => {
        const active = activeId === p.id;
        // Preview the design against the CURRENT card content (school name,
        // chosen fields, orientation) so the tile shows the admin's own card.
        const previewCfg = applyPreset(cfg || {}, p);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            title={`Apply “${p.name}”`}
            className={`group rounded-lg border p-1.5 overflow-hidden text-left transition focus:outline-none ${
              active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-indigo-300"
            }`}
          >
            <div className="mx-auto overflow-hidden" style={box}>
              {renderCard(previewCfg, scale)}
            </div>
            <div className={`text-center text-[10.5px] font-semibold pt-1.5 truncate ${active ? "text-indigo-600" : "text-slate-600"}`}>
              {p.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
