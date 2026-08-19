import {
  type Comparison,
  type Concentration,
  type GroupMetrics,
  type Metrics,
  type SeriesPoint,
} from "./calculations";
import { campTypeLabel, inr, num, pct, signedPct } from "./formatting";

export interface Insight {
  id: string;
  category: string;
  tone: "positive" | "neutral" | "negative";
  headline: string;
  body: string;
}

export interface Alert {
  id: string;
  level: "RED" | "AMBER" | "GREEN";
  title: string;
  issue: string;
  impact: string;
  action: string;
}

const abs = (v: number | null | undefined) => (v == null ? null : Math.abs(v));

export function buildNarrative(c: Comparison): string {
  if (!c.hasPrevious) {
    const m = c.current;
    return `The selected period covers ${num(m.camps)} camps, ${num(m.patients)} patients and ${inr(m.revenue)} revenue at ${pct(m.gmPct)} gross margin.`;
  }
  const rev = c.delta.revenue;
  const gm = c.delta.grossMargin;
  const gmp = c.delta.gmPerPatient;
  const pat = c.delta.patients;

  if (rev != null && gm != null && gmp != null) {
    if (rev > 0 && gmp > 0) {
      return `Revenue and patient volumes are accelerating (revenue ${signedPct(rev)}, patients ${signedPct(pat)}) while profitability per patient improves ${signedPct(gmp)}.`;
    }
    if (rev > 0 && gm > 0 && gmp <= 0) {
      return `Revenue is growing ${signedPct(rev)} faster than gross margin ${signedPct(gm)}, creating pressure on unit economics — GM / Patient is ${signedPct(gmp)}.`;
    }
    if (rev <= 0 && gmp > 0) {
      return `Volume is declining (patients ${signedPct(pat)}), but GM / Patient is improving ${signedPct(gmp)} — the mix is shifting toward higher-value camps.`;
    }
    return `Revenue ${signedPct(rev)} and gross margin ${signedPct(gm)} are both under pressure, with GM / Patient at ${signedPct(gmp)}.`;
  }
  return `Revenue ${signedPct(rev)} versus the previous period across ${num(c.current.camps)} camps.`;
}

export function trendSentence(series: SeriesPoint[], metric: "revenue" | "gmPerPatient"): string {
  const valid = series.filter((p) => p[metric] != null);
  if (valid.length < 2) return "Not enough history in the selected range to describe a trend.";
  const first = valid[valid.length - 2]!;
  const last = valid[valid.length - 1]!;
  const a = first[metric] as number;
  const b = last[metric] as number;
  const change = a === 0 ? null : ((b - a) / Math.abs(a)) * 100;
  const patDelta =
    first.patients === 0 ? null : ((last.patients - first.patients) / first.patients) * 100;

  if (metric === "revenue") {
    return `Revenue moved from ${inr(a)} to ${inr(b)} (${signedPct(change)}) versus ${first.label}.`;
  }
  const dir = (change ?? 0) >= 0 ? "improved" : "declined";
  const volume =
    patDelta == null
      ? ""
      : (patDelta > 0 ? ` despite ${pct(abs(patDelta))} higher patient volumes` : ` alongside ${pct(abs(patDelta))} lower patient volumes`);
  return `GM / Patient ${dir} ${pct(abs(change))} in ${last.label} versus ${first.label}${volume}.`;
}

