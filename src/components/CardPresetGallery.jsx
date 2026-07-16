/**
 * A gallery of ready-made ID-card design presets. Each tile is a mini preview of
 * the card (header / body / footer bands + accent) so the admin can pick a look
 * at a glance. Clicking a tile calls `onPick(preset)`; the parent merges the
 * preset's colours onto the current cfg. Used by both the Student and Employee
 * ID Card editors.
 */
import { CARD_PRESETS } from "../utils/cardPresets";

export default function CardPresetGallery({ activeId, onPick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {CARD_PRESETS.map((p) => {
        const c = p.cfg;
        const active = activeId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            title={`Apply “${p.name}” design`}
            className={`group rounded-lg border overflow-hidden text-left transition focus:outline-none ${
              active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-indigo-300"
            }`}
          >
            {/* Mini card preview */}
            <div className="h-[74px] flex flex-col" style={{ backgroundColor: c.bodyColor }}>
              <div className="h-[22px] flex items-center px-1.5 gap-1" style={{ backgroundColor: c.headerColor }}>
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.headerTextColor, opacity: 0.9 }} />
                <span className="h-1.5 flex-1 rounded-sm" style={{ backgroundColor: c.headerTextColor, opacity: 0.5 }} />
              </div>
              <div className="flex-1 flex items-center gap-1.5 px-1.5">
                <span className="w-4 h-4 rounded shrink-0 border border-black/5" style={{ backgroundColor: c.accentColor }} />
                <span className="flex flex-col gap-1 flex-1">
                  <span className="h-1.5 w-4/5 rounded-sm" style={{ backgroundColor: c.nameColor, opacity: 0.85 }} />
                  <span className="h-1 w-3/5 rounded-sm" style={{ backgroundColor: c.contentLabelColor }} />
                </span>
              </div>
              <div className="h-[16px]" style={{ backgroundColor: c.footerColor }} />
            </div>
            <div className={`text-center text-[11px] font-semibold py-1 ${active ? "text-indigo-600" : "text-slate-600"}`}>
              {p.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
