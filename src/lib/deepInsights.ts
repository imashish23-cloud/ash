import {
  buildSeries,
  byCampType,
  computeMetrics,
  type Granularity,
} from "./calculations";
import type { CampRow } from "./dataProcessor";
import { campTypeLabel, inr, num, pct, signedPct } from "./formatting";

export interface DeepInsight {
  id: string;
  category: string;
  tone: "positive" | "neutral" | "negative";
  headline: string;
  body: string;
}

const abs = (v: number | null | undefined) => (v == null ? null : Math.abs(v));

function growthPct(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/* ----------------------- DAILY INSIGHTS ----------------------- */

export function buildDailyInsights(rows: CampRow[]): DeepInsight[] {
  const out: DeepInsight[] = [];
  if (rows.length === 0) return out;

  const daily = buildSeries(rows, "daily").filter((d) => d.revenue != null);
  if (daily.length === 0) return out;

  const totalRevenue = daily.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalPatients = daily.reduce((s, d) => s + d.patients, 0);
  const activeDays = daily.length;
  const avgRevenuePerDay = totalRevenue / activeDays;
  const avgPatientsPerDay = totalPatients / activeDays;

  const bestDay = [...daily].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0]!;
  const worstDay = [...daily].sort((a, b) => (a.revenue ?? 0) - (b.revenue ?? 0))[0]!;

  out.push({
    id: "daily-best",
    category: "Best Day",
    tone: "positive",
    headline: `${bestDay.label} was the strongest day at ${inr(bestDay.revenue)}`,
    body: `${num(bestDay.patients)} patients across ${bestDay.camps} camps generated ${inr(bestDay.revenue)} revenue — ${pct(growthPct(bestDay.revenue, avgRevenuePerDay))} above the daily average of ${inr(avgRevenuePerDay)}.`,
  });

  if (worstDay && worstDay.revenue !== bestDay.revenue) {
    out.push({
      id: "daily-worst",
      category: "Slowest Day",
      tone: (worstDay.revenue ?? 0) < avgRevenuePerDay * 0.5 ? "negative" : "neutral",
      headline: `${worstDay.label} was the weakest day at ${inr(worstDay.revenue)}`,
      body: `Only ${num(worstDay.patients)} patients across ${worstDay.camps} camps — ${pct(abs(growthPct(worstDay.revenue ?? 0, avgRevenuePerDay)))} below the daily average.`,
    });
  }

  // Streak detection: consecutive days above average
  let streak = 0;
  let maxStreak = 0;
  for (const d of daily) {
    if ((d.revenue ?? 0) >= avgRevenuePerDay) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }
  if (maxStreak >= 3) {
    out.push({
      id: "daily-streak",
      category: "Momentum",
      tone: "positive",
      headline: `${maxStreak}-day streak of above-average revenue days`,
      body: `The business sustained ${maxStreak} consecutive days beating the average of ${inr(avgRevenuePerDay)}, signalling consistent operational momentum.`,
    });
  }

  // Variability / consistency
  if (daily.length >= 5) {
    const revenues = daily.map((d) => d.revenue ?? 0);
    const mean = revenues.reduce((s, v) => s + v, 0) / revenues.length;
    const variance = revenues.reduce((s, v) => s + (v - mean) ** 2, 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
    if (cv > 60) {
      out.push({
        id: "daily-volatility",
        category: "Volatility",
        tone: "negative",
        headline: `Day-to-day revenue varies by ${pct(cv)} — high inconsistency`,
        body: `Revenue swings from ${inr(worstDay.revenue ?? 0)} to ${inr(bestDay.revenue ?? 0)}. Smoothing camp scheduling could stabilise daily throughput and reduce operational risk.`,
      });
    } else if (cv < 25 && cv > 0) {
      out.push({
        id: "daily-consistency",
        category: "Consistency",
        tone: "positive",
        headline: `Revenue is remarkably consistent day-to-day (variation only ${pct(cv)})`,
        body: `Daily revenue stays within a tight band around ${inr(avgRevenuePerDay)}, indicating reliable camp scheduling and steady patient flow.`,
      });
    }
  }

  // Weekend vs weekday (if we have enough days)
  if (daily.length >= 7) {
    const weekdayRev: number[] = [];
    const weekendRev: number[] = [];
    for (const d of daily) {
      const day = new Date(d.ts).getDay();
      if (day === 0 || day === 6) weekendRev.push(d.revenue ?? 0);
      else weekdayRev.push(d.revenue ?? 0);
    }
    if (weekdayRev.length > 0 && weekendRev.length > 0) {
      const avgWeekday = weekdayRev.reduce((s, v) => s + v, 0) / weekdayRev.length;
      const avgWeekend = weekendRev.reduce((s, v) => s + v, 0) / weekendRev.length;
      const diff = growthPct(avgWeekend, avgWeekday);
      if (diff != null && Math.abs(diff) > 15) {
        out.push({
          id: "daily-weekend",
          category: "Pattern",
          tone: diff > 0 ? "positive" : "neutral",
          headline: `Weekends ${diff > 0 ? "outperform" : "underperform"} weekdays by ${pct(abs(diff))}`,
          body: `Average weekend revenue is ${inr(avgWeekend)} versus ${inr(avgWeekday)} on weekdays. ${diff > 0 ? "Weekend camps are a strong revenue driver." : "Weekday camps carry the bulk of revenue."}`,
        });
      }
    }
  }

  return out.slice(0, 6);
}

/* ----------------------- WEEKLY INSIGHTS ----------------------- */

export function buildWeeklyInsights(rows: CampRow[]): DeepInsight[] {
  const out: DeepInsight[] = [];
  if (rows.length === 0) return out;

  const weekly = buildSeries(rows, "weekly").filter((w) => w.revenue != null);
  if (weekly.length === 0) return out;

  const totalRevenue = weekly.reduce((s, w) => s + (w.revenue ?? 0), 0);
  const totalPatients = weekly.reduce((s, w) => s + w.patients, 0);
  const activeWeeks = weekly.length;
  const avgRevenuePerWeek = totalRevenue / activeWeeks;
  const avgPatientsPerWeek = totalPatients / activeWeeks;

  const bestWeek = [...weekly].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0]!;
  const worstWeek = [...weekly].sort((a, b) => (a.revenue ?? 0) - (b.revenue ?? 0))[0]!;

  out.push({
    id: "weekly-best",
    category: "Best Week",
    tone: "positive",
    headline: `${bestWeek.label} was the strongest week at ${inr(bestWeek.revenue)}`,
    body: `${num(bestWeek.patients)} patients across ${bestWeek.camps} camps — ${pct(growthPct(bestWeek.revenue, avgRevenuePerWeek))} above the weekly average of ${inr(avgRevenuePerWeek)}.`,
  });

  if (worstWeek && worstWeek.revenue !== bestWeek.revenue) {
    out.push({
      id: "weekly-worst",
      category: "Slowest Week",
      tone: (worstWeek.revenue ?? 0) < avgRevenuePerWeek * 0.5 ? "negative" : "neutral",
      headline: `${worstWeek.label} was the weakest week at ${inr(worstWeek.revenue)}`,
      body: `${num(worstWeek.patients)} patients across ${worstWeek.camps} camps — ${pct(abs(growthPct(worstWeek.revenue ?? 0, avgRevenuePerWeek)))} below the weekly average.`,
    });
  }

  // Week-over-week trend (last 3 weeks)
  if (weekly.length >= 3) {
    const recent = weekly.slice(-3);
    const w1 = recent[0]!;
    const w2 = recent[1]!;
    const w3 = recent[2]!;
    const trend1 = growthPct(w2.revenue, w1.revenue);
    const trend2 = growthPct(w3.revenue, w2.revenue);

    if (trend1 != null && trend2 != null) {
      if (trend1 > 0 && trend2 > 0) {
        out.push({
          id: "weekly-acceleration",
          category: "Acceleration",
          tone: "positive",
          headline: `Revenue accelerated for 2 consecutive weeks (${signedPct(trend1)}, ${signedPct(trend2)})`,
          body: `Week-over-week growth is building: ${inr(w1.revenue)} → ${inr(w2.revenue)} → ${inr(w3.revenue)}. This signals a positive demand trend.`,
        });
      } else if (trend1 < 0 && trend2 < 0) {
        out.push({
          id: "weekly-deceleration",
          category: "Deceleration",
          tone: "negative",
          headline: `Revenue declined for 2 consecutive weeks (${signedPct(trend1)}, ${signedPct(trend2)})`,
          body: `Week-over-week revenue is softening: ${inr(w1.revenue)} → ${inr(w2.revenue)} → ${inr(w3.revenue)}. Investigate scheduling gaps or partner attrition.`,
        });
      } else if (trend1 < 0 && trend2 > 0) {
        out.push({
          id: "weekly-recovery",
          category: "Recovery",
          tone: "positive",
          headline: `Revenue rebounded ${signedPct(trend2)} after a ${signedPct(trend1)} dip`,
          body: `After dropping to ${inr(w2.revenue)}, revenue recovered to ${inr(w3.revenue)} in ${w3.label}. The rebound suggests the prior dip was temporary.`,
        });
      } else if (trend1 > 0 && trend2 < 0) {
        out.push({
          id: "weekly-cooldown",
          category: "Cooldown",
          tone: "neutral",
          headline: `Revenue cooled ${signedPct(trend2)} after a ${signedPct(trend1)} surge`,
          body: `Growth peaked at ${inr(w2.revenue)} then eased to ${inr(w3.revenue)}. Monitor whether this normalises or signals a deeper slowdown.`,
        });
      }
    }
  }

  // GM/Patient trend across weeks
  if (weekly.length >= 4) {
    const gmpValues = weekly.map((w) => w.gmPerPatient).filter((v): v is number => v != null);
    if (gmpValues.length >= 4) {
      const firstHalf = gmpValues.slice(0, Math.ceil(gmpValues.length / 2));
      const secondHalf = gmpValues.slice(Math.ceil(gmpValues.length / 2));
      const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
      const gmpTrend = growthPct(avgSecond, avgFirst);
      if (gmpTrend != null && Math.abs(gmpTrend) > 8) {
        out.push({
          id: "weekly-gmp-trend",
          category: "Margin Trend",
          tone: gmpTrend > 0 ? "positive" : "negative",
          headline: `GM / Patient ${gmpTrend > 0 ? "improved" : "declined"} ${pct(abs(gmpTrend))} across the period`,
          body: `Average GM / Patient moved from ${inr(avgFirst, { compact: false })} in early weeks to ${inr(avgSecond, { compact: false })} in recent weeks.`,
        });
      }
    }
  }

  // Patient volume concentration
  if (weekly.length >= 3) {
    const sorted = [...weekly].sort((a, b) => b.patients - a.patients);
    const topWeek = sorted[0]!;
    const bottomWeek = sorted[sorted.length - 1]!;
    const patientGap = growthPct(topWeek.patients, bottomWeek.patients);
    if (patientGap != null && patientGap > 100) {
      out.push({
        id: "weekly-volume-swing",
        category: "Volume Swing",
        tone: "neutral",
        headline: `Patient volume swings ${pct(patientGap)} between busiest and quietest weeks`,
        body: `${num(topWeek.patients)} patients in ${topWeek.label} versus ${num(bottomWeek.patients)} in ${bottomWeek.label}. Large swings require flexible staffing.`,
      });
    }
  }

  return out.slice(0, 6);
}

