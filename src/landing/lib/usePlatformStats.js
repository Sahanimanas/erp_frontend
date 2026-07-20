/**
 * usePlatformStats — live aggregate platform counts for the marketing site.
 *
 * Backed by /public/stats (unauthenticated, aggregate-only):
 *   { schools, students, employees, parents }
 *
 * Every headline figure on the site reads from here, so the numbers update
 * themselves as schools and students are added — nothing is hardcoded. Values
 * are `null` until loaded (and stay null if the request fails) so callers can
 * render a dash or hide the line instead of showing a made-up figure.
 *
 * The response is cached module-wide: several components on one page want these
 * counts, and they should share a single request and show identical numbers.
 */
import { useEffect, useState } from "react";
import apiClient from "../../services/axios";

const EMPTY = { schools: null, students: null, employees: null, parents: null };

let cache = null;      // resolved stats object
let inflight = null;   // shared promise while the first request is in the air

function fetchStats() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = apiClient
    .get("/public/stats")
    .then((res) => {
      cache = res.data?.success && res.data.data ? res.data.data : EMPTY;
      return cache;
    })
    .catch(() => EMPTY) // leave uncached so a later mount can retry
    .finally(() => { inflight = null; });

  return inflight;
}

export function usePlatformStats() {
  const [stats, setStats] = useState(cache ?? EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetchStats().then((s) => { if (!cancelled) setStats(s); });
    return () => { cancelled = true; };
  }, []);

  return stats;
}

/** 1247 → "1,247". Returns null for missing values so callers can branch. */
export function formatCount(n) {
  return typeof n === "number" ? n.toLocaleString("en-IN") : null;
}

export default usePlatformStats;
