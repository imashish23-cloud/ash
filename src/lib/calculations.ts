import type { CampRow } from "./dataProcessor";

export type Granularity = "daily" | "weekly" | "monthly";

export type DatePresetId =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "prevMonth"
  | "ytd"
  | "all"
  | "custom";

export interface Filters {
  preset: DatePresetId;
  customFrom: number | null;
  customTo: number | null;
  partners: string[];
  campTypes: string[];
  sourceTypes: string[];
}

export const defaultFilters: Filters = {
  preset: "all",
  customFrom: null,
  customTo: null,
  partners: [],
  campTypes: [],
  sourceTypes: [],
};

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last30", label: "Last 30 Days" },
  { id: "thisMonth", label: "Current Month" },
  { id: "prevMonth", label: "Previous Month" },
  { id: "ytd", label: "YTD" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" },
];

export interface Range {
  from: number;
  to: number;
}

const DAY = 86_400_000;
const startOfDay = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Anchor = latest date in dataset (data is historical/periodic, not live). */
export function resolveRange(filters: Filters, minTs: number, maxTs: number): Range {
  const anchor = startOfDay(maxTs);
  const a = new Date(anchor);
  switch (filters.preset) {
    case "today":
      return { from: anchor, to: anchor };
    case "last7":
      return { from: anchor - 6 * DAY, to: anchor };
    case "last30":
      return { from: anchor - 29 * DAY, to: anchor };
    case "thisMonth":
      return { from: new Date(a.getFullYear(), a.getMonth(), 1).getTime(), to: anchor };
    case "prevMonth":
      return {
        from: new Date(a.getFullYear(), a.getMonth() - 1, 1).getTime(),
        to: new Date(a.getFullYear(), a.getMonth(), 0).getTime(),
      };
    case "ytd":
      return { from: new Date(a.getFullYear(), 0, 1).getTime(), to: anchor };
    case "custom":
      return {
        from: filters.customFrom ?? startOfDay(minTs),
        to: filters.customTo ?? anchor,
      };
    default:
      return { from: startOfDay(minTs), to: anchor };
  }
}

export function previousRange(range: Range): Range {
  const span = range.to - range.from + DAY;
  return { from: range.from - span, to: range.from - DAY };
}

export function applyFilters(rows: CampRow[], filters: Filters, range: Range): CampRow[] {
  const partners = new Set(filters.partners);
  const campTypes = new Set(filters.campTypes);
  const sourceTypes = new Set(filters.sourceTypes);
  return rows.filter(
    (r) =>
      r.ts >= range.from &&
      r.ts <= range.to &&
      (partners.size === 0 || partners.has(r.centerName)) &&
      (campTypes.size === 0 || campTypes.has(r.campType)) &&
      (sourceTypes.size === 0 || sourceTypes.has(r.sourceType)),
  );
}

export interface Metrics {
  camps: number;
  patients: number;
  revenue: number | null;
  grossMargin: number | null;
  gmPct: number | null;
  gmPerPatient: number | null;
  aspPerPatient: number | null;
  patientsPerCamp: number | null;
  revenuePerCamp: number | null;
  gmPerCamp: number | null;
  rows: number;
}

const div = (a: number | null, b: number | null): number | null =>
  a == null || b == null || b === 0 ? null : a / b;

export function computeMetrics(rows: CampRow[]): Metrics {
  const camps = new Set<string>();
  let patients = 0;
  let revenue = 0;
  let revenueRows = 0;
  let margin = 0;
  let marginRows = 0;

  for (const r of rows) {
    camps.add(r.campCode);
    patients += r.patients;
    if (r.revenue != null) {
      revenue += r.revenue;
      revenueRows++;
    }
    if (r.grossMargin != null) {
      margin += r.grossMargin;
      marginRows++;
    }
  }

  const rev = revenueRows ? revenue : null;
  const gm = marginRows ? margin : null;
  const campCount = camps.size;

  return {
    camps: campCount,
    patients,
    revenue: rev,
    grossMargin: gm,
    gmPct: rev ? div(gm, rev)! * 100 : null,
    gmPerPatient: div(gm, patients || null),
    aspPerPatient: div(rev, patients || null),
    patientsPerCamp: campCount ? patients / campCount : null,
    revenuePerCamp: div(rev, campCount || null),
    gmPerCamp: div(gm, campCount || null),
    rows: rows.length,
  };
}

