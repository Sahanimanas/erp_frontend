/**
 * motion.jsx — dependency-free stand-in for the parts of `framer-motion`
 * the marketing site uses.
 * ─────────────────────────────────────────────────────────────────────────────
 * The source site was built against framer-motion 11 (a React-19-era package).
 * Rather than pull it into this React 18 app, we re-implement the small surface
 * that is actually used — `motion.<tag>`, `AnimatePresence` and `useInView` —
 * on top of IntersectionObserver + CSS transitions.
 *
 * Behavioural contract:
 *   · Animation-only props are swallowed so they never reach the DOM.
 *   · Any element that declared an entrance animation (`initial` / `animate` /
 *     `whileInView`) gets a fade-and-rise reveal the first time it scrolls into
 *     view. `transition.delay` is honoured so staggered lists still stagger.
 *   · Elements are ALWAYS visible once revealed — and SVG/plain elements that
 *     we don't animate render at full opacity immediately. Nothing can get
 *     stuck at opacity 0, which is the main failure mode of a naive shim.
 */
import { createElement, forwardRef, useEffect, useRef, useState } from "react";

// Props framer-motion consumes itself — React would warn if they hit the DOM.
const ANIMATION_PROPS = new Set([
  "initial", "animate", "exit", "whileInView", "whileHover", "whileTap",
  "whileFocus", "whileDrag", "transition", "variants", "viewport", "custom",
  "layout", "layoutId", "layoutDependency", "drag", "dragConstraints",
  "onAnimationStart", "onAnimationComplete", "transformTemplate",
]);

// SVG children can't take transform utilities without distorting the drawing,
// so these render as-is rather than being revealed.
const NEVER_ANIMATE = new Set(["path", "svg", "circle", "rect", "g", "line", "polyline"]);

function splitProps(props) {
  const dom = {};
  const anim = {};
  for (const key in props) {
    if (ANIMATION_PROPS.has(key)) anim[key] = props[key];
    else dom[key] = props[key];
  }
  return [dom, anim];
}

/**
 * Reveal an element once, the first time it enters the viewport.
 * Returns [ref, revealed]. Falls back to revealed=true when IntersectionObserver
 * is unavailable, so content is never hidden.
 */
export function useReveal({ enabled = true, amount = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) io.disconnect();
          return;
        }
        // Already scrolled past before this element mounted (lazy chunk landing
        // late, restored scroll position, deep link to an anchor). It would
        // otherwise sit at opacity 0 until the visitor scrolled back up, so
        // show it straight away rather than hiding content.
        if (entry.boundingClientRect.bottom < 0) {
          setRevealed(true);
          io.disconnect();
          return;
        }
        if (!once) setRevealed(false);
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, amount, once]);

  return [ref, revealed];
}

/** framer-motion's useInView(ref, { once, amount }) → boolean. */
export function useInView(ref, { once = false, amount = 0.15 } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: typeof amount === "number" ? amount : 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, amount]);

  return inView;
}

function createMotionComponent(tag) {
  const Motion = forwardRef(function Motion(props, forwardedRef) {
    const [domProps, anim] = splitProps(props);
    // Only elements that declared an entrance animation get revealed.
    const wantsReveal =
      !NEVER_ANIMATE.has(tag) &&
      (anim.whileInView != null || anim.initial != null || anim.animate != null);

    const [ref, revealed] = useReveal({
      enabled: wantsReveal,
      amount: anim.viewport?.amount ?? 0.15,
      once: anim.viewport?.once ?? true,
    });

    if (!wantsReveal) {
      return createElement(tag, { ...domProps, ref: forwardedRef });
    }

    const delay = anim.transition?.delay ?? 0;
    const duration = anim.transition?.duration ?? 0.5;

    return createElement(tag, {
      ...domProps,
      ref: (node) => {
        ref.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      className: [
        domProps.className,
        "transition-[opacity,transform] ease-out will-change-[opacity,transform]",
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ]
        .filter(Boolean)
        .join(" "),
      style: {
        ...domProps.style,
        transitionDuration: `${duration * 1000}ms`,
        transitionDelay: revealed ? `${delay * 1000}ms` : "0ms",
      },
    });
  });
  Motion.displayName = `motion.${tag}`;
  return Motion;
}

const TAGS = [
  "div", "span", "p", "a", "ul", "li", "ol", "section", "article", "aside",
  "header", "footer", "nav", "main", "img", "button", "form", "label",
  "blockquote", "figure", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6",
  "svg", "path", "circle", "rect", "g", "line", "polyline", "tr", "td",
];

// Lazily built + memoised so `motion.div` is a stable component identity
// across renders (a fresh component each render would remount the subtree).
const cache = new Map();
export const motion = new Proxy(
  {},
  {
    get(_target, tag) {
      if (typeof tag !== "string") return undefined;
      if (!cache.has(tag)) cache.set(tag, createMotionComponent(tag));
      return cache.get(tag);
    },
  },
);

for (const tag of TAGS) cache.set(tag, createMotionComponent(tag));

/**
 * AnimatePresence: we have no exit animations without framer-motion, so this is
 * a passthrough. Children mount/unmount instantly, which is visually fine for
 * the mobile drawer and testimonial carousel that use it.
 */
export function AnimatePresence({ children }) {
  return <>{children}</>;
}

export default motion;
