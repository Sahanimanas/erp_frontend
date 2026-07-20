/**
 * enquiry.js — submission path for the Contact and Request-a-Demo forms.
 *
 * The source site POSTed these to `/api/contact-messages` and
 * `/api/demo-requests`. Neither endpoint exists in this backend (see
 * backend/src/modules/public/routes.ts — it only serves /public/school and
 * /public/stats), so rather than fire a request that always 404s we compose the
 * enquiry into a mailto: draft addressed to the sales inbox.
 *
 * TODO: when the backend grows real enquiry endpoints, swap `openEnquiryMail`
 * for an apiClient.post and delete this module.
 */
import { BRAND } from "../utils/data";

/** Turn { school_name: "X" } into "School name: X" lines, skipping blanks. */
function formatBody(fields) {
  return Object.entries(fields)
    .filter(([, value]) => value != null && String(value).trim() !== "")
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
      return `${label}: ${value}`;
    })
    .join("\n");
}

/**
 * Opens the visitor's mail client with the enquiry pre-filled.
 * Returns true if the draft was handed off, false if the browser blocked it.
 */
export function openEnquiryMail({ subject, fields }) {
  const href =
    `mailto:${BRAND.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(formatBody(fields))}`;

  try {
    window.location.href = href;
    return true;
  } catch {
    return false;
  }
}

export default openEnquiryMail;