export function growth(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export interface Comparison {
  current: Metrics;
  previous: Metrics;
  delta: Record<keyof Metrics, number | null>;
  hasPrevious: boolean;
}

export function compare(current: Metrics, previous: Metrics, hasPrevious: boolean): Comparison {
  const keys = Object.keys(current) as (keyof Metrics)[];
  const delta = {} as Record<keyof Metrics, number | null>;
  for (const k of keys) {
    delta[k] = hasPrevious ? growth(current[k] as number | null, previous[k] as number | null) : null;
  }
  return { current, previous, delta, hasPrevious };
}

/* ---------------- time series ---------------- */

export function bucketStart(ts: number, g: Granularity): number {
  const d = new Date(ts);
  if (g === "daily") return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (g === "monthly") return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
}

export interface SeriesPoint extends Metrics {
  ts: number;
  label: string;
}

export function bucketLabel(ts: number, g: Granularity): string {
  const d = new Date(ts);
  if (g === "monthly") return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  if (g === "weekly") return `W/c ${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function buildSeries(rows: CampRow[], g: Granularity): SeriesPoint[] {
  const buckets = new Map<number, CampRow[]>();
  for (const r of rows) {
    const key = bucketStart(r.ts, g);
    const list = buckets.get(key);
    if (list) list.push(r);
    else buckets.set(key, [r]);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ts, list]) => ({ ts, label: bucketLabel(ts, g), ...computeMetrics(list) }));
}

export function suggestGranularity(range: Range): Granularity {
  const days = (range.to - range.from) / DAY + 1;
  if (days <= 31) return "daily";
  if (days <= 120) return "weekly";
  return "monthly";
}

/* ---------------- dimension breakdowns ---------------- */

export interface GroupMetrics extends Metrics {
  key: string;
}

function groupBy(rows: CampRow[], pick: (r: CampRow) => string): GroupMetrics[] {
  const buckets = new Map<string, CampRow[]>();
  for (const r of rows) {
    const key = pick(r) || "Unknown";
    const list = buckets.get(key);
    if (list) list.push(r);
    else buckets.set(key, [r]);
  }
  return [...buckets.entries()].map(([key, list]) => ({ key, ...computeMetrics(list) }));
}

export const byCampType = (rows: CampRow[]) => groupBy(rows, (r) => r.campType);
export const byPartner = (rows: CampRow[]) => groupBy(rows, (r) => r.centerName);

export interface Concentration {
  top5Pct: number | null;
  top10Pct: number | null;
  othersPct: number | null;
  totalPartners: number;
  top5Revenue: number;
  top10Revenue: number;
  totalRevenue: number;
}

export function concentration(partners: GroupMetrics[]): Concentration {
  const sorted = [...partners].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
  const total = sorted.reduce((s, p) => s + (p.revenue ?? 0), 0);
  const sum = (n: number) => sorted.slice(0, n).reduce((s, p) => s + (p.revenue ?? 0), 0);
  const t5 = sum(5);
  const t10 = sum(10);
  if (!total) {
    return { top5Pct: null, top10Pct: null, othersPct: null, totalPartners: sorted.length, top5Revenue: 0, top10Revenue: 0, totalRevenue: 0 };
  }
  return {
    top5Pct: (t5 / total) * 100,
    top10Pct: (t10 / total) * 100,
    othersPct: ((total - t10) / total) * 100,
    totalPartners: sorted.length,
    top5Revenue: t5,
    top10Revenue: t10,
    totalRevenue: total,
  };
}

/* ---------------- business health ---------------- */

export type HealthState = "STRONG" | "MIXED" | "AT RISK" | "UNKNOWN";

export interface Health {
  state: HealthState;
  score: number;
  max: number;
  statement: string;
  signals: { label: string; value: number | null }[];
}

export function businessHealth(c: Comparison): Health {
  const signals = [
    { label: "Revenue", value: c.delta.revenue },
    { label: "Patients", value: c.delta.patients },
    { label: "Gross Margin", value: c.delta.grossMargin },
    { label: "GM / Patient", value: c.delta.gmPerPatient },
    { label: "ASP / Patient", value: c.delta.aspPerPatient },
  ];

  if (!c.hasPrevious || signals.every((s) => s.value == null)) {
    return {
      state: "UNKNOWN",
      score: 0,
      max: 5,
      statement: "No comparable previous period in the selected range, so growth signals are not available.",
      signals,
    };
  }

  const score = signals.filter((s) => (s.value ?? 0) > 0).length;
  const state: HealthState = score >= 4 ? "STRONG" : score >= 2 ? "MIXED" : "AT RISK";

  const revUp = (c.delta.revenue ?? 0) > 0;
  const patUp = (c.delta.patients ?? 0) > 0;
  const gmpUp = (c.delta.gmPerPatient ?? 0) > 0;

  let statement: string;
  if (state === "STRONG") {
    statement = "Growth and unit economics are moving together — revenue, volume and margin per patient are all improving.";
  } else if (state === "AT RISK") {
    statement = revUp
      ? "Revenue is holding up, but margin and volume signals are deteriorating across the portfolio."
      : "Revenue, margin and unit economics are all declining versus the previous period.";
  } else if (revUp && patUp && !gmpUp) {
    statement = "Revenue is growing, but unit economics are under pressure.";
  } else if (!patUp && gmpUp) {
    statement = "Volume is softening, while profitability per patient is improving.";
  } else {
    statement = "Performance is uneven — some growth signals are positive while others are declining.";
  }

  return { state, score, max: 5, statement, signals };
}
