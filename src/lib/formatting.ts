export const NA = "Not available";

export function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Indian currency, compact: ₹8.42 Cr / ₹82.4 L / ₹67.5K / ₹987 */
export function inr(value: number | null | undefined, opts?: { compact?: boolean }): string {
  if (!isNum(value)) return NA;
  const compact = opts?.compact ?? true;
  const sign = value < 0 ? "-" : "";
  const v = Math.abs(value);
  if (!compact) return `${sign}₹${Math.round(v).toLocaleString("en-IN")}`;
  if (v >= 1e7) return `${sign}₹${trim(v / 1e7)} Cr`;
  if (v >= 1e5) return `${sign}₹${trim(v / 1e5)} L`;
  if (v >= 1e3) return `${sign}₹${trim(v / 1e3)}K`;
  return `${sign}₹${Math.round(v)}`;
}

function trim(n: number): string {
  const d = n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return n.toFixed(d).replace(/\.0+$/, "");
}

export function num(value: number | null | undefined, decimals = 0): string {
  if (!isNum(value)) return NA;
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function compactNum(value: number | null | undefined): string {
  if (!isNum(value)) return NA;
  const v = Math.abs(value);
  if (v >= 1e7) return `${trim(value / 1e7)} Cr`;
  if (v >= 1e5) return `${trim(value / 1e5)} L`;
  if (v >= 1e4) return `${trim(value / 1e3)}K`;
  return num(value);
}

export function pct(value: number | null | undefined, decimals = 1): string {
  if (!isNum(value)) return NA;
  return `${value.toFixed(decimals)}%`;
}

export function signedPct(value: number | null | undefined, decimals = 1): string {
  if (!isNum(value)) return NA;
  const s = value > 0 ? "↑" : value < 0 ? "↓" : "→";
  return `${s} ${Math.abs(value).toFixed(decimals)}%`;
}

export type Direction = "up" | "down" | "flat";

export function direction(value: number | null | undefined, tolerance = 0.5): Direction {
  if (!isNum(value)) return "flat";
  if (value > tolerance) return "up";
  if (value < -tolerance) return "down";
  return "flat";
}

export function formatDate(ts: number | null | undefined): string {
  if (!isNum(ts)) return NA;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CAMP_TYPE_LABELS: Record<string, string> = {
  COR: "Corporate",
  PHA: "Pharma",
  RET: "Retail",
  WEL: "Wellness",
  PAR: "Partner",
  GOV: "Government",
  CSR: "CSR",
};

export function campTypeLabel(code: string): string {
  return CAMP_TYPE_LABELS[code?.toUpperCase()] ?? code ?? "Unknown";
}