/* ----------------------- CAMP TYPE INSIGHTS ----------------------- */

export function buildCampTypeInsights(rows: CampRow[]): DeepInsight[] {
  const out: DeepInsight[] = [];
  if (rows.length === 0) return out;

  const campTypes = byCampType(rows).filter((t) => t.revenue != null);
  if (campTypes.length === 0) return out;

  const overall = computeMetrics(rows);
  const benchmark = overall.gmPerPatient;

  // Highest GM / Patient camp type
  const byGmp = [...campTypes].sort((a, b) => (b.gmPerPatient ?? -1) - (a.gmPerPatient ?? -1));
  const bestMargin = byGmp[0]!;
  if (bestMargin.gmPerPatient != null) {
    const share = overall.patients > 0 ? (bestMargin.patients / overall.patients) * 100 : 0;
    out.push({
      id: "ctype-margin-leader",
      category: "Margin Leader",
      tone: "positive",
      headline: `${campTypeLabel(bestMargin.key)} camps deliver the highest GM / Patient at ${inr(bestMargin.gmPerPatient, { compact: false })}`,
      body: `${num(bestMargin.patients)} patients and ${inr(bestMargin.revenue)} revenue at ${pct(bestMargin.gmPct)} margin. They hold only ${pct(share)} of total patient volume — expanding this mix lifts blended margin.`,
    });
  }

  // Highest revenue camp type
  const byRev = [...campTypes].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
  const topRev = byRev[0]!;
  if (topRev.revenue != null) {
    const revShare = overall.revenue ? (topRev.revenue / overall.revenue) * 100 : 0;
    out.push({
      id: "ctype-revenue-leader",
      category: "Revenue Leader",
      tone: "neutral",
      headline: `${campTypeLabel(topRev.key)} camps drive ${pct(revShare)} of total revenue`,
      body: `${inr(topRev.revenue)} revenue from ${num(topRev.patients)} patients across ${num(topRev.camps)} camps at ${inr(topRev.gmPerPatient, { compact: false })} GM / Patient.`,
    });
  }

  // Worst margin camp type (with meaningful volume)
  const meaningfulTypes = campTypes.filter((t) => t.patients >= Math.max(50, overall.patients * 0.02));
  if (meaningfulTypes.length >= 2 && benchmark != null) {
    const worstMargin = [...meaningfulTypes].sort((a, b) => (a.gmPerPatient ?? Infinity) - (b.gmPerPatient ?? Infinity))[0]!;
    if (worstMargin.gmPerPatient != null && worstMargin.gmPerPatient < benchmark) {
      const gap = ((worstMargin.gmPerPatient - benchmark) / benchmark) * 100;
      out.push({
        id: "ctype-margin-laggard",
        category: "Margin Laggard",
        tone: "negative",
        headline: `${campTypeLabel(worstMargin.key)} camps run ${pct(abs(gap))} below the portfolio GM / Patient benchmark`,
        body: `${num(worstMargin.patients)} patients at ${inr(worstMargin.gmPerPatient, { compact: false })} GM / Patient versus a portfolio average of ${inr(benchmark, { compact: false })}. Renegotiating package costs here would lift blended margin.`,
      });
    }
  }

  // Volume vs margin mismatch
  if (byGmp.length >= 2 && byRev.length >= 2) {
    const highestMargin = byGmp[0]!;
    const highestVolume = byRev[0]!;
    if (highestMargin.key !== highestVolume.key && highestMargin.patients < highestVolume.patients * 0.5) {
      out.push({
        id: "ctype-mismatch",
        category: "Mix Mismatch",
        tone: "neutral",
        headline: `Highest-volume type (${campTypeLabel(highestVolume.key)}) is not the highest-margin type (${campTypeLabel(highestMargin.key)})`,
        body: `${campTypeLabel(highestVolume.key)} brings the most patients but earns ${inr(highestVolume.gmPerPatient, { compact: false })} GM / Patient, while ${campTypeLabel(highestMargin.key)} earns ${inr(highestMargin.gmPerPatient, { compact: false })}. Shifting mix toward the margin leader would improve profitability.`,
      });
    }
  }

  // Camp type contribution breakdown
  if (campTypes.length >= 3) {
    const sorted = [...campTypes].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
    const top = sorted[0]!;
    const second = sorted[1]!;
    const topShare = overall.revenue && top.revenue != null ? (top.revenue / overall.revenue) * 100 : 0;
    const secondShare = overall.revenue && second.revenue != null ? (second.revenue / overall.revenue) * 100 : 0;
    if (topShare > 50) {
      out.push({
        id: "ctype-dominance",
        category: "Type Concentration",
        tone: topShare > 70 ? "negative" : "neutral",
        headline: `${campTypeLabel(top.key)} camps dominate at ${pct(topShare)} of revenue`,
        body: `${campTypeLabel(second.key)} is a distant second at ${pct(secondShare)}. ${topShare > 70 ? "Heavy reliance on a single camp type is a structural risk." : "The mix is moderately concentrated."}`,
      });
    }
  }

  // Per-camp productivity comparison
  if (meaningfulTypes.length >= 2) {
    const byProductivity = [...meaningfulTypes].sort((a, b) => (b.patientsPerCamp ?? 0) - (a.patientsPerCamp ?? 0));
    const mostProductive = byProductivity[0]!;
    const leastProductive = byProductivity[byProductivity.length - 1]!;
    if (mostProductive.patientsPerCamp != null && leastProductive.patientsPerCamp != null && leastProductive.patientsPerCamp > 0) {
      const productivityGap = growthPct(mostProductive.patientsPerCamp, leastProductive.patientsPerCamp);
      if (productivityGap != null && productivityGap > 50) {
        out.push({
          id: "ctype-productivity",
          category: "Camp Productivity",
          tone: "neutral",
          headline: `${campTypeLabel(mostProductive.key)} camps draw ${num(mostProductive.patientsPerCamp, 0)} patients per camp vs ${num(leastProductive.patientsPerCamp, 0)} for ${campTypeLabel(leastProductive.key)}`,
          body: `A ${pct(productivityGap)} productivity gap. ${campTypeLabel(mostProductive.key)} camps are significantly more efficient at attracting patients per camp.`,
        });
      }
    }
  }

  return out.slice(0, 6);
}
