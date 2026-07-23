/**
 * IdCardRenderer — the single card renderer behind BOTH the student and the
 * employee ID cards.
 *
 * The student / employee modules keep their own thin wrappers (`IdCardFace`,
 * `EmpIdCardFace`) that map their entity onto the neutral prop shape below;
 * everything about how a card *looks* lives here, so a design added once shows
 * up on both sides.
 *
 *   cfg.layout  — picks the arrangement + decoration (see LAYOUTS)
 *   cfg.fields  — the admin's field selection; the caller has already reduced it
 *                 to `rows`, and passes photo/title/subtitle as null when the
 *                 admin unticked them. Nothing renders that wasn't selected.
 *
 * Cards are drawn at a fixed pixel size (300×460 portrait / 460×290 landscape)
 * and scaled with a CSS transform, so a thumbnail is pixel-for-pixel the card
 * that prints.
 */

export const CARD_SIZE = {
  vertical: { width: 300, height: 460 },
  horizontal: { width: 460, height: 290 },
};

/** Layout ids in gallery order, with the label shown under each thumbnail. */
export const LAYOUTS = [
  { id: "classic", name: "Classic Band" },
  { id: "ribbon", name: "Ribbon" },
  { id: "wave", name: "Wave" },
  { id: "arc", name: "Arc" },
  { id: "sideband", name: "Side Band" },
  { id: "diagonal", name: "Diagonal" },
  { id: "hero", name: "Photo Hero" },
  { id: "minimal", name: "Minimal" },
];

