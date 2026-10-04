/**
 * Flexible-amount fee allocation — shared by Quick Collect and the Quick
 * Collect modal on Student Fee Payment so both split money identically.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Jun-2025" → sortable integer; null/one-time rows sort last within their group.
export const monthIndex = (m) => {
  if (!m) return Number.POSITIVE_INFINITY;
  const [name, year] = String(m).split("-");
  const mi = MONTHS.indexOf(name);
  if (mi < 0 || !year) return Number.POSITIVE_INFINITY;
  return Number(year) * 12 + mi;
};

/**
 * Greedily spread `amount` over the due rows. Order:
 *  - "category": clear each fee head in ledger order, oldest month first within it
 *  - "month":    clear the oldest month first across every fee head
 * Returns the collect `lines` plus any un-allocatable leftover (overpayment).
 */
export function allocate(rows, amount, order, catOrder) {
  let remaining = Math.max(0, Number(amount) || 0);
  const due = rows.filter((r) => r.due > 0);
  due.sort((a, b) =>
    order === "month"
      ? monthIndex(a.month) - monthIndex(b.month) || (catOrder[a.feeTypeId] ?? 0) - (catOrder[b.feeTypeId] ?? 0)
      : (catOrder[a.feeTypeId] ?? 0) - (catOrder[b.feeTypeId] ?? 0) || monthIndex(a.month) - monthIndex(b.month)
  );
  const lines = [];
  for (const r of due) {
    if (remaining <= 0) break;
    const alloc = Math.min(remaining, r.due);
    if (alloc > 0) {
      lines.push({ feeTypeId: r.feeTypeId, name: r.name, month: r.month, monthLabel: r.monthLabel, amount: alloc });
      remaining -= alloc;
    }
  }
  return { lines, leftover: remaining };
}
