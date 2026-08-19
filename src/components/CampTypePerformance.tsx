import { useMemo, useState } from "react";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { campTypeLabel, compactNum, inr, pct } from "@/lib/formatting";
import { cn } from "@/lib/utils";

export function CampTypePerformance() {
  const { campTypes, comparison, filters, setFilters } = useDashboard();
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(
    () => [...campTypes].sort((a, b) => (b.gmPerPatient ?? -1) - (a.gmPerPatient ?? -1)),
    [campTypes],
  );
  const visible = showAll ? ranked : ranked.slice(0, 8);
  const max = Math.max(...ranked.map((t) => t.gmPerPatient ?? 0), 1);
  const benchmark = comparison.current.gmPerPatient ?? 0;

  const toggle = (key: string) =>
    setFilters((f) => ({
      ...f,
      campTypes: f.campTypes.includes(key) ? f.campTypes.filter((c) => c !== key) : [key],
    }));

  return (
    <Section
      title="Where Profitability Comes From"
      subtitle="Camp Type Performance · ranked by GM / Patient"
      action={
        ranked.length > 8 ? (
          <Button variant="ghost" size="sm" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show top 8" : "View all"}
          </Button>
        ) : null
      }
    >
      <div className="card-surface divide-y divide-border">
        {visible.length === 0 ? (
          <EmptyState label="No camp types in the selected range" />
        ) : (
          visible.map((t) => {
            const gmp = t.gmPerPatient;
            const tone =
              gmp == null
                ? "bg-muted-foreground/30"
                : gmp >= benchmark * 1.05
                  ? "bg-success"
                  : gmp >= benchmark * 0.9
                    ? "bg-warning"
                    : "bg-destructive";
            const active = filters.campTypes.includes(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => toggle(t.key)}
                className={cn(
                  "group grid w-full grid-cols-2 gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-secondary/60 sm:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] sm:items-center sm:p-5",
                  active && "bg-secondary/80",
                )}
              >
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-semibold text-foreground">{campTypeLabel(t.key)}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", tone)}
                      style={{ width: `${Math.max(3, ((gmp ?? 0) / max) * 100)}%` }}
                    />
                  </div>
                </div>
                <Metric label="Patients" value={compactNum(t.patients)} />
                <Metric label="Revenue" value={inr(t.revenue)} />
                <Metric label="GM / Patient" value={inr(gmp, { compact: false })} strong />
                <Metric label="GM %" value={pct(t.gmPct)} />
              </button>
            );
          })
        )}
      </div>
    </Section>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="sm:text-right">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className={cn("num text-sm font-semibold text-foreground", strong && "font-bold")}>{value}</p>
    </div>
  );
}

