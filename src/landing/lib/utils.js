/**
 * utils.js — `cn` class-name helper for the ported marketing site.
 *
 * Joins conditional class values, then runs the result through `tailwind-merge`
 * so a caller's `className` genuinely overrides a component's base classes.
 *
 * This merge is not cosmetic. Without it, `<Button className="bg-white
 * text-blue-900">` keeps the base `text-primary-foreground` (white) alongside
 * the caller's `text-blue-900`, and whichever Tailwind emits later wins —
 * which rendered the CTA-banner and newsletter buttons as white-on-white.
 *
 * tailwind-merge is a zero-dependency, framework-agnostic string utility, so it
 * carries none of the React-19 coupling that kept Radix/framer-motion out.
 */
import { twMerge } from "tailwind-merge";

function collect(value, out) {
  if (!value) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
  } else if (Array.isArray(value)) {
    value.forEach((v) => collect(v, out));
  } else if (typeof value === "object") {
    for (const key in value) if (value[key]) out.push(key);
  }
}

export function cn(...inputs) {
  const out = [];
  inputs.forEach((v) => collect(v, out));
  return twMerge(out.join(" "));
}

export default cn;
