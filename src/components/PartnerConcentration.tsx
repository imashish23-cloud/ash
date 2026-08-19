import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section } from "@/components/ui-bits";
import { inr, num, pct } from "@/lib/formatting";

export function PartnerConcentration() {
  const { conc } = useDashboard();

  if (conc.top5Pct == null) {
    return (
      <Section title="Revenue Concentration" subtitle="How dependent are we on a few partners?">
        <div className="card-surface p-5">
          <EmptyState label="Not available for the selected range" />
        </div>
      </Section>
    );
  }

  const next5 = (conc.top10Pct ?? 0) - conc.top5Pct;

  return (
    <Section title="Revenue Concentration" subtitle="How dependent are we on a few partners?">
      <div className="card-surface p-4 sm:p-5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${conc.top5Pct}%` }} />
          <div className="h-full bg-primary/50 transition-all duration-500" style={{ width: `${next5}%` }} />
          <div className="h-full bg-border transition-all duration-500" style={{ width: `${conc.othersPct}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <Stat label="Top 5 partners" value={pct(conc.top5Pct)} sub={inr(conc.top5Revenue)} dot="bg-primary" />
          <Stat label="Top 10 partners" value={pct(conc.top10Pct)} sub={inr(conc.top10Revenue)} dot="bg-primary/50" />
          <Stat
            label="All others"
            value={pct(conc.othersPct)}
            sub={`${num(Math.max(0, conc.totalPartners - 10))} partners`}
            dot="bg-border"
          />
        </div>
      </div>
    </Section>
  );
}

function Stat({ label, value, sub, dot }: { label: string; value: string; sub: string; dot: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </p>
      <p className="num mt-1 text-xl font-bold text-foreground">{value}</p>
      <p className="num text-xs font-medium text-muted-foreground">{sub}</p>
    </div>

  );
}