export function buildInsights(args: {
  comparison: Comparison;
  campTypes: GroupMetrics[];
  partners: GroupMetrics[];
  conc: Concentration;
  series: SeriesPoint[];
}): Insight[] {
  const { comparison: c, campTypes, partners, conc } = args;
  const out: Insight[] = [];
  const m: Metrics = c.current;

  if (c.delta.revenue != null) {
    const up = c.delta.revenue > 0;
    const driver =
      (c.delta.patients ?? 0) > (c.delta.aspPerPatient ?? 0) ? "patient volume growth" : "higher realisation per patient";
    out.push({
      id: "growth",
      category: "Growth",
      tone: up ? "positive" : "negative",
      headline: `Revenue ${up ? "increased" : "declined"} ${pct(abs(c.delta.revenue))} versus the previous period`,
      body: `${inr(m.revenue)} across ${num(m.camps)} camps, primarily driven by ${driver} (patients ${signedPct(c.delta.patients)}, ASP ${signedPct(c.delta.aspPerPatient)}).`,
    });
  }

  if (c.delta.gmPerPatient != null) {
    const up = c.delta.gmPerPatient > 0;
    out.push({
      id: "profitability",
      category: "Profitability",
      tone: up ? "positive" : "negative",
      headline: `GM / Patient ${up ? "improved" : "declined"} ${pct(abs(c.delta.gmPerPatient))} to ${inr(m.gmPerPatient, { compact: false })}`,
      body: up
        ? `Gross margin is now ${pct(m.gmPct)} of revenue, indicating healthier unit economics alongside ${signedPct(c.delta.revenue)} revenue.`
        : `Gross margin is ${pct(m.gmPct)} of revenue — margin pressure is building despite ${signedPct(c.delta.revenue)} revenue movement.`,
    });
  }

  out.push({
    id: "scale",
    category: "Scale",
    tone: "neutral",
    headline: `${num(m.camps)} camps delivered ${inr(m.revenue)} revenue and ${inr(m.grossMargin)} gross margin`,
    body: `Average camp brings ${num(m.patientsPerCamp, 0)} patients, ${inr(m.revenuePerCamp)} revenue and ${inr(m.gmPerCamp)} gross margin at ${pct(m.gmPct)} margin.`,
  });

  if (m.gmPerPatient != null) {
    out.push({
      id: "unit-economics",
      category: "Unit Economics",
      tone: "positive",
      headline: `Portfolio earns ${inr(m.gmPerPatient, { compact: false })} gross margin per patient`,
      body: `Every patient converts into ${pct(m.gmPct)} gross margin, with ${inr(m.gmPerCamp)} margin per camp.`,
    });
  }

  const benchmark = m.gmPerPatient;
  if (benchmark != null) {
    const bigPartners = partners
      .filter((p) => p.patients >= Math.max(200, m.patients * 0.02) && p.gmPerPatient != null)
      .sort((a, b) => (a.gmPerPatient! - benchmark) - (b.gmPerPatient! - benchmark));
    const laggard = bigPartners[0];
    if (laggard && laggard.gmPerPatient! < benchmark) {
      const gap = ((laggard.gmPerPatient! - benchmark) / benchmark) * 100;
      out.push({
        id: "partner-gap",
        category: "Partner Opportunity",
        tone: "negative",
        headline: `${laggard.key} runs ${pct(abs(gap))} below the portfolio GM / Patient benchmark`,
        body: `${num(laggard.patients)} patients and ${inr(laggard.revenue)} revenue at ${inr(laggard.gmPerPatient, { compact: false })} GM / Patient versus a portfolio benchmark of ${inr(benchmark, { compact: false })}.`,
      });
    }
  }

  if (c.delta.patientsPerCamp != null) {
    const up = c.delta.patientsPerCamp > 0;
    out.push({
      id: "productivity",
      category: "Camp Productivity",
      tone: up ? "positive" : "neutral",
      headline: `Patients per camp ${up ? "increased" : "decreased"} ${pct(abs(c.delta.patientsPerCamp))} to ${num(m.patientsPerCamp)}`,
      body: `Each camp now generates ${inr(m.revenuePerCamp)} revenue and ${inr(m.gmPerCamp)} gross margin on average.`,
    });
  }

  if (conc.top10Pct != null) {
    out.push({
      id: "concentration",
      category: "Concentration",
      tone: conc.top10Pct > 70 ? "negative" : "neutral",
      headline: `Top 10 partners contribute ${pct(conc.top10Pct)} of total revenue`,
      body: `${num(conc.totalPartners)} partners are active in this period; the top 5 alone account for ${pct(conc.top5Pct)}.`,
    });
  }

  const best = [...campTypes].filter((t) => t.gmPerPatient != null).sort((a, b) => b.gmPerPatient! - a.gmPerPatient!)[0];
  if (best && m.patients > 0 && best.patients / m.patients < 0.35) {
    out.push({
      id: "mix",
      category: "Mix Opportunity",
      tone: "positive",
      headline: `${campTypeLabel(best.key)} camps deliver the highest GM / Patient at ${inr(best.gmPerPatient, { compact: false })}`,
      body: `They currently represent only ${pct((best.patients / m.patients) * 100)} of patient volume — expanding this mix lifts blended margin.`,
    });
  }

  return out.slice(0, 6);
}

