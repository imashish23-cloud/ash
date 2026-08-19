import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section, ToggleGroup } from "@/components/ui-bits";
import { buildSeries, type Granularity } from "@/lib/calculations";
import { compactNum, inr } from "@/lib/formatting";
import { ChartTooltip, GRAN_OPTIONS, LatestBadge } from "@/components/chart-parts";

export function RevenueMomentum() {
  const { rows, defaultGranularity } = useDashboard();
  const [gran, setGran] = useState<Granularity | null>(null);
  const g = gran ?? defaultGranularity;
  const series = useMemo(() => buildSeries(rows, g), [rows, g]);

  const latest = series[series.length - 1];
  const previousDay = series[series.length - 2];
  const highlighted = g === "daily" && previousDay ? previousDay : latest;

  return (
    <Section
      title="Revenue Momentum"
      subtitle="How fast is the Camps business growing?"
      action={<ToggleGroup value={g} options={GRAN_OPTIONS} onChange={setGran} />}
    >
      <div className="card-surface p-4 sm:p-5">
        {series.length === 0 ? (
          <EmptyState label="No data in the selected range" />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="eyebrow">
                  {g === "daily" && previousDay ? "Previous day" : "Latest period"} · {highlighted?.label}
                </p>
                <p className="num mt-1 text-2xl font-bold text-foreground">
                  {inr(highlighted?.revenue ?? null)}
                </p>
              </div>
              <LatestBadge>
                {compactNum(highlighted?.patients ?? null)} patients · {highlighted?.camps ?? 0} camps
              </LatestBadge>
            </div>

            <div className="h-[260px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
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
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(v: number) => inr(v)}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip
                        rows={[
                          { key: "revenue", label: "Revenue", format: (v: number) => inr(v) },
                          { key: "patients", label: "Patients", format: (v: number) => compactNum(v) },
                          { key: "camps", label: "Camps", format: (v: number) => compactNum(v) },
                        ]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#revFill)"
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-card)" }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {g === "daily" && previousDay
                ? `Previous day revenue was ${inr(highlighted?.revenue ?? null)} across ${compactNum(highlighted?.patients ?? null)} patients.`
                : `Latest ${g === "daily" ? "day" : g === "weekly" ? "week" : "month"} revenue is ${inr(
                    latest?.revenue ?? null,
                  )} across ${compactNum(latest?.patients ?? null)} patients.`}
            </p>
          </>
        )}
      </div>
    </Section>
  );
}
