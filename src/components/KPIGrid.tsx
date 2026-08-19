import { useDashboard } from "@/components/DashboardProvider";
import { compactNum, inr, num, pct } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface Kpi {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
}

export function KPIGrid() {
  const { comparison } = useDashboard();
  const m = comparison.current;

  const hero: Kpi[] = [
    {
      label: "Gross Margin / Patient",
      value: inr(m.gmPerPatient, { compact: false }),
      note: "Primary unit economics KPI",
      emphasis: true,
    },
    { label: "Revenue", value: inr(m.revenue), note: `${num(m.camps)} camps in scope` },
    { label: "Gross Margin", value: inr(m.grossMargin), note: `${pct(m.gmPct)} of revenue` },
  ];

  const secondary: Kpi[] = [
    { label: "Total Camps", value: num(m.camps) },
    { label: "Patients", value: compactNum(m.patients) },
    { label: "Revenue / Camp", value: inr(m.revenuePerCamp) },
  ];

  const accents = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)"];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {hero.map((k, idx) => (
          <div
            key={k.label}
            className={cn(
              "card-surface group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6",
            )}
            style={{
              backgroundImage: `linear-gradient(150deg, color-mix(in oklab, ${accents[idx]} 12%, var(--color-card)), color-mix(in oklab, var(--color-card) 70%, transparent))`,
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: accents[idx] }}
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {k.label}
            </p>
            <p
              className={cn(
                "num mt-3 text-[34px] font-bold leading-none tracking-tight sm:text-[40px]",
                k.emphasis ? "text-primary" : "text-foreground",
              )}
            >
              {k.value}
            </p>
            {k.note ? <p className="mt-2 text-xs font-medium text-muted-foreground">{k.note}</p> : null}

          </div>
        ))}
      </div>

      <div className="card-surface grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {secondary.map((k) => (
          <div key={k.label} className="p-4 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground">{k.label}</p>
            <p className="num mt-2 text-xl font-bold text-foreground sm:text-2xl">{k.value}</p>

          </div>
        ))}
      </div>
    </div>
  );
}

