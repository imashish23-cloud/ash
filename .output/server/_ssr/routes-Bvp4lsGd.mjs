import { a as __toESM, r as __exportAll } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as CalendarRange, S as Check, _ as Download, a as TrendingDown, b as CircleAlert, c as ShieldAlert, d as Moon, f as Loader, g as FileSpreadsheet, h as Layers, i as TrendingUp, l as Search, m as Lightbulb, n as Upload, o as Sun, p as Link2, r as TriangleAlert, s as SlidersHorizontal, t as X, u as RefreshCw, v as CloudUpload, w as CalendarDays, x as ChevronDown, y as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as require_papaparse } from "../_libs/papaparse.mjs";
import { a as DialogOverlay$1, c as DialogTrigger, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1, x as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { t as _e } from "../_libs/cmdk.mjs";
import { a as XAxis, c as Line, d as Tooltip, f as Legend, i as YAxis, l as CartesianGrid, n as BarChart, o as Bar, p as ResponsiveContainer, r as LineChart, s as Area, t as AreaChart, u as ReferenceLine } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bvp4lsGd.js
var routes_Bvp4lsGd_exports = /* @__PURE__ */ __exportAll({ component: () => Index });
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_papaparse = /* @__PURE__ */ __toESM(require_papaparse());
var defaultFilters = {
	preset: "all",
	customFrom: null,
	customTo: null,
	partners: [],
	campTypes: [],
	sourceTypes: []
};
var DATE_PRESETS = [
	{
		id: "today",
		label: "Today"
	},
	{
		id: "last7",
		label: "Last 7 Days"
	},
	{
		id: "last30",
		label: "Last 30 Days"
	},
	{
		id: "thisMonth",
		label: "Current Month"
	},
	{
		id: "prevMonth",
		label: "Previous Month"
	},
	{
		id: "ytd",
		label: "YTD"
	},
	{
		id: "all",
		label: "All Time"
	},
	{
		id: "custom",
		label: "Custom Range"
	}
];
var DAY = 864e5;
var startOfDay = (ts) => {
	const d = new Date(ts);
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
/** Anchor = latest date in dataset (data is historical/periodic, not live). */
function resolveRange(filters, minTs, maxTs) {
	const anchor = startOfDay(maxTs);
	const a = new Date(anchor);
	switch (filters.preset) {
		case "today": return {
			from: anchor,
			to: anchor
		};
		case "last7": return {
			from: anchor - 6 * DAY,
			to: anchor
		};
		case "last30": return {
			from: anchor - 29 * DAY,
			to: anchor
		};
		case "thisMonth": return {
			from: new Date(a.getFullYear(), a.getMonth(), 1).getTime(),
			to: anchor
		};
		case "prevMonth": return {
			from: new Date(a.getFullYear(), a.getMonth() - 1, 1).getTime(),
			to: new Date(a.getFullYear(), a.getMonth(), 0).getTime()
		};
		case "ytd": return {
			from: new Date(a.getFullYear(), 0, 1).getTime(),
			to: anchor
		};
		case "custom": return {
			from: filters.customFrom ?? startOfDay(minTs),
			to: filters.customTo ?? anchor
		};
		default: return {
			from: startOfDay(minTs),
			to: anchor
		};
	}
}
function applyFilters(rows, filters, range) {
	const partners = new Set(filters.partners);
	const campTypes = new Set(filters.campTypes);
	const sourceTypes = new Set(filters.sourceTypes);
	return rows.filter((r) => r.ts >= range.from && r.ts <= range.to && (partners.size === 0 || partners.has(r.centerName)) && (campTypes.size === 0 || campTypes.has(r.campType)) && (sourceTypes.size === 0 || sourceTypes.has(r.sourceType)));
}
var div = (a, b) => a == null || b == null || b === 0 ? null : a / b;
function computeMetrics(rows) {
	const camps = /* @__PURE__ */ new Set();
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
		gmPct: rev ? div(gm, rev) * 100 : null,
		gmPerPatient: div(gm, patients || null),
		aspPerPatient: div(rev, patients || null),
		patientsPerCamp: campCount ? patients / campCount : null,
		revenuePerCamp: div(rev, campCount || null),
		gmPerCamp: div(gm, campCount || null),
		rows: rows.length
	};
}
function growth(current, previous) {
	if (current == null || previous == null || previous === 0) return null;
	return (current - previous) / Math.abs(previous) * 100;
}
function compare(current, previous, hasPrevious) {
	const keys = Object.keys(current);
	const delta = {};
	for (const k of keys) delta[k] = hasPrevious ? growth(current[k], previous[k]) : null;
	return {
		current,
		previous,
		delta,
		hasPrevious
	};
}
function bucketStart(ts, g) {
	const d = new Date(ts);
	if (g === "daily") return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	if (g === "monthly") return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
	const day = (d.getDay() + 6) % 7;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
}
function bucketLabel(ts, g) {
	const d = new Date(ts);
	if (g === "monthly") return d.toLocaleDateString("en-GB", {
		month: "short",
		year: "2-digit"
	});
	if (g === "weekly") return `W/c ${d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short"
	})}`;
	return d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short"
	});
}
function buildSeries(rows, g) {
	const buckets = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const key = bucketStart(r.ts, g);
		const list = buckets.get(key);
		if (list) list.push(r);
		else buckets.set(key, [r]);
	}
	return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([ts, list]) => ({
		ts,
		label: bucketLabel(ts, g),
		...computeMetrics(list)
	}));
}
function suggestGranularity(range) {
	const days = (range.to - range.from) / DAY + 1;
	if (days <= 31) return "daily";
	if (days <= 120) return "weekly";
	return "monthly";
}
function groupBy(rows, pick) {
	const buckets = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const key = pick(r) || "Unknown";
		const list = buckets.get(key);
		if (list) list.push(r);
		else buckets.set(key, [r]);
	}
	return [...buckets.entries()].map(([key, list]) => ({
		key,
		...computeMetrics(list)
	}));
}
var byCampType = (rows) => groupBy(rows, (r) => r.campType);
var byPartner = (rows) => groupBy(rows, (r) => r.centerName);
function concentration(partners) {
	const sorted = [...partners].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
	const total = sorted.reduce((s, p) => s + (p.revenue ?? 0), 0);
	const sum = (n) => sorted.slice(0, n).reduce((s, p) => s + (p.revenue ?? 0), 0);
	const t5 = sum(5);
	const t10 = sum(10);
	if (!total) return {
		top5Pct: null,
		top10Pct: null,
		othersPct: null,
		totalPartners: sorted.length,
		top5Revenue: 0,
		top10Revenue: 0,
		totalRevenue: 0
	};
	return {
		top5Pct: t5 / total * 100,
		top10Pct: t10 / total * 100,
		othersPct: (total - t10) / total * 100,
		totalPartners: sorted.length,
		top5Revenue: t5,
		top10Revenue: t10,
		totalRevenue: total
	};
}
var NA = "Not available";
function isNum(v) {
	return typeof v === "number" && Number.isFinite(v);
}
/** Indian currency, compact: ₹8.42 Cr / ₹82.4 L / ₹67.5K / ₹987 */
function inr(value, opts) {
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
function trim(n) {
	const d = n >= 100 ? 0 : n >= 10 ? 1 : 2;
	return n.toFixed(d).replace(/\.0+$/, "");
}
function num(value, decimals = 0) {
	if (!isNum(value)) return NA;
	return value.toLocaleString("en-IN", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}
function compactNum(value) {
	if (!isNum(value)) return NA;
	const v = Math.abs(value);
	if (v >= 1e7) return `${trim(value / 1e7)} Cr`;
	if (v >= 1e5) return `${trim(value / 1e5)} L`;
	if (v >= 1e4) return `${trim(value / 1e3)}K`;
	return num(value);
}
function pct(value, decimals = 1) {
	if (!isNum(value)) return NA;
	return `${value.toFixed(decimals)}%`;
}
function signedPct(value, decimals = 1) {
	if (!isNum(value)) return NA;
	return `${value > 0 ? "↑" : value < 0 ? "↓" : "→"} ${Math.abs(value).toFixed(decimals)}%`;
}
function formatDate(ts) {
	if (!isNum(ts)) return NA;
	return new Date(ts).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
function formatDateTime(ts) {
	return new Date(ts).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
}
var CAMP_TYPE_LABELS = {
	COR: "Corporate",
	PHA: "Pharma",
	RET: "Retail",
	WEL: "Wellness",
	PAR: "Partner",
	GOV: "Government",
	CSR: "CSR"
};
function campTypeLabel(code) {
	return CAMP_TYPE_LABELS[code?.toUpperCase()] ?? code ?? "Unknown";
}
var abs$1 = (v) => v == null ? null : Math.abs(v);
function buildNarrative(c) {
	if (!c.hasPrevious) {
		const m = c.current;
		return `The selected period covers ${num(m.camps)} camps, ${num(m.patients)} patients and ${inr(m.revenue)} revenue at ${pct(m.gmPct)} gross margin.`;
	}
	const rev = c.delta.revenue;
	const gm = c.delta.grossMargin;
	const gmp = c.delta.gmPerPatient;
	const pat = c.delta.patients;
	if (rev != null && gm != null && gmp != null) {
		if (rev > 0 && gmp > 0) return `Revenue and patient volumes are accelerating (revenue ${signedPct(rev)}, patients ${signedPct(pat)}) while profitability per patient improves ${signedPct(gmp)}.`;
		if (rev > 0 && gm > 0 && gmp <= 0) return `Revenue is growing ${signedPct(rev)} faster than gross margin ${signedPct(gm)}, creating pressure on unit economics — GM / Patient is ${signedPct(gmp)}.`;
		if (rev <= 0 && gmp > 0) return `Volume is declining (patients ${signedPct(pat)}), but GM / Patient is improving ${signedPct(gmp)} — the mix is shifting toward higher-value camps.`;
		return `Revenue ${signedPct(rev)} and gross margin ${signedPct(gm)} are both under pressure, with GM / Patient at ${signedPct(gmp)}.`;
	}
	return `Revenue ${signedPct(rev)} versus the previous period across ${num(c.current.camps)} camps.`;
}
function trendSentence(series, metric) {
	const valid = series.filter((p) => p[metric] != null);
	if (valid.length < 2) return "Not enough history in the selected range to describe a trend.";
	const first = valid[valid.length - 2];
	const last = valid[valid.length - 1];
	const a = first[metric];
	const b = last[metric];
	const change = a === 0 ? null : (b - a) / Math.abs(a) * 100;
	const patDelta = first.patients === 0 ? null : (last.patients - first.patients) / first.patients * 100;
	if (metric === "revenue") return `Revenue moved from ${inr(a)} to ${inr(b)} (${signedPct(change)}) versus ${first.label}.`;
	const dir = (change ?? 0) >= 0 ? "improved" : "declined";
	const volume = patDelta == null ? "" : patDelta > 0 ? ` despite ${pct(abs$1(patDelta))} higher patient volumes` : ` alongside ${pct(abs$1(patDelta))} lower patient volumes`;
	return `GM / Patient ${dir} ${pct(abs$1(change))} in ${last.label} versus ${first.label}${volume}.`;
}
function buildInsights(args) {
	const { comparison: c, campTypes, partners, conc } = args;
	const out = [];
	const m = c.current;
	if (c.delta.revenue != null) {
		const up = c.delta.revenue > 0;
		const driver = (c.delta.patients ?? 0) > (c.delta.aspPerPatient ?? 0) ? "patient volume growth" : "higher realisation per patient";
		out.push({
			id: "growth",
			category: "Growth",
			tone: up ? "positive" : "negative",
			headline: `Revenue ${up ? "increased" : "declined"} ${pct(abs$1(c.delta.revenue))} versus the previous period`,
			body: `${inr(m.revenue)} across ${num(m.camps)} camps, primarily driven by ${driver} (patients ${signedPct(c.delta.patients)}, ASP ${signedPct(c.delta.aspPerPatient)}).`
		});
	}
	if (c.delta.gmPerPatient != null) {
		const up = c.delta.gmPerPatient > 0;
		out.push({
			id: "profitability",
			category: "Profitability",
			tone: up ? "positive" : "negative",
			headline: `GM / Patient ${up ? "improved" : "declined"} ${pct(abs$1(c.delta.gmPerPatient))} to ${inr(m.gmPerPatient, { compact: false })}`,
			body: up ? `Gross margin is now ${pct(m.gmPct)} of revenue, indicating healthier unit economics alongside ${signedPct(c.delta.revenue)} revenue.` : `Gross margin is ${pct(m.gmPct)} of revenue — margin pressure is building despite ${signedPct(c.delta.revenue)} revenue movement.`
		});
	}
	out.push({
		id: "scale",
		category: "Scale",
		tone: "neutral",
		headline: `${num(m.camps)} camps delivered ${inr(m.revenue)} revenue and ${inr(m.grossMargin)} gross margin`,
		body: `Average camp brings ${num(m.patientsPerCamp, 0)} patients, ${inr(m.revenuePerCamp)} revenue and ${inr(m.gmPerCamp)} gross margin at ${pct(m.gmPct)} margin.`
	});
	if (m.gmPerPatient != null) out.push({
		id: "unit-economics",
		category: "Unit Economics",
		tone: "positive",
		headline: `Portfolio earns ${inr(m.gmPerPatient, { compact: false })} gross margin per patient`,
		body: `Every patient converts into ${pct(m.gmPct)} gross margin, with ${inr(m.gmPerCamp)} margin per camp.`
	});
	const benchmark = m.gmPerPatient;
	if (benchmark != null) {
		const laggard = partners.filter((p) => p.patients >= Math.max(200, m.patients * .02) && p.gmPerPatient != null).sort((a, b) => a.gmPerPatient - benchmark - (b.gmPerPatient - benchmark))[0];
		if (laggard && laggard.gmPerPatient < benchmark) {
			const gap = (laggard.gmPerPatient - benchmark) / benchmark * 100;
			out.push({
				id: "partner-gap",
				category: "Partner Opportunity",
				tone: "negative",
				headline: `${laggard.key} runs ${pct(abs$1(gap))} below the portfolio GM / Patient benchmark`,
				body: `${num(laggard.patients)} patients and ${inr(laggard.revenue)} revenue at ${inr(laggard.gmPerPatient, { compact: false })} GM / Patient versus a portfolio benchmark of ${inr(benchmark, { compact: false })}.`
			});
		}
	}
	if (c.delta.patientsPerCamp != null) {
		const up = c.delta.patientsPerCamp > 0;
		out.push({
			id: "productivity",
			category: "Camp Productivity",
			tone: up ? "positive" : "neutral",
			headline: `Patients per camp ${up ? "increased" : "decreased"} ${pct(abs$1(c.delta.patientsPerCamp))} to ${num(m.patientsPerCamp)}`,
			body: `Each camp now generates ${inr(m.revenuePerCamp)} revenue and ${inr(m.gmPerCamp)} gross margin on average.`
		});
	}
	if (conc.top10Pct != null) out.push({
		id: "concentration",
		category: "Concentration",
		tone: conc.top10Pct > 70 ? "negative" : "neutral",
		headline: `Top 10 partners contribute ${pct(conc.top10Pct)} of total revenue`,
		body: `${num(conc.totalPartners)} partners are active in this period; the top 5 alone account for ${pct(conc.top5Pct)}.`
	});
	const best = [...campTypes].filter((t) => t.gmPerPatient != null).sort((a, b) => b.gmPerPatient - a.gmPerPatient)[0];
	if (best && m.patients > 0 && best.patients / m.patients < .35) out.push({
		id: "mix",
		category: "Mix Opportunity",
		tone: "positive",
		headline: `${campTypeLabel(best.key)} camps deliver the highest GM / Patient at ${inr(best.gmPerPatient, { compact: false })}`,
		body: `They currently represent only ${pct(best.patients / m.patients * 100)} of patient volume — expanding this mix lifts blended margin.`
	});
	return out.slice(0, 6);
}
function buildAlerts(args) {
	const { comparison: c, campTypes, partners, conc, series } = args;
	const out = [];
	const benchmark = c.current.gmPerPatient;
	const gmpSeries = series.filter((p) => p.gmPerPatient != null).slice(-4);
	if (gmpSeries.length >= 4) {
		let declines = 0;
		for (let i = gmpSeries.length - 1; i > 0; i--) if (gmpSeries[i].gmPerPatient < gmpSeries[i - 1].gmPerPatient) declines++;
		else break;
		if (declines >= 3) out.push({
			id: "margin-pressure",
			level: "RED",
			title: "Margin Pressure",
			issue: `GM / Patient declined for ${declines} consecutive periods, now ${inr(gmpSeries[gmpSeries.length - 1].gmPerPatient, { compact: false })}.`,
			impact: "Sustained erosion of unit economics compounds directly into gross margin as volumes scale.",
			action: "Review pricing and package cost for the fastest-growing camps before adding volume."
		});
	}
	if (benchmark != null) {
		const risky = partners.filter((p) => p.gmPerPatient != null && p.patients >= Math.max(200, c.current.patients * .03)).map((p) => ({
			p,
			gap: (p.gmPerPatient - benchmark) / benchmark * 100
		})).filter((x) => x.gap < -10).sort((a, b) => a.gap - b.gap)[0];
		if (risky) out.push({
			id: "partner-economics",
			level: "AMBER",
			title: "Partner Economics",
			issue: `${risky.p.key} delivers ${num(risky.p.patients)} patients at ${pct(abs$1(risky.gap))} below the portfolio GM / Patient benchmark.`,
			impact: `High volume at low margin dilutes blended profitability across ${inr(risky.p.revenue)} of revenue.`,
			action: "Renegotiate package pricing or shift this partner to a higher-margin package mix."
		});
	}
	if (conc.top5Pct != null && conc.top5Pct > 40) out.push({
		id: "concentration-risk",
		level: "AMBER",
		title: "Concentration Risk",
		issue: `Top 5 partners account for ${pct(conc.top5Pct)} of revenue.`,
		impact: "Losing a single anchor partner would materially dent quarterly revenue and margin.",
		action: "Prioritise pipeline conversion in the mid-tier partner base to broaden the revenue base."
	});
	const highMargin = [...campTypes].filter((t) => t.gmPerPatient != null && benchmark != null && t.gmPerPatient > benchmark).sort((a, b) => b.gmPerPatient - a.gmPerPatient)[0];
	if (highMargin && c.current.patients > 0 && highMargin.patients / c.current.patients < .3) out.push({
		id: "growth-opportunity",
		level: "GREEN",
		title: "Growth Opportunity",
		issue: `${campTypeLabel(highMargin.key)} camps earn ${inr(highMargin.gmPerPatient, { compact: false })} GM / Patient but hold only ${pct(highMargin.patients / c.current.patients * 100)} of volume.`,
		impact: `Every point of mix shift toward this type lifts portfolio GM / Patient above ${inr(benchmark, { compact: false })}.`,
		action: "Target the top 10 partners with this camp type in the next quarter's plan."
	});
	return out;
}
var DataError = class extends Error {};
var FIELD_ALIASES = {
	collection_date: [
		"collection_date",
		"collectiondate",
		"date",
		"camp_date",
		"collected_on"
	],
	sourcetype: [
		"sourcetype",
		"source_type",
		"source"
	],
	center_name: [
		"center_name",
		"centre_name",
		"centername",
		"partner",
		"partner_name",
		"client_name"
	],
	center_code: [
		"center_code",
		"centre_code",
		"centercode",
		"partner_code"
	],
	package_code: ["package_code", "packagecode"],
	package_name: [
		"package_name",
		"packagename",
		"package"
	],
	camp_type: [
		"camp_type",
		"camptype",
		"type"
	],
	camp_code: [
		"camp_code",
		"campcode",
		"camp_id"
	],
	booking_count: [
		"booking_count",
		"bookingcount",
		"patient_count",
		"patients",
		"bookings",
		"patient count"
	],
	revenue: [
		"revenue",
		"total_revenue",
		"net_revenue",
		"sales"
	],
	new_cpt: [
		"new_cpt",
		"cpt",
		"cost_per_test",
		"cost"
	],
	gross_margin: [
		"gross_margin",
		"grossmargin",
		"gross margin",
		"gm"
	],
	gross_margin_per_patient: [
		"gross_margin_per_patient",
		"grossmarginperpatient",
		"gm_per_patient",
		"gross margin per patient"
	]
};
var REQUIRED = [
	"collection_date",
	"camp_code",
	"center_name",
	"booking_count",
	"revenue",
	"gross_margin"
];
var normKey = (k) => k.trim().toLowerCase().replace(/[\s.-]+/g, "_");
function buildHeaderMap(headers) {
	const map = {};
	const normalized = headers.map((h) => ({
		raw: h,
		norm: normKey(h)
	}));
	Object.keys(FIELD_ALIASES).forEach((target) => {
		const aliases = FIELD_ALIASES[target].map(normKey);
		const hit = normalized.find((h) => aliases.includes(h.norm));
		if (hit) map[target] = hit.raw;
	});
	return map;
}
var MONTHS = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11
};
function parseDate(input) {
	if (input == null) return null;
	if (input instanceof Date && !Number.isNaN(input.getTime())) return new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime();
	const raw = String(input).trim();
	if (!raw) return null;
	const words = raw.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
	if (words) {
		const m = MONTHS[words[1].slice(0, 3).toLowerCase()];
		if (m !== void 0) return new Date(+words[3], m, +words[2]).getTime();
	}
	const words2 = raw.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
	if (words2) {
		const m = MONTHS[words2[2].slice(0, 3).toLowerCase()];
		if (m !== void 0) return new Date(+words2[3], m, +words2[1]).getTime();
	}
	const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).getTime();
	const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
	if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]).getTime();
	const fallback = new Date(raw);
	if (!Number.isNaN(fallback.getTime())) return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()).getTime();
	return null;
}
function toNumber(v) {
	if (v == null || v === "") return null;
	if (typeof v === "number") return Number.isFinite(v) ? v : null;
	const cleaned = String(v).replace(/[₹,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
	if (!cleaned || cleaned === "-") return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}
function buildDataset(records, sourceLabel) {
	if (!records.length) throw new DataError("The file contains no data rows.");
	const headers = Object.keys(records[0]);
	const map = buildHeaderMap(headers);
	const missing = REQUIRED.filter((r) => !map[r]);
	if (missing.length) throw new DataError(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Found: ${headers.join(", ")}`);
	const get = (rec, key) => map[key] ? rec[map[key]] : void 0;
	const rows = [];
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
			cpt: toNumber(get(rec, "new_cpt"))
		});
	}
	if (!rows.length) throw new DataError("No valid rows found (dates or camp codes could not be read).");
	rows.sort((a, b) => a.ts - b.ts);
	const first = rows[0];
	const last = rows[rows.length - 1];
	return {
		rows,
		summary: {
			rows: rows.length,
			minTs: first.ts,
			maxTs: last.ts,
			distinctCamps: new Set(rows.map((r) => r.campCode)).size,
			partners: new Set(rows.map((r) => r.centerName)).size,
			campTypes: new Set(rows.map((r) => r.campType)).size,
			missingRevenuePct: missingRevenue / rows.length * 100,
			missingMarginPct: missingMargin / rows.length * 100
		},
		sourceLabel,
		loadedAt: Date.now()
	};
}
function parseCsvText(text, sourceLabel) {
	return buildDataset(import_papaparse.default.parse(text, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: false,
		transformHeader: (h) => h.trim()
	}).data, sourceLabel);
}
async function loadDatasetFromFile(file) {
	const name = file.name.toLowerCase();
	if (name.endsWith(".csv") || name.endsWith(".txt")) return parseCsvText(await file.text(), file.name);
	if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
		const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
		const wb = XLSX.read(await file.arrayBuffer(), {
			type: "array",
			cellDates: true
		});
		const sheet = wb.Sheets[wb.SheetNames[0]];
		return buildDataset(XLSX.utils.sheet_to_json(sheet, { defval: "" }), file.name);
	}
	throw new DataError("Unsupported file type. Upload a CSV, XLSX or XLS file.");
}
async function loadDatasetFromUrl(url) {
	let target = url.trim();
	if (!target) throw new DataError("Enter a published Google Sheet or CSV URL.");
	const gs = target.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
	if (gs && !/output=csv|\/pub\?/.test(target)) {
		const gid = target.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
		target = `https://docs.google.com/spreadsheets/d/${gs[1]}/export?format=csv&gid=${gid}`;
	}
	const res = await fetch(target);
	if (!res.ok) throw new DataError(`Could not fetch the sheet (HTTP ${res.status}). Make sure it is published to the web.`);
	const text = await res.text();
	if (/^\s*</.test(text)) throw new DataError("That URL returned a web page, not CSV. Use File → Share → Publish to web → CSV.");
	return parseCsvText(text, "Google Sheet");
}
var DashboardContext = (0, import_react.createContext)(null);
function useDashboard() {
	const ctx = (0, import_react.useContext)(DashboardContext);
	if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
	return ctx;
}
function DashboardProvider({ children }) {
	const [dataset, setDataset] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [filters, setFilters] = (0, import_react.useState)(defaultFilters);
	const [nonce, setNonce] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		setLoadError(null);
		fetch("/data/camps.csv").then((r) => {
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			return r.text();
		}).then((text) => {
			if (cancelled) return;
			setDataset(parseCsvText(text, "camps.csv (bundled)"));
		}).catch((e) => {
			if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load the dataset.");
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [nonce]);
	const reload = (0, import_react.useCallback)(() => setNonce((n) => n + 1), []);
	const resetFilters = (0, import_react.useCallback)(() => setFilters(defaultFilters), []);
	const value = (0, import_react.useMemo)(() => {
		const rowsAll = dataset?.rows ?? [];
		const minTs = dataset?.summary.minTs ?? Date.now();
		const maxTs = dataset?.summary.maxTs ?? Date.now();
		const range = resolveRange(filters, minTs, maxTs);
		const rows = applyFilters(rowsAll, filters, range);
		const current = computeMetrics(rows);
		const comparison = compare(current, current, false);
		const campTypes = byCampType(rows);
		const partners = byPartner(rows);
		const conc = concentration(partners);
		const defaultGranularity = suggestGranularity(range);
		const insightArgs = {
			comparison,
			campTypes,
			partners,
			conc,
			series: buildSeries(rows, defaultGranularity)
		};
		const options = {
			partners: [...new Set(rowsAll.map((r) => r.centerName))].sort((a, b) => a.localeCompare(b)),
			campTypes: [...new Set(rowsAll.map((r) => r.campType))].sort(),
			sourceTypes: [...new Set(rowsAll.map((r) => r.sourceType))].sort()
		};
		return {
			dataset,
			loading,
			loadError,
			reload,
			setDataset,
			filters,
			setFilters,
			resetFilters,
			range,
			rows,
			comparison,
			campTypes,
			partners,
			conc,
			insights: buildInsights(insightArgs),
			alerts: buildAlerts(insightArgs),
			narrative: buildNarrative(comparison),
			defaultGranularity,
			options
		};
	}, [
		dataset,
		loading,
		loadError,
		filters,
		reload,
		resetFilters
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardContext.Provider, {
		value,
		children
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
var Sheet = Dialog$1;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal$1;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay$1.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent$1.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle$1.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription$1.displayName;
function MultiSelect({ label, options, selected, onChange, searchable, renderLabel = (v) => v }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const summary = selected.length === 0 ? `All ${label}` : selected.length === 1 ? renderLabel(selected[0]) : `${selected.length} ${label} selected`;
	const toggle = (value) => onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: cn("justify-between gap-2 font-normal", selected.length > 0 && "border-primary/40 text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-[180px] truncate",
					children: summary
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "opacity-50" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			align: "start",
			className: "w-72 p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [searchable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: `Search ${label.toLowerCase()}…` }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
				className: "max-h-72",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No matches." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: o,
					onSelect: () => toggle(o),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex h-4 w-4 items-center justify-center rounded border border-border", selected.includes(o) && "border-primary bg-primary text-primary-foreground"),
						children: selected.includes(o) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }) : null
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: renderLabel(o)
					})]
				}, o)) })]
			})] }), selected.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "w-full",
					onClick: () => onChange([]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), " Clear"]
				})
			}) : null]
		})]
	});
}
function Controls() {
	const { filters, setFilters, options, range, resetFilters } = useDashboard();
	const isFiltered = filters.partners.length > 0 || filters.campTypes.length > 0 || filters.sourceTypes.length > 0 || filters.preset !== "all";
	const toISO = (ts) => ts == null ? "" : new Date(ts).toISOString().slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-2 font-normal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: DATE_PRESETS.find((p) => p.id === filters.preset)?.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden text-muted-foreground num sm:inline",
							children: [
								formatDate(range.from),
								" → ",
								formatDate(range.to)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "opacity-50" })
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
				align: "start",
				className: "w-64 p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-1",
					children: DATE_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilters((f) => ({
							...f,
							preset: p.id
						})),
						className: cn("rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent", filters.preset === p.id && "bg-accent font-medium"),
						children: p.label
					}, p.id))
				}), filters.preset === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted-foreground",
						children: ["From", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: toISO(filters.customFrom),
							onChange: (e) => setFilters((f) => ({
								...f,
								customFrom: e.target.value ? new Date(e.target.value).getTime() : null
							}))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-muted-foreground",
						children: ["To", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: toISO(filters.customTo),
							onChange: (e) => setFilters((f) => ({
								...f,
								customTo: e.target.value ? new Date(e.target.value).getTime() : null
							}))
						})]
					})]
				}) : null]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
				label: "Partners",
				searchable: true,
				options: options.partners,
				selected: filters.partners,
				onChange: (partners) => setFilters((f) => ({
					...f,
					partners
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
				label: "Camp Types",
				options: options.campTypes,
				selected: filters.campTypes,
				onChange: (campTypes) => setFilters((f) => ({
					...f,
					campTypes
				})),
				renderLabel: campTypeLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelect, {
				label: "Sources",
				options: options.sourceTypes,
				selected: filters.sourceTypes,
				onChange: (sourceTypes) => setFilters((f) => ({
					...f,
					sourceTypes
				}))
			}),
			isFiltered ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: resetFilters,
				className: "text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), " Reset"]
			}) : null
		]
	});
}
function FilterBar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden md:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "md:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {}), " Filters"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			className: "max-h-[80vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Filters" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, {})
			})]
		})] })
	})] });
}
var SNAPSHOT_ID = "leadership-snapshot";
async function exportSnapshot(kind) {
	const node = document.getElementById(SNAPSHOT_ID);
	if (!node) return;
	node.classList.add("export-snapshot");
	let canvas;
	try {
		const { toCanvas } = await import("../_libs/html-to-image.mjs").then((n) => n.t);
		canvas = await toCanvas(node, {
			backgroundColor: "#F5F7FA",
			pixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
			cacheBust: true
		});
	} finally {
		node.classList.remove("export-snapshot");
	}
	const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	if (kind === "png") {
		const link = document.createElement("a");
		link.download = `camps-leadership-snapshot-${stamp}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
		return;
	}
	const { jsPDF } = await import("../_libs/jspdf.mjs").then((n) => n.t);
	const pdf = new jsPDF({
		orientation: "portrait",
		unit: "pt",
		format: "a4"
	});
	const pageW = pdf.internal.pageSize.getWidth();
	const pageH = pdf.internal.pageSize.getHeight();
	const margin = 24;
	const imgW = pageW - 48;
	const usableH = pageH - 48;
	const scale = canvas.width / imgW;
	const sliceH = Math.floor(usableH * scale);
	const slice = document.createElement("canvas");
	const ctx = slice.getContext("2d");
	if (!ctx) return;
	const src = canvas.getContext("2d", { willReadFrequently: true });
	const isBlankRow = (y) => {
		if (!src) return false;
		try {
			const { data } = src.getImageData(0, y, canvas.width, 1);
			const step = 4 * Math.max(1, Math.floor(canvas.width / 220));
			const r = data[0] ?? 0;
			const g = data[1] ?? 0;
			const b = data[2] ?? 0;
			for (let i = step; i < data.length; i += step) if (Math.abs((data[i] ?? 0) - r) > 6 || Math.abs((data[i + 1] ?? 0) - g) > 6 || Math.abs((data[i + 2] ?? 0) - b) > 6) return false;
			return true;
		} catch {
			return false;
		}
	};
	const findCut = (start, ideal) => {
		const band = Math.max(6, Math.round(sliceH * .006));
		const limit = start + Math.round(sliceH * .6);
		for (let y = ideal; y > limit; y -= 2) {
			let ok = true;
			for (let k = 0; k < band; k += 2) if (!isBlankRow(y - k)) {
				ok = false;
				break;
			}
			if (ok) return y;
		}
		return ideal;
	};
	let sy = 0;
	let first = true;
	while (sy < canvas.height) {
		let h = Math.min(sliceH, canvas.height - sy);
		if (sy + h < canvas.height) h = findCut(sy, sy + h) - sy;
		slice.width = canvas.width;
		slice.height = h;
		ctx.fillStyle = "#F5F7FA";
		ctx.fillRect(0, 0, slice.width, slice.height);
		ctx.drawImage(canvas, 0, sy, canvas.width, h, 0, 0, canvas.width, h);
		if (!first) pdf.addPage();
		pdf.addImage(slice.toDataURL("image/jpeg", .92), "JPEG", margin, margin, imgW, h / scale, void 0, "FAST");
		first = false;
		sy += h;
	}
	pdf.save(`camps-leadership-snapshot-${stamp}.pdf`);
}
function apply(theme) {
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
}
function ThemeToggle() {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const initial = localStorage.getItem("theme") ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		setTheme(initial);
		apply(initial);
	}, []);
	const toggle = () => {
		const next = theme === "dark" ? "light" : "dark";
		setTheme(next);
		apply(next);
		localStorage.setItem("theme", next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		onClick: toggle,
		"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: theme === "dark" ? "Light" : "Dark"
		})]
	});
}
function DashboardHeader({ onUpdateData }) {
	const { dataset, reload, loading } = useDashboard();
	const [exporting, setExporting] = (0, import_react.useState)(null);
	const runExport = async (kind) => {
		setExporting(kind);
		try {
			await exportSnapshot(kind);
		} finally {
			setExporting(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl backdrop-saturate-150",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Leadership Command Centre"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]",
						children: "Camps Performance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-medium text-muted-foreground",
						children: "Camp growth, revenue and profitability"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: reload,
							disabled: loading,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: loading ? "animate-spin" : "" }), "Refresh"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => runExport("png"),
							disabled: exporting !== null,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), exporting === "png" ? "Exporting…" : "PNG"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => runExport("pdf"),
							disabled: exporting !== null,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), exporting === "pdf" ? "Preparing…" : "Export Snapshot"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: onUpdateData,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Update Data"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground num",
					children: [
						"Last updated ",
						dataset ? formatDateTime(dataset.loadedAt) : "—",
						dataset ? ` · ${dataset.sourceLabel}` : ""
					]
				})]
			})]
		})
	});
}
function KPIGrid() {
	const { comparison } = useDashboard();
	const m = comparison.current;
	const hero = [
		{
			label: "Gross Margin / Patient",
			value: inr(m.gmPerPatient, { compact: false }),
			note: "Primary unit economics KPI",
			emphasis: true
		},
		{
			label: "Revenue",
			value: inr(m.revenue),
			note: `${num(m.camps)} camps in scope`
		},
		{
			label: "Gross Margin",
			value: inr(m.grossMargin),
			note: `${pct(m.gmPct)} of revenue`
		}
	];
	const secondary = [
		{
			label: "Total Camps",
			value: num(m.camps)
		},
		{
			label: "Patients",
			value: compactNum(m.patients)
		},
		{
			label: "Revenue / Camp",
			value: inr(m.revenuePerCamp)
		}
	];
	const accents = [
		"var(--color-primary)",
		"var(--color-success)",
		"var(--color-warning)"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-3",
			children: hero.map((k, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("card-surface group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6"),
				style: { backgroundImage: `linear-gradient(150deg, color-mix(in oklab, ${accents[idx]} 12%, var(--color-card)), color-mix(in oklab, var(--color-card) 70%, transparent))` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 top-0 h-[3px]",
						style: { background: accents[idx] }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
						children: k.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("num mt-3 text-[34px] font-bold leading-none tracking-tight sm:text-[40px]", k.emphasis ? "text-primary" : "text-foreground"),
						children: k.value
					}),
					k.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-medium text-muted-foreground",
						children: k.note
					}) : null
				]
			}, k.label))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0",
			children: secondary.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-muted-foreground",
					children: k.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num mt-2 text-xl font-bold text-foreground sm:text-2xl",
					children: k.value
				})]
			}, k.label))
		})]
	});
}
function Section({ title, subtitle, action, children, className, id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id,
		className: cn("space-y-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold tracking-tight text-foreground sm:text-xl",
				children: title
			}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-sm font-medium text-muted-foreground",
				children: subtitle
			}) : null] }), action]
		}), children]
	});
}
function ToggleGroup({ value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex rounded-lg border border-border bg-secondary/60 p-0.5",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(o.value),
			className: cn("rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors", value === o.value ? "bg-card text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground"),
			children: o.label
		}, o.value))
	});
}
function EmptyState({ label = NA }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-40 items-center justify-center text-sm font-medium text-muted-foreground",
		children: label
	});
}
var GRAN_OPTIONS = [
	{
		value: "daily",
		label: "Daily"
	},
	{
		value: "weekly",
		label: "Weekly"
	},
	{
		value: "monthly",
		label: "Monthly"
	}
];
function ChartTooltip({ active, payload, label, rows }) {
	if (!active || !payload || payload.length === 0) return null;
	const point = payload[0]?.payload;
	if (!point) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-3 py-2 shadow-[var(--shadow-card-hover)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-bold text-foreground",
			children: String(point["label"] ?? label ?? "")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 space-y-1",
			children: rows.map((r) => {
				const value = point[r.key];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-6 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-muted-foreground",
						children: r.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num font-bold text-foreground",
						children: typeof value === "number" ? r.format(value) : "Not available"
					})]
				}, r.key);
			})
		})]
	});
}
function LatestBadge({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mb-1 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground num",
		children
	});
}
function RevenueMomentum() {
	const { rows, defaultGranularity } = useDashboard();
	const [gran, setGran] = (0, import_react.useState)(null);
	const g = gran ?? defaultGranularity;
	const series = (0, import_react.useMemo)(() => buildSeries(rows, g), [rows, g]);
	const latest = series[series.length - 1];
	const previousDay = series[series.length - 2];
	const highlighted = g === "daily" && previousDay ? previousDay : latest;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Revenue Momentum",
		subtitle: "How fast is the Camps business growing?",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup, {
			value: g,
			options: GRAN_OPTIONS,
			onChange: setGran
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-4 sm:p-5",
			children: series.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No data in the selected range" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-end gap-x-6 gap-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "eyebrow",
						children: [
							g === "daily" && previousDay ? "Previous day" : "Latest period",
							" · ",
							highlighted?.label
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "num mt-1 text-2xl font-bold text-foreground",
						children: inr(highlighted?.revenue ?? null)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LatestBadge, { children: [
						compactNum(highlighted?.patients ?? null),
						" patients · ",
						highlighted?.camps ?? 0,
						" camps"
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[260px] w-full sm:h-[300px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: series,
							margin: {
								top: 8,
								right: 8,
								bottom: 0,
								left: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "revFill",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "var(--color-primary)",
										stopOpacity: .22
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "var(--color-primary)",
										stopOpacity: .01
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tickLine: false,
									axisLine: false,
									minTickGap: 24,
									tick: {
										fontSize: 12,
										fontWeight: 600,
										fill: "var(--color-muted-foreground)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									width: 58,
									tick: {
										fontSize: 12,
										fontWeight: 600,
										fill: "var(--color-muted-foreground)"
									},
									tickFormatter: (v) => inr(v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, { rows: [
									{
										key: "revenue",
										label: "Revenue",
										format: (v) => inr(v)
									},
									{
										key: "patients",
										label: "Patients",
										format: (v) => compactNum(v)
									},
									{
										key: "camps",
										label: "Camps",
										format: (v) => compactNum(v)
									}
								] }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "revenue",
									stroke: "var(--color-primary)",
									strokeWidth: 2,
									fill: "url(#revFill)",
									activeDot: {
										r: 4,
										strokeWidth: 2,
										stroke: "var(--color-card)"
									},
									isAnimationActive: true,
									animationDuration: 600
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm font-medium text-muted-foreground",
					children: g === "daily" && previousDay ? `Previous day revenue was ${inr(highlighted?.revenue ?? null)} across ${compactNum(highlighted?.patients ?? null)} patients.` : `Latest ${g === "daily" ? "day" : g === "weekly" ? "week" : "month"} revenue is ${inr(latest?.revenue ?? null)} across ${compactNum(latest?.patients ?? null)} patients.`
				})
			] })
		})
	});
}
function ProfitabilityTrend() {
	const { rows, defaultGranularity, comparison } = useDashboard();
	const [gran, setGran] = (0, import_react.useState)(null);
	const g = gran ?? defaultGranularity;
	const series = (0, import_react.useMemo)(() => buildSeries(rows, g), [rows, g]);
	const latest = series[series.length - 1];
	const benchmark = comparison.current.gmPerPatient;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Gross Margin / Patient",
		subtitle: "Are we growing profitably?",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup, {
			value: g,
			options: GRAN_OPTIONS,
			onChange: setGran
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-4 sm:p-5",
			children: series.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No data in the selected range" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-end gap-x-6 gap-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "eyebrow",
						children: ["Latest period · ", latest?.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "num mt-1 text-2xl font-bold text-foreground",
						children: inr(latest?.gmPerPatient ?? null, { compact: false })
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LatestBadge, { children: ["Portfolio benchmark ", inr(benchmark, { compact: false })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[260px] w-full sm:h-[300px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: series,
							margin: {
								top: 8,
								right: 8,
								bottom: 0,
								left: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tickLine: false,
									axisLine: false,
									minTickGap: 24,
									tick: {
										fontSize: 12,
										fontWeight: 600,
										fill: "var(--color-muted-foreground)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									width: 58,
									domain: ["auto", "auto"],
									tick: {
										fontSize: 12,
										fontWeight: 600,
										fill: "var(--color-muted-foreground)"
									},
									tickFormatter: (v) => inr(v)
								}),
								benchmark != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									y: benchmark,
									stroke: "var(--color-muted-foreground)",
									strokeDasharray: "4 4",
									strokeOpacity: .7
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, { rows: [
									{
										key: "gmPerPatient",
										label: "GM / Patient",
										format: (v) => inr(v, { compact: false })
									},
									{
										key: "gmPct",
										label: "GM %",
										format: (v) => pct(v)
									},
									{
										key: "patients",
										label: "Patients",
										format: (v) => compactNum(v)
									}
								] }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "gmPerPatient",
									stroke: "var(--color-success)",
									strokeWidth: 2,
									dot: false,
									activeDot: {
										r: 4,
										strokeWidth: 2,
										stroke: "var(--color-card)"
									},
									isAnimationActive: true,
									animationDuration: 600
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm font-medium text-muted-foreground",
					children: trendSentence(series, "gmPerPatient")
				})
			] })
		})
	});
}
var CORPORATE = [
	"COR",
	"CORPORATE",
	"CORP"
];
var PHARMA = [
	"PHA",
	"PHARMA",
	"PHARMACY"
];
function classify(campType) {
	const key = campType.trim().toUpperCase();
	if (CORPORATE.includes(key)) return "corporate";
	if (PHARMA.includes(key)) return "pharma";
	return null;
}
function RevenueMix() {
	const { rows, defaultGranularity } = useDashboard();
	const [gran, setGran] = (0, import_react.useState)(null);
	const g = gran ?? defaultGranularity;
	const { data, corTotal, phaTotal } = (0, import_react.useMemo)(() => {
		const buckets = /* @__PURE__ */ new Map();
		let cor = 0;
		let pha = 0;
		for (const r of rows) {
			const bucket = classify(r.campType);
			if (!bucket || r.revenue == null) continue;
			const key = bucketStart(r.ts, g);
			const entry = buckets.get(key) ?? {
				corporate: 0,
				pharma: 0
			};
			entry[bucket] += r.revenue;
			buckets.set(key, entry);
			if (bucket === "corporate") cor += r.revenue;
			else pha += r.revenue;
		}
		return {
			data: [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([ts, v]) => ({
				ts,
				label: bucketLabel(ts, g),
				...v
			})),
			corTotal: cor,
			phaTotal: pha
		};
	}, [rows, g]);
	const total = corTotal + phaTotal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Revenue Mix",
		subtitle: `${campTypeLabel("COR")} vs ${campTypeLabel("PHA")} revenue split`,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup, {
			value: g,
			options: GRAN_OPTIONS,
			onChange: setGran
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-4 sm:p-5",
			children: data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No corporate or pharma revenue in the selected range" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end gap-x-8 gap-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixStat, {
					label: campTypeLabel("COR"),
					value: corTotal,
					share: total ? corTotal / total * 100 : null,
					dot: "bg-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MixStat, {
					label: campTypeLabel("PHA"),
					value: phaTotal,
					share: total ? phaTotal / total * 100 : null,
					dot: "bg-success"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-[260px] w-full sm:h-[300px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data,
						margin: {
							top: 8,
							right: 8,
							bottom: 0,
							left: 0
						},
						barGap: 4,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "var(--color-border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tickLine: false,
								axisLine: false,
								tick: {
									fontSize: 12,
									fontWeight: 600,
									fill: "var(--color-muted-foreground)"
								},
								minTickGap: 16
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tickLine: false,
								axisLine: false,
								width: 56,
								tick: {
									fontSize: 12,
									fontWeight: 600,
									fill: "var(--color-muted-foreground)"
								},
								tickFormatter: (v) => inr(v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								cursor: {
									fill: "var(--color-secondary)",
									opacity: .5
								},
								content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTooltip, { rows: [{
									key: "corporate",
									label: campTypeLabel("COR"),
									format: (v) => inr(v)
								}, {
									key: "pharma",
									label: campTypeLabel("PHA"),
									format: (v) => inr(v)
								}] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								verticalAlign: "top",
								height: 28,
								wrapperStyle: {
									fontSize: 12,
									fontWeight: 600
								},
								formatter: (value) => value === "corporate" ? campTypeLabel("COR") : campTypeLabel("PHA")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "corporate",
								fill: "var(--color-primary)",
								radius: [
									4,
									4,
									0,
									0
								],
								maxBarSize: 28
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "pharma",
								fill: "var(--color-success)",
								radius: [
									4,
									4,
									0,
									0
								],
								maxBarSize: 28
							})
						]
					})
				})
			})] })
		})
	});
}
function MixStat({ label, value, share, dot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "eyebrow flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `inline-block size-2 rounded-full ${dot}` }), label]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num mt-1 text-2xl font-bold text-foreground",
			children: inr(value)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs font-medium text-muted-foreground",
			children: [pct(share), " of mix"]
		})
	] });
}
function CampTypePerformance() {
	const { campTypes, comparison, filters, setFilters } = useDashboard();
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	const ranked = (0, import_react.useMemo)(() => [...campTypes].sort((a, b) => (b.gmPerPatient ?? -1) - (a.gmPerPatient ?? -1)), [campTypes]);
	const visible = showAll ? ranked : ranked.slice(0, 8);
	const max = Math.max(...ranked.map((t) => t.gmPerPatient ?? 0), 1);
	const benchmark = comparison.current.gmPerPatient ?? 0;
	const toggle = (key) => setFilters((f) => ({
		...f,
		campTypes: f.campTypes.includes(key) ? f.campTypes.filter((c) => c !== key) : [key]
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Where Profitability Comes From",
		subtitle: "Camp Type Performance · ranked by GM / Patient",
		action: ranked.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => setShowAll((s) => !s),
			children: showAll ? "Show top 8" : "View all"
		}) : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface divide-y divide-border",
			children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No camp types in the selected range" }) : visible.map((t) => {
				const gmp = t.gmPerPatient;
				const tone = gmp == null ? "bg-muted-foreground/30" : gmp >= benchmark * 1.05 ? "bg-success" : gmp >= benchmark * .9 ? "bg-warning" : "bg-destructive";
				const active = filters.campTypes.includes(t.key);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => toggle(t.key),
					className: cn("group grid w-full grid-cols-2 gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-secondary/60 sm:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] sm:items-center sm:p-5", active && "bg-secondary/80"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-2 sm:col-span-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: campTypeLabel(t.key)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-full rounded-full transition-all duration-500", tone),
									style: { width: `${Math.max(3, (gmp ?? 0) / max * 100)}%` }
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Patients",
							value: compactNum(t.patients)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Revenue",
							value: inr(t.revenue)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "GM / Patient",
							value: inr(gmp, { compact: false }),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "GM %",
							value: pct(t.gmPct)
						})
					]
				}, t.key);
			})
		})
	});
}
function Metric({ label, value, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sm:text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("num text-sm font-semibold text-foreground", strong && "font-bold"),
			children: value
		})]
	});
}
function PartnerPerformance() {
	const { partners, comparison, filters, setFilters } = useDashboard();
	const [tab, setTab] = (0, import_react.useState)("revenue");
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const benchmark = comparison.current.gmPerPatient;
	const ranked = (0, import_react.useMemo)(() => {
		const list = [...partners];
		if (tab === "revenue") return list.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
		const floor = Math.max(100, comparison.current.patients * .005);
		return list.filter((p) => p.gmPerPatient != null && p.patients >= floor).sort((a, b) => b.gmPerPatient - a.gmPerPatient);
	}, [
		partners,
		tab,
		comparison.current.patients
	]);
	const visible = expanded ? ranked.slice(0, 15) : ranked.slice(0, 5);
	const toggle = (key) => setFilters((f) => ({
		...f,
		partners: f.partners.includes(key) ? f.partners.filter((p) => p !== key) : [key]
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Partner Performance",
		subtitle: "Who is driving revenue and who is driving margin?",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup, {
			value: tab,
			onChange: setTab,
			options: [{
				value: "revenue",
				label: "Revenue Leaders"
			}, {
				value: "profit",
				label: "Profitability Leaders"
			}]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface divide-y divide-border",
			children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No partners in the selected range" }) : visible.map((p, i) => {
				const gap = benchmark && p.gmPerPatient != null ? (p.gmPerPatient - benchmark) / benchmark * 100 : null;
				const tone = gap == null ? "text-muted-foreground" : gap >= 5 ? "text-success" : gap >= -10 ? "text-warning" : "text-destructive";
				const active = filters.partners.includes(p.key);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => toggle(p.key),
					className: cn("grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-secondary/60 sm:grid-cols-[auto_1.8fr_repeat(4,minmax(0,1fr))] sm:p-5", active && "bg-secondary/80"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-sm font-semibold text-muted-foreground",
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "col-span-1 truncate text-sm font-semibold text-foreground",
							children: p.key
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Camps",
							value: num(p.camps)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Patients",
							value: compactNum(p.patients)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Revenue",
							value: inr(p.revenue)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-muted-foreground",
								children: "GM / Patient"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("num text-sm font-bold", tone),
								children: inr(p.gmPerPatient, { compact: false })
							})]
						})
					]
				}, p.key);
			})
		}), ranked.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => setExpanded((e) => !e),
			children: expanded ? "Show top 5" : "View more partners"
		}) : null]
	});
}
function Cell({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sm:text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num text-sm font-semibold text-foreground",
			children: value
		})]
	});
}
function PartnerConcentration() {
	const { conc } = useDashboard();
	if (conc.top5Pct == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Revenue Concentration",
		subtitle: "How dependent are we on a few partners?",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "Not available for the selected range" })
		})
	});
	const next5 = (conc.top10Pct ?? 0) - conc.top5Pct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Revenue Concentration",
		subtitle: "How dependent are we on a few partners?",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface p-4 sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-3 w-full overflow-hidden rounded-full bg-secondary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary transition-all duration-500",
						style: { width: `${conc.top5Pct}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary/50 transition-all duration-500",
						style: { width: `${next5}%` }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-border transition-all duration-500",
						style: { width: `${conc.othersPct}%` }
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Top 5 partners",
						value: pct(conc.top5Pct),
						sub: inr(conc.top5Revenue),
						dot: "bg-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Top 10 partners",
						value: pct(conc.top10Pct),
						sub: inr(conc.top10Revenue),
						dot: "bg-primary/50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "All others",
						value: pct(conc.othersPct),
						sub: `${num(Math.max(0, conc.totalPartners - 10))} partners`,
						dot: "bg-border"
					})
				]
			})]
		})
	});
}
function Stat({ label, value, sub, dot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${dot}` }), label]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num mt-1 text-xl font-bold text-foreground",
			children: value
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "num text-xs font-medium text-muted-foreground",
			children: sub
		})
	] });
}
function LeadershipInsights() {
	const { insights } = useDashboard();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Insights",
		subtitle: "Generated from the selected data",
		children: insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { label: "No insights available for this selection" })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: insights.map((i) => {
				const Icon = i.tone === "positive" ? TrendingUp : i.tone === "negative" ? TrendingDown : Lightbulb;
				const tone = i.tone === "positive" ? "text-success" : i.tone === "negative" ? "text-destructive" : "text-muted-foreground";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card-surface flex flex-col gap-2 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-4 w-4", tone) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: i.category
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold leading-snug text-foreground",
							children: i.headline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium leading-relaxed text-muted-foreground",
							children: i.body
						})
					]
				}, i.id);
			})
		})
	});
}
var STYLES = {
	RED: {
		ring: "ring-destructive/25",
		bg: "bg-destructive/5",
		text: "text-destructive",
		Icon: ShieldAlert
	},
	AMBER: {
		ring: "ring-warning/25",
		bg: "bg-warning/5",
		text: "text-warning",
		Icon: TriangleAlert
	},
	GREEN: {
		ring: "ring-success/25",
		bg: "bg-success/5",
		text: "text-success",
		Icon: CircleCheck
	}
};
function LeadershipAttention() {
	const { alerts } = useDashboard();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		title: "Leadership Attention",
		subtitle: "Only what genuinely needs a decision",
		children: alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface flex items-center gap-3 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-foreground",
				children: "Nothing requires leadership attention in the selected period."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 lg:grid-cols-2",
			children: alerts.map((a) => {
				const s = STYLES[a.level];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("card-surface p-4 ring-1 sm:p-5", s.ring, s.bg),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.Icon, { className: cn("h-4 w-4", s.text) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-[11px] font-bold tracking-wide", s.text),
									children: a.level
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-bold text-foreground",
									children: ["— ", a.title]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-semibold text-foreground",
							children: a.issue
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 space-y-1.5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "w-16 shrink-0 font-semibold text-muted-foreground",
									children: "Impact"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium text-muted-foreground",
									children: a.impact
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "w-16 shrink-0 font-semibold text-muted-foreground",
									children: "Action"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-bold text-foreground",
									children: a.action
								})]
							})]
						})
					]
				}, a.id);
			})
		})
	});
}
var abs = (v) => v == null ? null : Math.abs(v);
function growthPct(current, previous) {
	if (current == null || previous == null || previous === 0) return null;
	return (current - previous) / Math.abs(previous) * 100;
}
function buildDailyInsights(rows) {
	const out = [];
	if (rows.length === 0) return out;
	const daily = buildSeries(rows, "daily").filter((d) => d.revenue != null);
	if (daily.length === 0) return out;
	const totalRevenue = daily.reduce((s, d) => s + (d.revenue ?? 0), 0);
	const totalPatients = daily.reduce((s, d) => s + d.patients, 0);
	const activeDays = daily.length;
	const avgRevenuePerDay = totalRevenue / activeDays;
	totalPatients / activeDays;
	const bestDay = [...daily].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0];
	const worstDay = [...daily].sort((a, b) => (a.revenue ?? 0) - (b.revenue ?? 0))[0];
	out.push({
		id: "daily-best",
		category: "Best Day",
		tone: "positive",
		headline: `${bestDay.label} was the strongest day at ${inr(bestDay.revenue)}`,
		body: `${num(bestDay.patients)} patients across ${bestDay.camps} camps generated ${inr(bestDay.revenue)} revenue — ${pct(growthPct(bestDay.revenue, avgRevenuePerDay))} above the daily average of ${inr(avgRevenuePerDay)}.`
	});
	if (worstDay && worstDay.revenue !== bestDay.revenue) out.push({
		id: "daily-worst",
		category: "Slowest Day",
		tone: (worstDay.revenue ?? 0) < avgRevenuePerDay * .5 ? "negative" : "neutral",
		headline: `${worstDay.label} was the weakest day at ${inr(worstDay.revenue)}`,
		body: `Only ${num(worstDay.patients)} patients across ${worstDay.camps} camps — ${pct(abs(growthPct(worstDay.revenue ?? 0, avgRevenuePerDay)))} below the daily average.`
	});
	let streak = 0;
	let maxStreak = 0;
	for (const d of daily) if ((d.revenue ?? 0) >= avgRevenuePerDay) {
		streak++;
		maxStreak = Math.max(maxStreak, streak);
	} else streak = 0;
	if (maxStreak >= 3) out.push({
		id: "daily-streak",
		category: "Momentum",
		tone: "positive",
		headline: `${maxStreak}-day streak of above-average revenue days`,
		body: `The business sustained ${maxStreak} consecutive days beating the average of ${inr(avgRevenuePerDay)}, signalling consistent operational momentum.`
	});
	if (daily.length >= 5) {
		const revenues = daily.map((d) => d.revenue ?? 0);
		const mean = revenues.reduce((s, v) => s + v, 0) / revenues.length;
		const variance = revenues.reduce((s, v) => s + (v - mean) ** 2, 0) / revenues.length;
		const cv = mean > 0 ? Math.sqrt(variance) / mean * 100 : 0;
		if (cv > 60) out.push({
			id: "daily-volatility",
			category: "Volatility",
			tone: "negative",
			headline: `Day-to-day revenue varies by ${pct(cv)} — high inconsistency`,
			body: `Revenue swings from ${inr(worstDay.revenue ?? 0)} to ${inr(bestDay.revenue ?? 0)}. Smoothing camp scheduling could stabilise daily throughput and reduce operational risk.`
		});
		else if (cv < 25 && cv > 0) out.push({
			id: "daily-consistency",
			category: "Consistency",
			tone: "positive",
			headline: `Revenue is remarkably consistent day-to-day (variation only ${pct(cv)})`,
			body: `Daily revenue stays within a tight band around ${inr(avgRevenuePerDay)}, indicating reliable camp scheduling and steady patient flow.`
		});
	}
	if (daily.length >= 7) {
		const weekdayRev = [];
		const weekendRev = [];
		for (const d of daily) {
			const day = new Date(d.ts).getDay();
			if (day === 0 || day === 6) weekendRev.push(d.revenue ?? 0);
			else weekdayRev.push(d.revenue ?? 0);
		}
		if (weekdayRev.length > 0 && weekendRev.length > 0) {
			const avgWeekday = weekdayRev.reduce((s, v) => s + v, 0) / weekdayRev.length;
			const avgWeekend = weekendRev.reduce((s, v) => s + v, 0) / weekendRev.length;
			const diff = growthPct(avgWeekend, avgWeekday);
			if (diff != null && Math.abs(diff) > 15) out.push({
				id: "daily-weekend",
				category: "Pattern",
				tone: diff > 0 ? "positive" : "neutral",
				headline: `Weekends ${diff > 0 ? "outperform" : "underperform"} weekdays by ${pct(abs(diff))}`,
				body: `Average weekend revenue is ${inr(avgWeekend)} versus ${inr(avgWeekday)} on weekdays. ${diff > 0 ? "Weekend camps are a strong revenue driver." : "Weekday camps carry the bulk of revenue."}`
			});
		}
	}
	return out.slice(0, 6);
}
function buildWeeklyInsights(rows) {
	const out = [];
	if (rows.length === 0) return out;
	const weekly = buildSeries(rows, "weekly").filter((w) => w.revenue != null);
	if (weekly.length === 0) return out;
	const totalRevenue = weekly.reduce((s, w) => s + (w.revenue ?? 0), 0);
	const totalPatients = weekly.reduce((s, w) => s + w.patients, 0);
	const activeWeeks = weekly.length;
	const avgRevenuePerWeek = totalRevenue / activeWeeks;
	totalPatients / activeWeeks;
	const bestWeek = [...weekly].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0];
	const worstWeek = [...weekly].sort((a, b) => (a.revenue ?? 0) - (b.revenue ?? 0))[0];
	out.push({
		id: "weekly-best",
		category: "Best Week",
		tone: "positive",
		headline: `${bestWeek.label} was the strongest week at ${inr(bestWeek.revenue)}`,
		body: `${num(bestWeek.patients)} patients across ${bestWeek.camps} camps — ${pct(growthPct(bestWeek.revenue, avgRevenuePerWeek))} above the weekly average of ${inr(avgRevenuePerWeek)}.`
	});
	if (worstWeek && worstWeek.revenue !== bestWeek.revenue) out.push({
		id: "weekly-worst",
		category: "Slowest Week",
		tone: (worstWeek.revenue ?? 0) < avgRevenuePerWeek * .5 ? "negative" : "neutral",
		headline: `${worstWeek.label} was the weakest week at ${inr(worstWeek.revenue)}`,
		body: `${num(worstWeek.patients)} patients across ${worstWeek.camps} camps — ${pct(abs(growthPct(worstWeek.revenue ?? 0, avgRevenuePerWeek)))} below the weekly average.`
	});
	if (weekly.length >= 3) {
		const recent = weekly.slice(-3);
		const w1 = recent[0];
		const w2 = recent[1];
		const w3 = recent[2];
		const trend1 = growthPct(w2.revenue, w1.revenue);
		const trend2 = growthPct(w3.revenue, w2.revenue);
		if (trend1 != null && trend2 != null) {
			if (trend1 > 0 && trend2 > 0) out.push({
				id: "weekly-acceleration",
				category: "Acceleration",
				tone: "positive",
				headline: `Revenue accelerated for 2 consecutive weeks (${signedPct(trend1)}, ${signedPct(trend2)})`,
				body: `Week-over-week growth is building: ${inr(w1.revenue)} → ${inr(w2.revenue)} → ${inr(w3.revenue)}. This signals a positive demand trend.`
			});
			else if (trend1 < 0 && trend2 < 0) out.push({
				id: "weekly-deceleration",
				category: "Deceleration",
				tone: "negative",
				headline: `Revenue declined for 2 consecutive weeks (${signedPct(trend1)}, ${signedPct(trend2)})`,
				body: `Week-over-week revenue is softening: ${inr(w1.revenue)} → ${inr(w2.revenue)} → ${inr(w3.revenue)}. Investigate scheduling gaps or partner attrition.`
			});
			else if (trend1 < 0 && trend2 > 0) out.push({
				id: "weekly-recovery",
				category: "Recovery",
				tone: "positive",
				headline: `Revenue rebounded ${signedPct(trend2)} after a ${signedPct(trend1)} dip`,
				body: `After dropping to ${inr(w2.revenue)}, revenue recovered to ${inr(w3.revenue)} in ${w3.label}. The rebound suggests the prior dip was temporary.`
			});
			else if (trend1 > 0 && trend2 < 0) out.push({
				id: "weekly-cooldown",
				category: "Cooldown",
				tone: "neutral",
				headline: `Revenue cooled ${signedPct(trend2)} after a ${signedPct(trend1)} surge`,
				body: `Growth peaked at ${inr(w2.revenue)} then eased to ${inr(w3.revenue)}. Monitor whether this normalises or signals a deeper slowdown.`
			});
		}
	}
	if (weekly.length >= 4) {
		const gmpValues = weekly.map((w) => w.gmPerPatient).filter((v) => v != null);
		if (gmpValues.length >= 4) {
			const firstHalf = gmpValues.slice(0, Math.ceil(gmpValues.length / 2));
			const secondHalf = gmpValues.slice(Math.ceil(gmpValues.length / 2));
			const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
			const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
			const gmpTrend = growthPct(avgSecond, avgFirst);
			if (gmpTrend != null && Math.abs(gmpTrend) > 8) out.push({
				id: "weekly-gmp-trend",
				category: "Margin Trend",
				tone: gmpTrend > 0 ? "positive" : "negative",
				headline: `GM / Patient ${gmpTrend > 0 ? "improved" : "declined"} ${pct(abs(gmpTrend))} across the period`,
				body: `Average GM / Patient moved from ${inr(avgFirst, { compact: false })} in early weeks to ${inr(avgSecond, { compact: false })} in recent weeks.`
			});
		}
	}
	if (weekly.length >= 3) {
		const sorted = [...weekly].sort((a, b) => b.patients - a.patients);
		const topWeek = sorted[0];
		const bottomWeek = sorted[sorted.length - 1];
		const patientGap = growthPct(topWeek.patients, bottomWeek.patients);
		if (patientGap != null && patientGap > 100) out.push({
			id: "weekly-volume-swing",
			category: "Volume Swing",
			tone: "neutral",
			headline: `Patient volume swings ${pct(patientGap)} between busiest and quietest weeks`,
			body: `${num(topWeek.patients)} patients in ${topWeek.label} versus ${num(bottomWeek.patients)} in ${bottomWeek.label}. Large swings require flexible staffing.`
		});
	}
	return out.slice(0, 6);
}
function buildCampTypeInsights(rows) {
	const out = [];
	if (rows.length === 0) return out;
	const campTypes = byCampType(rows).filter((t) => t.revenue != null);
	if (campTypes.length === 0) return out;
	const overall = computeMetrics(rows);
	const benchmark = overall.gmPerPatient;
	const byGmp = [...campTypes].sort((a, b) => (b.gmPerPatient ?? -1) - (a.gmPerPatient ?? -1));
	const bestMargin = byGmp[0];
	if (bestMargin.gmPerPatient != null) {
		const share = overall.patients > 0 ? bestMargin.patients / overall.patients * 100 : 0;
		out.push({
			id: "ctype-margin-leader",
			category: "Margin Leader",
			tone: "positive",
			headline: `${campTypeLabel(bestMargin.key)} camps deliver the highest GM / Patient at ${inr(bestMargin.gmPerPatient, { compact: false })}`,
			body: `${num(bestMargin.patients)} patients and ${inr(bestMargin.revenue)} revenue at ${pct(bestMargin.gmPct)} margin. They hold only ${pct(share)} of total patient volume — expanding this mix lifts blended margin.`
		});
	}
	const byRev = [...campTypes].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
	const topRev = byRev[0];
	if (topRev.revenue != null) {
		const revShare = overall.revenue ? topRev.revenue / overall.revenue * 100 : 0;
		out.push({
			id: "ctype-revenue-leader",
			category: "Revenue Leader",
			tone: "neutral",
			headline: `${campTypeLabel(topRev.key)} camps drive ${pct(revShare)} of total revenue`,
			body: `${inr(topRev.revenue)} revenue from ${num(topRev.patients)} patients across ${num(topRev.camps)} camps at ${inr(topRev.gmPerPatient, { compact: false })} GM / Patient.`
		});
	}
	const meaningfulTypes = campTypes.filter((t) => t.patients >= Math.max(50, overall.patients * .02));
	if (meaningfulTypes.length >= 2 && benchmark != null) {
		const worstMargin = [...meaningfulTypes].sort((a, b) => (a.gmPerPatient ?? Infinity) - (b.gmPerPatient ?? Infinity))[0];
		if (worstMargin.gmPerPatient != null && worstMargin.gmPerPatient < benchmark) {
			const gap = (worstMargin.gmPerPatient - benchmark) / benchmark * 100;
			out.push({
				id: "ctype-margin-laggard",
				category: "Margin Laggard",
				tone: "negative",
				headline: `${campTypeLabel(worstMargin.key)} camps run ${pct(abs(gap))} below the portfolio GM / Patient benchmark`,
				body: `${num(worstMargin.patients)} patients at ${inr(worstMargin.gmPerPatient, { compact: false })} GM / Patient versus a portfolio average of ${inr(benchmark, { compact: false })}. Renegotiating package costs here would lift blended margin.`
			});
		}
	}
	if (byGmp.length >= 2 && byRev.length >= 2) {
		const highestMargin = byGmp[0];
		const highestVolume = byRev[0];
		if (highestMargin.key !== highestVolume.key && highestMargin.patients < highestVolume.patients * .5) out.push({
			id: "ctype-mismatch",
			category: "Mix Mismatch",
			tone: "neutral",
			headline: `Highest-volume type (${campTypeLabel(highestVolume.key)}) is not the highest-margin type (${campTypeLabel(highestMargin.key)})`,
			body: `${campTypeLabel(highestVolume.key)} brings the most patients but earns ${inr(highestVolume.gmPerPatient, { compact: false })} GM / Patient, while ${campTypeLabel(highestMargin.key)} earns ${inr(highestMargin.gmPerPatient, { compact: false })}. Shifting mix toward the margin leader would improve profitability.`
		});
	}
	if (campTypes.length >= 3) {
		const sorted = [...campTypes].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
		const top = sorted[0];
		const second = sorted[1];
		const topShare = overall.revenue && top.revenue != null ? top.revenue / overall.revenue * 100 : 0;
		const secondShare = overall.revenue && second.revenue != null ? second.revenue / overall.revenue * 100 : 0;
		if (topShare > 50) out.push({
			id: "ctype-dominance",
			category: "Type Concentration",
			tone: topShare > 70 ? "negative" : "neutral",
			headline: `${campTypeLabel(top.key)} camps dominate at ${pct(topShare)} of revenue`,
			body: `${campTypeLabel(second.key)} is a distant second at ${pct(secondShare)}. ${topShare > 70 ? "Heavy reliance on a single camp type is a structural risk." : "The mix is moderately concentrated."}`
		});
	}
	if (meaningfulTypes.length >= 2) {
		const byProductivity = [...meaningfulTypes].sort((a, b) => (b.patientsPerCamp ?? 0) - (a.patientsPerCamp ?? 0));
		const mostProductive = byProductivity[0];
		const leastProductive = byProductivity[byProductivity.length - 1];
		if (mostProductive.patientsPerCamp != null && leastProductive.patientsPerCamp != null && leastProductive.patientsPerCamp > 0) {
			const productivityGap = growthPct(mostProductive.patientsPerCamp, leastProductive.patientsPerCamp);
			if (productivityGap != null && productivityGap > 50) out.push({
				id: "ctype-productivity",
				category: "Camp Productivity",
				tone: "neutral",
				headline: `${campTypeLabel(mostProductive.key)} camps draw ${num(mostProductive.patientsPerCamp, 0)} patients per camp vs ${num(leastProductive.patientsPerCamp, 0)} for ${campTypeLabel(leastProductive.key)}`,
				body: `A ${pct(productivityGap)} productivity gap. ${campTypeLabel(mostProductive.key)} camps are significantly more efficient at attracting patients per camp.`
			});
		}
	}
	return out.slice(0, 6);
}
var TABS = [
	{
		id: "daily",
		label: "Daily",
		icon: CalendarDays
	},
	{
		id: "weekly",
		label: "Weekly",
		icon: CalendarRange
	},
	{
		id: "campType",
		label: "Camp Type",
		icon: Layers
	}
];
function DeepInsights() {
	const { rows } = useDashboard();
	const [tab, setTab] = (0, import_react.useState)("daily");
	const insights = (0, import_react.useMemo)(() => {
		if (rows.length === 0) return [];
		if (tab === "daily") return buildDailyInsights(rows);
		if (tab === "weekly") return buildWeeklyInsights(rows);
		return buildCampTypeInsights(rows);
	}, [rows, tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		title: "Deeper Insights",
		subtitle: "Daily, weekly and camp-type breakdowns of performance",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "inline-flex rounded-lg border border-border bg-secondary/60 p-0.5",
			children: TABS.map((t) => {
				const Icon = t.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors", tab === t.id ? "bg-card text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" }), t.label]
				}, t.id);
			})
		}), insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "card-surface p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium text-muted-foreground",
				children: [
					"Not enough data in the selected range to generate ",
					tab === "daily" ? "daily" : tab === "weekly" ? "weekly" : "camp-type",
					" insights."
				]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
			children: insights.map((i) => {
				const Icon = i.tone === "positive" ? TrendingUp : i.tone === "negative" ? TrendingDown : Lightbulb;
				const tone = i.tone === "positive" ? "text-success" : i.tone === "negative" ? "text-destructive" : "text-muted-foreground";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card-surface flex flex-col gap-2 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-4 w-4", tone) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: i.category
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold leading-snug text-foreground",
							children: i.headline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium leading-relaxed text-muted-foreground",
							children: i.body
						})
					]
				}, i.id);
			})
		})]
	});
}
function DataUploadModal({ open, onOpenChange }) {
	const { setDataset, resetFilters } = useDashboard();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [url, setUrl] = (0, import_react.useState)("");
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const run = async (loader) => {
		setBusy(true);
		setError(null);
		setResult(null);
		try {
			const ds = await loader();
			setDataset(ds);
			resetFilters();
			setResult(ds);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not read this data source.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Update Leadership Data" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Upload a camps extract or connect a published Google Sheet. All KPIs, trends, rankings, insights and alerts recalculate instantly." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onDragOver: (e) => {
						e.preventDefault();
						setDragging(true);
					},
					onDragLeave: () => setDragging(false),
					onDrop: (e) => {
						e.preventDefault();
						setDragging(false);
						const file = e.dataTransfer.files?.[0];
						if (file) run(() => loadDatasetFromFile(file));
					},
					className: `rounded-xl border border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/40"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "mx-auto h-6 w-6 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-medium text-foreground",
							children: "Drop a file or browse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "CSV, XLSX or XLS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							type: "file",
							accept: ".csv,.xlsx,.xls",
							className: "hidden",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (file) run(() => loadDatasetFromFile(file));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "mt-3",
							disabled: busy,
							onClick: () => inputRef.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {}), " Choose file"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Or paste a published Google Sheet / CSV URL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: url,
							onChange: (e) => setUrl(e.target.value),
							placeholder: "https://docs.google.com/spreadsheets/…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy || !url.trim(),
							onClick: () => void run(() => loadDatasetFromUrl(url)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {}), " Load"]
						})]
					})]
				}),
				busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { className: "h-4 w-4 animate-spin" }), " Validating and recalculating…"]
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive ring-1 ring-destructive/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				}) : null,
				result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-success/5 p-4 ring-1 ring-success/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm font-medium text-success",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Data updated successfully"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Rows",
									value: num(result.summary.rows)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Distinct Camps",
									value: num(result.summary.distinctCamps)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Partners",
									value: num(result.summary.partners)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Camp Types",
									value: num(result.summary.campTypes)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Missing Revenue",
									value: pct(result.summary.missingRevenuePct)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Missing Gross Margin",
									value: pct(result.summary.missingMarginPct)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2 sm:col-span-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted-foreground",
										children: "Date Range"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "num text-sm font-medium text-foreground",
										children: [
											formatDate(result.summary.minTs),
											" → ",
											formatDate(result.summary.maxTs)
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "mt-4",
							onClick: () => onOpenChange(false),
							children: "View dashboard"
						})
					]
				}) : null
			]
		})
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "num text-sm font-medium text-foreground",
		children: value
	})] });
}
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const { loading, loadError, dataset, narrative, filters, range } = useDashboard();
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const presetLabel = DATE_PRESETS.find((p) => p.id === filters.preset)?.label ?? "Custom";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardHeader, { onUpdateData: () => setUploadOpen(true) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-8",
				children: loading && !dataset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { className: "h-5 w-5 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Loading camps data…"
					})]
				}) : loadError && !dataset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface mx-auto mt-12 max-w-md p-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold text-foreground",
						children: "Data could not be loaded"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: loadError
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: SNAPSHOT_ID,
					className: "space-y-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "card-surface relative overflow-hidden p-6 sm:p-9",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_70%)] blur-2xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-success)_22%,transparent),transparent_70%)] blur-2xl" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "Executive summary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-bold uppercase tracking-[0.08em] text-primary",
											children: presetLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num text-[11px] font-bold text-muted-foreground",
											children: [
												formatDate(range.from),
												" → ",
												formatDate(range.to)
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "relative mt-3 max-w-4xl text-lg font-bold leading-relaxed tracking-tight text-foreground sm:text-2xl",
									children: narrative
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPIGrid, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 xl:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevenueMomentum, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfitabilityTrend, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevenueMix, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampTypePerformance, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 xl:grid-cols-[1.5fr_1fr]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerPerformance, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerConcentration, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadershipInsights, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeepInsights, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadershipAttention, {})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataUploadModal, {
				open: uploadOpen,
				onOpenChange: setUploadOpen
			})
		]
	});
}
//#endregion
export { Index as component, routes_Bvp4lsGd_exports as t };
