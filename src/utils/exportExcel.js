/**
 * exportExcel.js — shared client-side export helper.
 *
 * Produces a CSV with a UTF-8 BOM so Excel opens it cleanly (and respects the
 * .xls/.csv extension). One row per record; columns are described declaratively
 * so every screen can export "per student / per fee" field-by-field.
 *
 *   exportRows("students.csv", rows, [
 *     { label: "Roll No", get: r => r.rollNumber },
 *     { label: "Name",    get: r => r.name },
 *   ])
 */
function cell(value) {
  if (value === null || value === undefined) return "";
  const s = typeof value === "bigint" ? Number(value).toString() : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportRows(filename, rows, columns) {
  if (!rows || rows.length === 0) return false;
  const header = columns.map((c) => cell(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => cell(c.get ? c.get(r) : r[c.key])).join(","))
    .join("\n");
  const csv = `﻿${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Filter rows to those whose date field falls within [from, to] (inclusive).
 * `getDate` returns a date-ish value for a row. Empty from/to are open-ended.
 */
export function filterByDateRange(rows, getDate, from, to) {
  if (!from && !to) return rows;
  const fromT = from ? new Date(from).setHours(0, 0, 0, 0) : -Infinity;
  const toT = to ? new Date(to).setHours(23, 59, 59, 999) : Infinity;
  return rows.filter((r) => {
    const v = getDate(r);
    if (!v) return false;
    const t = new Date(v).getTime();
    return !Number.isNaN(t) && t >= fromT && t <= toT;
  });
}

/**
 * Build columns automatically from the union of keys across rows (used when a
 * dataset has dynamic fee-type columns). Skips object/array values.
 */
export function autoColumns(rows) {
  const keys = new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => {
    const v = r[k];
    if (v === null || typeof v !== "object") keys.add(k);
  }));
  return [...keys].map((k) => ({ label: k, get: (r) => r[k] }));
}
