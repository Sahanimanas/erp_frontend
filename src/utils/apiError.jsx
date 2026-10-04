/**
 * utils/apiError.js — one place to turn an axios failure into something a user
 * can read.
 *
 * Previously pages rendered `err.response.data.error` verbatim, so a backend
 * stack/Prisma dump landed in the page as a wall of red text. The backend now
 * sends a one-line message plus a short `code`; this keeps the UI honest even
 * for an older/unsanitised response by clipping anything oversized.
 */
import toast from "react-hot-toast";

const MAX_LEN = 140;

/** Server dumps we never want to render, whatever the endpoint. */
const NOISE = /invalid `prisma\.|prismaclient|invocation:|available options are|\bat [\w.]+ \(/i;

/**
 * @returns {{ message: string, code: string }}
 */
export function getApiError(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  const status = err?.response?.status;

  let message = data?.error || data?.message || err?.message || fallback;
  if (typeof message !== "string") message = fallback;
  message = message.trim();

  if (!message || NOISE.test(message)) message = fallback;
  // Keep only the first line, then clip — never let a stack widen the toast.
  message = message.split("\n")[0];
  if (message.length > MAX_LEN) message = `${message.slice(0, MAX_LEN - 1).trimEnd()}…`;

  const code =
    data?.code ||
    (err?.code === "ECONNABORTED" ? "TIMEOUT" : "") ||
    (status ? `HTTP ${status}` : "") ||
    (err?.request ? "NETWORK" : "") ||
    "ERROR";

  return { message, code };
}

/** Show the compact error toast: one line of text, the code in small print. */
export function toastApiError(err, fallback = "Something went wrong") {
  const { message, code } = getApiError(err, fallback);
  toast.error(
    <span className="block max-w-xs">
      <span className="block leading-snug">{message}</span>
      <span className="block mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{code}</span>
    </span>
  );
  return { message, code };
}