/** Typography / size defaults — templates saved before a key existed still work. */
function typography(cfg) {
  return {
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
}

export default function IdCardRenderer({
  cfg = {},
  logo,
  face = "front",
  scale = 1,
  title = "",          // person's name — null/empty when the admin unticked it
  subtitle = "",       // class-section (student) / designation (employee)
  photo,               // image url, or null when the photo field is off
  showPhoto = true,
  rows = [],           // [[label, value], …] already filtered by field selection
  barcodeText,         // falsy → no barcode
}) {
  const horizontal = cfg.orientation === "horizontal";
  const base = horizontal ? CARD_SIZE.horizontal : CARD_SIZE.vertical;
  const t = typography(cfg);
  const layout = cfg.layout || "classic";
  const decor = cfg.decorColor || cfg.accentColor || cfg.headerColor;
  const round = cfg.photoShape === "circle";

  // ── Shared pieces ────────────────────────────────────────────────────────
  const initials = (title || "")
    .split(/\s+/).map((w) => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "ID";

  const Photo = showPhoto && photo !== null ? (
    <div className="shrink-0">
      {photo ? (
        <img
          src={photo}
          alt=""
          className="object-cover border-2 border-white shadow-sm"
          style={{ width: t.photoSize, height: t.photoSize, borderRadius: round ? "50%" : 8 }}
        />
      ) : (
        <div
          className="border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center font-bold text-slate-500"
          style={{
            width: t.photoSize, height: t.photoSize,
            borderRadius: round ? "50%" : 8,
            fontSize: Math.max(12, t.photoSize / 3),
          }}
        >
          {initials}
        </div>
      )}
    </div>
  ) : null;

  const Logo = cfg.showLogo && logo ? (
    <img src={logo} alt="" className="object-contain bg-white rounded shrink-0"
      style={{ width: t.logoSize, height: t.logoSize }} />
  ) : null;

  // In a banded header with the school name hidden, the logo IS the header —
  // stretch it across the full width (height = Logo Size) instead of leaving a
  // small square floating in the middle.
  const HeaderLogo = cfg.showLogo && logo && cfg.showName === false ? (
    <img src={logo} alt="" className="w-full object-contain" style={{ height: t.logoSize }} />
  ) : Logo;

  const Watermark = cfg.watermark && logo ? (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <img src={logo} alt="" className="w-3/5 max-h-[60%] object-contain"
        style={{ opacity: cfg.watermarkOpacity ?? 0.08 }} />
    </div>
  ) : null;

  const SchoolName = cfg.showName !== false && cfg.headerText ? (
    <p className="font-extrabold leading-tight tracking-tight" style={{ fontSize: t.headerSize }}>
      {cfg.headerText}
    </p>
  ) : null;

  const SubHeader = cfg.subHeader ? (
    <p className="font-semibold tracking-wider whitespace-pre-line leading-tight"
      style={{ fontSize: t.subHeaderSize, color: t.subHeaderColor }}>
      {cfg.subHeader}
    </p>
  ) : null;

  const Name = title ? (
    <p className="font-bold leading-tight truncate" style={{ fontSize: t.nameSize, color: t.nameColor }}>
      {title}
    </p>
  ) : null;

  const Subtitle = subtitle ? (
    <p className="font-semibold leading-tight truncate"
      style={{ color: cfg.accentColor, fontSize: t.contentSize + 1 }}>
      {subtitle}
    </p>
  ) : null;

  const Rows = rows.length ? (
    <div className="w-full space-y-1">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3" style={{ fontSize: t.contentSize }}>
          <span className="shrink-0" style={{ color: t.contentLabelColor }}>{label}</span>
          <span className="font-semibold truncate text-right" style={{ color: t.contentColor }}>{value}</span>
        </div>
      ))}
    </div>
  ) : null;

  const Barcode = barcodeText ? (
    <div className="w-full">
      <div className="h-8 w-full rounded-sm"
        style={{ background: "repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 4px,#111 4px 5px,#fff 5px 8px)" }} />
      <p className="text-[8px] text-center text-slate-400 tracking-[0.3em] mt-0.5">{barcodeText}</p>
    </div>
  ) : null;

  const Shell = ({ children }) => (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 shrink-0"
      style={{
        width: base.width, height: base.height,
        backgroundColor: cfg.bodyColor || "#ffffff",
        transform: scale === 1 ? undefined : `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  );

  // ── Back face is layout-independent ──────────────────────────────────────
  if (face === "back") {
    return (
      <Shell>
        <div className="h-full flex flex-col">
          <div className="px-3 py-2.5 text-center shrink-0"
            style={{ backgroundColor: cfg.headerColor, color: cfg.headerTextColor }}>
            <div className="flex items-center justify-center gap-2">{HeaderLogo}{SchoolName}</div>
          </div>
          <div className="relative flex-1 p-4 flex flex-col">
            {Watermark}
            <p className="relative z-10 leading-relaxed flex-1 whitespace-pre-line"
              style={{ fontSize: t.contentSize, color: t.contentColor }}>
              {cfg.backText}
            </p>
            <div className="relative z-10 mt-4 border-t border-slate-300 pt-1 text-center text-[10px] text-slate-500">
              Authorised Signatory
            </div>
          </div>
          {title && (
            <div className="px-3 py-2 text-center shrink-0"
              style={{ backgroundColor: cfg.footerColor, color: cfg.footerTextColor }}>
              <p className="font-bold uppercase truncate" style={{ fontSize: t.footerSize }}>{title}</p>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  const pieces = {
    Photo, Logo, HeaderLogo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode,
    // Raw strings too — a couple of layouts re-print the name / school name in a
    // different style rather than reusing the element above.
    title, schoolName: cfg.headerText,
    t, cfg, decor, base, horizontal,
  };

  return <Shell>{renderLayout(layout, pieces)}</Shell>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUTS
// Each returns the full front face. They share the pieces above so a field the
// admin turned off is simply absent everywhere.
// ─────────────────────────────────────────────────────────────────────────────
function renderLayout(layout, p) {
  switch (layout) {
    case "ribbon": return <Ribbon {...p} />;
    case "wave": return <Wave {...p} />;
    case "arc": return <Arc {...p} />;
    case "sideband": return <SideBand {...p} />;
    case "diagonal": return <Diagonal {...p} />;
    case "hero": return <Hero {...p} />;
    case "minimal": return <Minimal {...p} />;
    case "classic":
    default: return <Classic {...p} />;
  }
}

/** Header band → content → name footer. The original card. */
function Classic({ Photo, HeaderLogo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, title, t, cfg, horizontal }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2.5 text-center shrink-0"
        style={{ backgroundColor: cfg.headerColor, color: cfg.headerTextColor }}>
        <div className="flex items-center justify-center gap-2">{HeaderLogo}{SchoolName}</div>
        {SubHeader && <div className="mt-0.5">{SubHeader}</div>}
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className={`relative z-10 h-full p-4 flex gap-3 ${horizontal ? "flex-row items-start" : "flex-col"}`}>
          <div className={`flex gap-4 ${horizontal ? "flex-col items-center" : "flex-row items-center"}`}>
            {Photo}
            {!horizontal && <div className="flex-1 min-w-0">{Name}{Subtitle}</div>}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {horizontal && <div>{Name}{Subtitle}</div>}
            {Rows}
            {Barcode}
          </div>
        </div>
      </div>
      {title && (
        <div className="px-3 py-2 text-center shrink-0"
          style={{ backgroundColor: cfg.footerColor, color: cfg.footerTextColor }}>
          <p className="font-bold uppercase truncate" style={{ fontSize: t.footerSize }}>{title}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Header band, then an angled colour ribbon carrying the sub-title (the
 * "TEACHER" / "STUDENT" strip seen on most school ID cards), centred photo.
 */
function Ribbon({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, t, cfg, decor }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-2.5 pb-1 text-center shrink-0"
        style={{ backgroundColor: cfg.headerColor, color: cfg.headerTextColor }}>
        <div className="flex items-center justify-center gap-2">{Logo}{SchoolName}</div>
      </div>
      {/* Angled ribbon — the sub-header doubles as the ID type. */}
      <div className="relative shrink-0" style={{ backgroundColor: cfg.headerColor }}>
        <div
          className="px-4 py-1 text-center"
          style={{
            backgroundColor: decor,
            color: cfg.footerTextColor || "#fff",
            clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
          }}
        >
          <p className="font-bold uppercase tracking-[0.2em] leading-tight whitespace-pre-line"
            style={{ fontSize: (t.subHeaderSize ?? 9) + 1 }}>
            {cfg.subHeader || " "}
          </p>
        </div>
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full p-4 flex flex-col items-center gap-2">
          {Photo}
          <div className="text-center w-full">{Name}{Subtitle}</div>
          <div className="flex-1 w-full min-h-0 flex flex-col justify-end gap-2">
            {Rows}
            {Barcode}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Coloured top with a wave edge; photo overlaps the wave. */
function Wave({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, cfg, decor, base }) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute inset-x-0 top-0 z-0" style={{ height: base.height * 0.38 }}>
        <div className="absolute inset-0" style={{ backgroundColor: cfg.headerColor }} />
        <svg className="absolute bottom-0 left-0 w-full" height="34" viewBox="0 0 300 34" preserveAspectRatio="none">
          <path d="M0 14 C 60 34, 110 0, 160 12 S 250 32, 300 10 L300 34 L0 34 Z" fill={decor} opacity="0.55" />
          <path d="M0 22 C 70 40, 120 6, 175 18 S 255 36, 300 18 L300 34 L0 34 Z"
            fill={cfg.bodyColor || "#fff"} />
        </svg>
      </div>
      <div className="relative z-10 px-3 pt-3 text-center shrink-0" style={{ color: cfg.headerTextColor }}>
        <div className="flex items-center justify-center gap-2">{Logo}{SchoolName}</div>
        {SubHeader && <div className="mt-0.5">{SubHeader}</div>}
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full px-4 pb-4 pt-2 flex flex-col items-center gap-2">
          {Photo}
          <div className="text-center w-full">{Name}{Subtitle}</div>
          <div className="flex-1 w-full min-h-0 flex flex-col justify-end gap-2">{Rows}{Barcode}</div>
        </div>
      </div>
    </div>
  );
}

/** Quarter-circle arcs top-right and bottom-left, content centred between. */
function Arc({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, cfg, decor, base }) {
  const r = base.width * 0.9;
  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute rounded-full"
          style={{ width: r, height: r, top: -r * 0.62, left: -r * 0.18, backgroundColor: cfg.headerColor }} />
        <div className="absolute rounded-full"
          style={{ width: r * 0.8, height: r * 0.8, top: -r * 0.5, left: r * 0.25, backgroundColor: decor, opacity: 0.55 }} />
        <div className="absolute rounded-full"
          style={{ width: r * 0.7, height: r * 0.7, bottom: -r * 0.45, right: -r * 0.2, backgroundColor: decor, opacity: 0.28 }} />
      </div>
      <div className="relative z-10 px-3 pt-3 text-center shrink-0" style={{ color: cfg.headerTextColor }}>
        <div className="flex items-center justify-center gap-2">{Logo}{SchoolName}</div>
        {SubHeader && <div className="mt-0.5">{SubHeader}</div>}
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full p-4 flex flex-col items-center gap-2">
          {Photo}
          <div className="text-center w-full">{Name}{Subtitle}</div>
          <div className="flex-1 w-full min-h-0 flex flex-col justify-end gap-2">{Rows}{Barcode}</div>
        </div>
      </div>
    </div>
  );
}

/** Colour strip down the left edge carrying the school name sideways. */
function SideBand({ Photo, Logo, Watermark, SubHeader, Name, Subtitle, Rows, Barcode, schoolName, cfg, horizontal }) {
  return (
    <div className="h-full flex flex-row">
      <div className="shrink-0 flex flex-col items-center justify-between py-3"
        style={{ width: horizontal ? 74 : 58, backgroundColor: cfg.headerColor, color: cfg.headerTextColor }}>
        {Logo}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="whitespace-nowrap font-extrabold tracking-widest uppercase"
            style={{ transform: "rotate(-90deg)", fontSize: 11 }}>
            {cfg.showName === false ? "" : schoolName}
          </div>
        </div>
      </div>
      <div className="relative flex-1 min-w-0">
        {Watermark}
        <div className="relative z-10 h-full p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {Photo}
            <div className="flex-1 min-w-0">{Name}{Subtitle}{SubHeader}</div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-end gap-2">{Rows}{Barcode}</div>
        </div>
      </div>
    </div>
  );
}

/** Diagonal colour split behind the header, white content below. */
function Diagonal({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, cfg, decor, base }) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute inset-x-0 top-0 z-0" style={{ height: base.height * 0.46 }}>
        <div className="absolute inset-0"
          style={{ backgroundColor: cfg.headerColor, clipPath: "polygon(0 0, 100% 0, 100% 62%, 0 100%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundColor: decor, opacity: 0.5, clipPath: "polygon(0 0, 100% 0, 100% 42%, 0 78%)" }} />
      </div>
      <div className="relative z-10 px-3 pt-3 text-center shrink-0" style={{ color: cfg.headerTextColor }}>
        <div className="flex items-center justify-center gap-2">{Logo}{SchoolName}</div>
        {SubHeader && <div className="mt-0.5">{SubHeader}</div>}
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full p-4 flex flex-col items-center gap-2">
          {Photo}
          <div className="text-center w-full">{Name}{Subtitle}</div>
          <div className="flex-1 w-full min-h-0 flex flex-col justify-end gap-2">{Rows}{Barcode}</div>
        </div>
      </div>
    </div>
  );
}

/** Full-bleed photo up top with the name over a gradient, details below. */
function Hero({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, cfg, base }) {
  return (
    <div className="h-full flex flex-col">
      <div className="relative shrink-0 flex items-end justify-center overflow-hidden"
        style={{ height: base.height * 0.5, backgroundColor: cfg.headerColor }}>
        <div className="absolute top-0 inset-x-0 z-20 px-3 py-2 flex items-center justify-center gap-2"
          style={{ color: cfg.headerTextColor }}>
          {Logo}{SchoolName}
        </div>
        <div className="relative z-10 pb-3">{Photo}</div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-0"
          style={{ background: `linear-gradient(to top, ${cfg.bodyColor || "#fff"}, transparent)` }} />
      </div>
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full px-4 py-3 flex flex-col gap-2">
          <div className="text-center">{Name}{Subtitle}{SubHeader}</div>
          <div className="flex-1 min-h-0 flex flex-col justify-end gap-2">{Rows}{Barcode}</div>
        </div>
      </div>
    </div>
  );
}

/** Almost all white: a thin accent rule, left-aligned content, logo top-right. */
function Minimal({ Photo, Logo, Watermark, SchoolName, SubHeader, Name, Subtitle, Rows, Barcode, cfg, decor }) {
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0" style={{ height: 6, backgroundColor: decor }} />
      <div className="relative flex-1 min-h-0">
        {Watermark}
        <div className="relative z-10 h-full p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2" style={{ color: cfg.headerTextColor === "#ffffff" ? "#0f172a" : cfg.headerTextColor }}>
            <div className="min-w-0">{SchoolName}{SubHeader}</div>
            {Logo}
          </div>
          <div className="flex items-center gap-3">
            {Photo}
            <div className="flex-1 min-w-0">{Name}{Subtitle}</div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-end gap-2">
            {Rows}
            {Barcode}
          </div>
        </div>
      </div>
      <div className="shrink-0" style={{ height: 6, backgroundColor: decor }} />
    </div>
  );
}
