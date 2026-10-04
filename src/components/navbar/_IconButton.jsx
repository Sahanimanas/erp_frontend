/**
 * _IconButton.jsx — topbar button primitives for the genixPay-style bar
 * ─────────────────────────────────────────────────────────────────────────────
 * The reference design draws every topbar action as a diamond: a square turned
 * 45°. Rotating the button also rotates its contents, so the icon is wrapped in
 * a counter-rotated span — that keeps the glyph upright while the frame tilts.
 *
 * The badge lives OUTSIDE the rotated element (in the relative wrapper) because
 * anything inside inherits the 45° turn and would sit askew on the corner.
 */
import { User } from "lucide-react";

/** Shared focus ring — dropdowns are keyboard-driven, so focus must be visible. */
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

export function DiamondButton({
  icon: Icon,
  label,
  onClick,
  badge,
  active = false,
  expanded,
  controls,
  disabled = false,
  className = "",
}) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        aria-haspopup={controls ? "menu" : undefined}
        aria-expanded={expanded}
        aria-controls={expanded ? controls : undefined}
        className={[
          // 44px diagonal box keeps the row compact enough for phone widths.
          // The lift on hover is what makes a flat diamond feel pressable; it
          // rides on top of the 45° turn because Tailwind composes transforms.
          "group grid h-11 w-11 rotate-45 place-items-center rounded-[3px] border",
          "transition-all duration-200 ease-out",
          disabled
            ? "cursor-not-allowed border-[#e8e8e8] bg-white opacity-50"
            : active
              ? "border-[var(--erp-primary)] bg-gradient-to-br from-[var(--erp-primary)] to-[var(--erp-primary-dk)] shadow-[0_4px_12px_rgba(60,141,188,0.45)]"
              : "border-[#dfe3e8] bg-gradient-to-br from-white to-slate-50 shadow-[0_1px_2px_rgba(16,24,40,0.06)] " +
                "hover:-translate-y-[1px] hover:scale-[1.06] hover:border-[var(--erp-primary)] " +
                "hover:from-[var(--erp-primary-sf)] hover:to-white hover:shadow-[0_6px_16px_rgba(60,141,188,0.25)] " +
                "active:scale-100 active:translate-y-0",
          FOCUS_RING,
        ].join(" ")}
      >
        <span
          className={[
            "-rotate-45 transition-colors duration-200",
            disabled ? "text-slate-400" : active ? "text-white" : "text-slate-600 group-hover:text-[var(--erp-primary)]",
          ].join(" ")}
        >
          <Icon size={17} strokeWidth={1.9} />
        </span>
      </button>

      {badge > 0 && (
        // The white ring lifts the badge off whatever it overlaps, and the soft
        // halo behind it is what makes an unread count read as "new" at a glance.
        <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-10 flex min-w-[18px] items-center justify-center
                         rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-center text-[10px] font-bold
                         leading-[16px] text-white ring-2 ring-white shadow-[0_2px_6px_rgba(239,68,68,0.5)]">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </span>
  );
}

/**
 * The user tile is a SQUARE, not a diamond — in the reference it is the one
 * control that stays upright, which is what makes it read as a photo slot.
 * `size` is passed through because the same tile appears larger inside the
 * profile dropdown header.
 */
export function PhotoTile({ src, size = 40, alt = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-[4px] border border-[#dfe3e8] object-cover shadow-[0_1px_3px_rgba(16,24,40,0.12)]"
      />
    );
  }

  // No photo on the user record: show the person glyph + the word "Photo",
  // exactly as the legacy ERP renders an empty avatar slot.
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-[4px] border border-[#dfe3e8]
                 bg-gradient-to-br from-slate-50 to-slate-200 text-slate-500
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(16,24,40,0.06)]"
    >
      <User size={size * 0.4} strokeWidth={1.75} />
      <span style={{ fontSize: Math.max(7, size * 0.17) }} className="leading-none">
        Photo
      </span>
    </span>
  );
}

export { FOCUS_RING };
