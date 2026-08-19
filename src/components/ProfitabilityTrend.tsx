import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section, ToggleGroup } from "@/components/ui-bits";
import { ChartTooltip, GRAN_OPTIONS, LatestBadge } from "@/components/chart-parts";
import { buildSeries, type Granularity } from "@/lib/calculations";
import { compactNum, inr, pct } from "@/lib/formatting";
import { trendSentence } from "@/lib/insights";

export function ProfitabilityTrend() {
  const { rows, defaultGranularity, comparison } = useDashboard();
  const [gran, setGran] = useState<Granularity | null>(null);
  const g = gran ?? defaultGranularity;
  const series = useMemo(() => buildSeries(rows, g), [rows, g]);

  const latest = series[series.length - 1];
  const benchmark = comparison.current.gmPerPatient;

  return (
    <Section
      title="Gross Margin / Patient"
      subtitle="Are we growing profitably?"
      action={<ToggleGroup value={g} options={GRAN_OPTIONS} onChange={setGran} />}
    >
      <div className="card-surface p-4 sm:p-5">
        {series.length === 0 ? (
          <EmptyState label="No data in the selected range" />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="eyebrow">Latest period · {latest?.label}</p>
                <p className="num mt-1 text-2xl font-bold text-foreground">
                  {inr(latest?.gmPerPatient ?? null, { compact: false })}
                </p>

              </div>
              <LatestBadge>Portfolio benchmark {inr(benchmark, { compact: false })}</LatestBadge>
            </div>

            <div className="h-[260px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={58}
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(v: number) => inr(v)}
                  />

                  {benchmark != null ? (
                    <ReferenceLine
                      y={benchmark}
                      stroke="var(--color-muted-foreground)"
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                    />
                  ) : null}
                  <Tooltip
                    content={
                      <ChartTooltip
                        rows={[
                          {
                            key: "gmPerPatient",
                            label: "GM / Patient",
                            format: (v: number) => inr(v, { compact: false }),
                          },
                          { key: "gmPct", label: "GM %", format: (v: number) => pct(v) },
                          { key: "patients", label: "Patients", format: (v: number) => compactNum(v) },
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="gmPerPatient"
                    stroke="var(--color-success)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-card)" }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-sm font-medium text-muted-foreground">{trendSentence(series, "gmPerPatient")}</p>
          </>
        )}
      </div>
    </Section>
  );
}
