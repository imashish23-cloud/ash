import Papa from "papaparse";

export interface CampRow {
  ts: number; // collection date (ms, local midnight)
  sourceType: string;
  centerName: string;
  centerCode: string;
  packageCode: string;
  packageName: string;
  campType: string;
  campCode: string;
  patients: number;
  revenue: number | null;
  grossMargin: number | null;
  cpt: number | null;
}

export interface DatasetSummary {
  rows: number;
  minTs: number | null;
  maxTs: number | null;
  distinctCamps: number;
  partners: number;
  campTypes: number;
  missingRevenuePct: number;
  missingMarginPct: number;
}

export interface Dataset {
  rows: CampRow[];
  summary: DatasetSummary;
  sourceLabel: string;
  loadedAt: number;
}

export class DataError extends Error {}

const FIELD_ALIASES: Record<keyof AliasTargets, string[]> = {
  collection_date: ["collection_date", "collectiondate", "date", "camp_date", "collected_on"],
  sourcetype: ["sourcetype", "source_type", "source"],
  center_name: ["center_name", "centre_name", "centername", "partner", "partner_name", "client_name"],
  center_code: ["center_code", "centre_code", "centercode", "partner_code"],
  package_code: ["package_code", "packagecode"],
  package_name: ["package_name", "packagename", "package"],
  camp_type: ["camp_type", "camptype", "type"],
  camp_code: ["camp_code", "campcode", "camp_id"],
  booking_count: ["booking_count", "bookingcount", "patient_count", "patients", "bookings", "patient count"],
  revenue: ["revenue", "total_revenue", "net_revenue", "sales"],
  new_cpt: ["new_cpt", "cpt", "cost_per_test", "cost"],
  gross_margin: ["gross_margin", "grossmargin", "gross margin", "gm"],
  gross_margin_per_patient: [
    "gross_margin_per_patient",
    "grossmarginperpatient",
    "gm_per_patient",
    "gross margin per patient",
  ],
};

type AliasTargets = {
  collection_date: string;
  sourcetype: string;
  center_name: string;
  center_code: string;
  package_code: string;
  package_name: string;
  camp_type: string;
  camp_code: string;
  booking_count: string;
  revenue: string;
  new_cpt: string;
  gross_margin: string;
  gross_margin_per_patient: string;
};

const REQUIRED: (keyof AliasTargets)[] = [
  "collection_date",
  "camp_code",
  "center_name",
  "booking_count",
  "revenue",
  "gross_margin",
];

const normKey = (k: string) => k.trim().toLowerCase().replace(/[\s.-]+/g, "_");

