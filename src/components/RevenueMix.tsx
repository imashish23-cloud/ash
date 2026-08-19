import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section, ToggleGroup } from "@/components/ui-bits";
import { bucketLabel, bucketStart, type Granularity } from "@/lib/calculations";
import { campTypeLabel, inr, pct } from "@/lib/formatting";
import { ChartTooltip, GRAN_OPTIONS } from "@/components/chart-parts";

const CORPORATE = ["COR", "CORPORATE", "CORP"];
const PHARMA = ["PHA", "PHARMA", "PHARMACY"];

function classify(campType: string): "corporate" | "pharma" | null {
  const key = campType.trim().toUpperCase();
  if (CORPORATE.includes(key)) return "corporate";
  if (PHARMA.includes(key)) return "pharma";
  return null;
}

export function RevenueMix() {
  const { rows, defaultGranularity } = useDashboard();
  const [gran, setGran] = useState<Granularity | null>(null);
  const g = gran ?? defaultGranularity;

  const { data, corTotal, phaTotal } = useMemo(() => {
    const buckets = new Map<number, { corporate: number; pharma: number }>();
    let cor = 0;
    let pha = 0;
    for (const r of rows) {
      const bucket = classify(r.campType);
      if (!bucket || r.revenue == null) continue;
      const key = bucketStart(r.ts, g);
      const entry = buckets.get(key) ?? { corporate: 0, pharma: 0 };
      entry[bucket] += r.revenue;
      buckets.set(key, entry);
      if (bucket === "corporate") cor += r.revenue;
      else pha += r.revenue;
    }
    return {
      data: [...buckets.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([ts, v]) => ({ ts, label: bucketLabel(ts, g), ...v })),
      corTotal: cor,
      phaTotal: pha,
    };
  }, [rows, g]);

  const total = corTotal + phaTotal;

  return (
    <Section
      title="Revenue Mix"
      subtitle={`${campTypeLabel("COR")} vs ${campTypeLabel("PHA")} revenue split`}
      action={<ToggleGroup value={g} options={GRAN_OPTIONS} onChange={setGran} />}
    >
      <div className="card-surface p-4 sm:p-5">
        {data.length === 0 ? (
          <EmptyState label="No corporate or pharma revenue in the selected range" />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3">
              <MixStat label={campTypeLabel("COR")} value={corTotal} share={total ? (corTotal / total) * 100 : null} dot="bg-primary" />
              <MixStat label={campTypeLabel("PHA")} value={phaTotal} share={total ? (phaTotal / total) * 100 : null} dot="bg-success" />
            </div>

            <div className="h-[260px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--color-muted-foreground)" }}
                    minTickGap={16}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fontSize: 12, fontWeight: 600, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(v: number) => inr(v)}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)", opacity: 0.5 }}
                    content={
                      <ChartTooltip
                        rows={[
                          { key: "corporate", label: campTypeLabel("COR"), format: (v) => inr(v) },
                          { key: "pharma", label: campTypeLabel("PHA"), format: (v) => inr(v) },
                        ]}
                      />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                    formatter={(value) => (value === "corporate" ? campTypeLabel("COR") : campTypeLabel("PHA"))}
                  />
                  <Bar dataKey="corporate" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="pharma" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

function MixStat({
  label,
  value,
  share,
  dot,
}: {
  label: string;
  value: number;
  share: number | null;
  dot: string;
}) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-2">
        <span className={`inline-block size-2 rounded-full ${dot}`} />
        {label}
      </p>
      <p className="num mt-1 text-2xl font-bold text-foreground">{inr(value)}</p>
      <p className="text-xs font-medium text-muted-foreground">{pct(share)} of mix</p>
    </div>
  );
}
