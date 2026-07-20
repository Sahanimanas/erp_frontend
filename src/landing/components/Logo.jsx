import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@site/utils/data";
import { useSiteBrand } from "@site/lib/useSiteBrand";

/**
 * Site logo.
 *
 * On a school's own domain/subdomain this renders that school's name and logo
 * (resolved via /public/school, the same lookup the login page uses). On the
 * platform domain it falls back to the Global School Mitra emblem.
 */
export default function Logo({ compact = false, showTagline = true }) {
    const brand = useSiteBrand();
    const [imgOk, setImgOk] = useState(true);

    return (
        <Link
            to="/"
            data-testid="brand-logo-link"
            className="flex items-center gap-3 group"
            aria-label={`${brand.name} home`}
        >
            <span className="relative flex h-12 w-12 items-center justify-center shrink-0">
                {/* Halo behind the emblem */}
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-500/20 dark:to-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {imgOk ? (
                    <img
                        src={brand.logo || "/brand/sm-logo.png"}
                        alt={brand.name}
                        width={48}
                        height={48}
                        onError={() => setImgOk(false)}
                        className="relative h-12 w-12 object-contain drop-shadow-[0_4px_12px_rgba(30,58,138,0.18)] group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    // Last-resort monogram so the header never shows a broken image.
                    <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-800 to-orange-600 text-white font-extrabold">
                        {brand.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
            </span>

            {!compact && (
                <div className="flex flex-col leading-none">
                    {brand.isSchoolDomain ? (
                        <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-foreground max-w-[220px] truncate">
                            {brand.name}
                        </span>
                    ) : (
                        <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-foreground">
                            <span className="text-blue-800 dark:text-blue-300">GLOBAL</span>{" "}
                            <span className="text-orange-600 dark:text-orange-400">SCHOOL MITRA</span>
                        </span>
                    )}
                    {showTagline && (
                        <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground mt-1 font-semibold">
                            {BRAND.subKind.replace(/\s*\|\s*/g, " · ")}
                        </span>
                    )}
                </div>
            )}
        </Link>
    );
}