function buildHeaderMap(headers: string[]): Partial<Record<keyof AliasTargets, string>> {
  const map: Partial<Record<keyof AliasTargets, string>> = {};
  const normalized = headers.map((h) => ({ raw: h, norm: normKey(h) }));
  (Object.keys(FIELD_ALIASES) as (keyof AliasTargets)[]).forEach((target) => {
    const aliases = FIELD_ALIASES[target].map(normKey);
    const hit = normalized.find((h) => aliases.includes(h.norm));
    if (hit) map[target] = hit.raw;
  });
  return map;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseDate(input: unknown): number | null {
  if (input == null) return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
  }
  const raw = String(input).trim();
  if (!raw) return null;

  // "January 1, 2026" / "1 Jan 2026"
  const words = raw.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (words) {
    const m = MONTHS[words[1]!.slice(0, 3).toLowerCase()];
    if (m !== undefined) return new Date(+words[3]!, m, +words[2]!).getTime();
  }
  const words2 = raw.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
  if (words2) {
    const m = MONTHS[words2[2]!.slice(0, 3).toLowerCase()];
    if (m !== undefined) return new Date(+words2[3]!, m, +words2[1]!).getTime();
  }
  // ISO yyyy-mm-dd
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1]!, +iso[2]! - 1, +iso[3]!).getTime();
  // dd/mm/yyyy or dd-mm-yyyy
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return new Date(+dmy[3]!, +dmy[2]! - 1, +dmy[1]!).getTime();

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()).getTime();
  }
  return null;
}

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[₹,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  if (!cleaned || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function buildDataset(records: Record<string, unknown>[], sourceLabel: string): Dataset {
  if (!records.length) throw new DataError("The file contains no data rows.");
  const headers = Object.keys(records[0]!);
  const map = buildHeaderMap(headers);

  const missing = REQUIRED.filter((r) => !map[r]);
  if (missing.length) {
    throw new DataError(
      `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Found: ${headers.join(", ")}`,
    );
  }

  const get = (rec: Record<string, unknown>, key: keyof AliasTargets) =>
    map[key] ? rec[map[key] as string] : undefined;

  const rows: CampRow[] = [];
  let missingRevenue = 0;
  let missingMargin = 0;

  for (const rec of records) {
    const ts = parseDate(get(rec, "collection_date"));
    const campCode = String(get(rec, "camp_code") ?? "").trim();
    if (ts == null || !campCode) continue;
    const revenue = toNumber(get(rec, "revenue"));
    const grossMargin = toNumber(get(rec, "gross_margin"));
    if (revenue == null) missingRevenue++;
    if (grossMargin == null) missingMargin++;
    rows.push({
      ts,
      sourceType: String(get(rec, "sourcetype") ?? "Unknown").trim() || "Unknown",
      centerName: String(get(rec, "center_name") ?? "Unknown").trim() || "Unknown",
      centerCode: String(get(rec, "center_code") ?? "").trim(),
      packageCode: String(get(rec, "package_code") ?? "").trim(),
      packageName: String(get(rec, "package_name") ?? "").trim(),
      campType: String(get(rec, "camp_type") ?? "Unknown").trim() || "Unknown",
      campCode,
      patients: toNumber(get(rec, "booking_count")) ?? 0,
      revenue,
      grossMargin,
      cpt: toNumber(get(rec, "new_cpt")),
    });
  }

  if (!rows.length) throw new DataError("No valid rows found (dates or camp codes could not be read).");

  rows.sort((a, b) => a.ts - b.ts);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;

  const summary: DatasetSummary = {
    rows: rows.length,
    minTs: first.ts,
    maxTs: last.ts,
    distinctCamps: new Set(rows.map((r) => r.campCode)).size,
    partners: new Set(rows.map((r) => r.centerName)).size,
    campTypes: new Set(rows.map((r) => r.campType)).size,
    missingRevenuePct: (missingRevenue / rows.length) * 100,
    missingMarginPct: (missingMargin / rows.length) * 100,
  };

  return { rows, summary, sourceLabel, loadedAt: Date.now() };
}

export function parseCsvText(text: string, sourceLabel: string): Dataset {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });
  return buildDataset(parsed.data as Record<string, unknown>[], sourceLabel);
}

export async function loadDatasetFromFile(file: File): Promise<Dataset> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    return parseCsvText(await file.text(), file.name);
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]!]!;
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    return buildDataset(json, file.name);
  }
  throw new DataError("Unsupported file type. Upload a CSV, XLSX or XLS file.");
}

export async function loadDatasetFromUrl(url: string): Promise<Dataset> {
  let target = url.trim();
  if (!target) throw new DataError("Enter a published Google Sheet or CSV URL.");
  const gs = target.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (gs && !/output=csv|\/pub\?/.test(target)) {
    const gid = target.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
    target = `https://docs.google.com/spreadsheets/d/${gs[1]!}/export?format=csv&gid=${gid}`;
  }
  const res = await fetch(target);
  if (!res.ok) throw new DataError(`Could not fetch the sheet (HTTP ${res.status}). Make sure it is published to the web.`);
  const text = await res.text();
  if (/^\s*</.test(text)) {
    throw new DataError("That URL returned a web page, not CSV. Use File → Share → Publish to web → CSV.");
  }
  return parseCsvText(text, "Google Sheet");
}
