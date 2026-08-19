import type { ReactNode } from "react";
import type { Granularity } from "@/lib/calculations";

export const GRAN_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export interface TooltipRowSpec {
  key: string;
  label: string;
  format: (v: number) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  rows,
}: {
  active?: boolean;
  payload?: { payload?: Record<string, unknown> }[];
  label?: string | number;
  rows: TooltipRowSpec[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as Record<string, unknown> | undefined;
  if (!point) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-[var(--shadow-card-hover)]">
      <p className="text-xs font-bold text-foreground">{String(point["label"] ?? label ?? "")}</p>
      <div className="mt-1.5 space-y-1">
        {rows.map((r) => {
          const value = point[r.key];
          return (
            <div key={r.key} className="flex items-center justify-between gap-6 text-xs">
              <span className="font-semibold text-muted-foreground">{r.label}</span>
              <span className="num font-bold text-foreground">
                {typeof value === "number" ? r.format(value) : "Not available"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LatestBadge({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground num">
      {children}
    </span>
  );
}