export function buildAlerts(args: {
  comparison: Comparison;
  campTypes: GroupMetrics[];
  partners: GroupMetrics[];
  conc: Concentration;
  series: SeriesPoint[];
}): Alert[] {
  const { comparison: c, campTypes, partners, conc, series } = args;
  const out: Alert[] = [];
  const benchmark = c.current.gmPerPatient;

  const gmpSeries = series.filter((p) => p.gmPerPatient != null).slice(-4);
  if (gmpSeries.length >= 4) {
    let declines = 0;
    for (let i = gmpSeries.length - 1; i > 0; i--) {
      if (gmpSeries[i]!.gmPerPatient! < gmpSeries[i - 1]!.gmPerPatient!) declines++;
      else break;
    }
    if (declines >= 3) {
      out.push({
        id: "margin-pressure",
        level: "RED",
        title: "Margin Pressure",
        issue: `GM / Patient declined for ${declines} consecutive periods, now ${inr(gmpSeries[gmpSeries.length - 1]!.gmPerPatient, { compact: false })}.`,
        impact: "Sustained erosion of unit economics compounds directly into gross margin as volumes scale.",
        action: "Review pricing and package cost for the fastest-growing camps before adding volume.",
      });
    }
  }

  if (benchmark != null) {
    const risky = partners
      .filter((p) => p.gmPerPatient != null && p.patients >= Math.max(200, c.current.patients * 0.03))
      .map((p) => ({ p, gap: ((p.gmPerPatient! - benchmark) / benchmark) * 100 }))
      .filter((x) => x.gap < -10)
      .sort((a, b) => a.gap - b.gap)[0];
    if (risky) {
      out.push({
        id: "partner-economics",
        level: "AMBER",
        title: "Partner Economics",
        issue: `${risky.p.key} delivers ${num(risky.p.patients)} patients at ${pct(abs(risky.gap))} below the portfolio GM / Patient benchmark.`,
        impact: `High volume at low margin dilutes blended profitability across ${inr(risky.p.revenue)} of revenue.`,
        action: "Renegotiate package pricing or shift this partner to a higher-margin package mix.",
      });
    }
  }

  if (conc.top5Pct != null && conc.top5Pct > 40) {
    out.push({
      id: "concentration-risk",
      level: "AMBER",
      title: "Concentration Risk",
      issue: `Top 5 partners account for ${pct(conc.top5Pct)} of revenue.`,
      impact: "Losing a single anchor partner would materially dent quarterly revenue and margin.",
      action: "Prioritise pipeline conversion in the mid-tier partner base to broaden the revenue base.",
    });
  }

  const highMargin = [...campTypes]
    .filter((t) => t.gmPerPatient != null && benchmark != null && t.gmPerPatient! > benchmark)
    .sort((a, b) => b.gmPerPatient! - a.gmPerPatient!)[0];
  if (highMargin && c.current.patients > 0 && highMargin.patients / c.current.patients < 0.3) {
    out.push({
      id: "growth-opportunity",
      level: "GREEN",
      title: "Growth Opportunity",
      issue: `${campTypeLabel(highMargin.key)} camps earn ${inr(highMargin.gmPerPatient, { compact: false })} GM / Patient but hold only ${pct((highMargin.patients / c.current.patients) * 100)} of volume.`,
      impact: `Every point of mix shift toward this type lifts portfolio GM / Patient above ${inr(benchmark, { compact: false })}.`,
      action: "Target the top 10 partners with this camp type in the next quarter's plan.",
    });
  }

  return out;
}
