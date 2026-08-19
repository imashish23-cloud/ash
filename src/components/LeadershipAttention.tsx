import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useDashboard } from "@/components/DashboardProvider";
import { Section } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

const STYLES = {
  RED: { ring: "ring-destructive/25", bg: "bg-destructive/5", text: "text-destructive", Icon: ShieldAlert },
  AMBER: { ring: "ring-warning/25", bg: "bg-warning/5", text: "text-warning", Icon: AlertTriangle },
  GREEN: { ring: "ring-success/25", bg: "bg-success/5", text: "text-success", Icon: CheckCircle2 },
} as const;

export function LeadershipAttention() {
  const { alerts } = useDashboard();

  return (
    <Section title="Leadership Attention" subtitle="Only what genuinely needs a decision">
      {alerts.length === 0 ? (
        <div className="card-surface flex items-center gap-3 p-5">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm font-semibold text-foreground">
            Nothing requires leadership attention in the selected period.
          </p>

        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {alerts.map((a) => {
            const s = STYLES[a.level];
            return (
              <article key={a.id} className={cn("card-surface p-4 ring-1 sm:p-5", s.ring, s.bg)}>
                <div className="flex items-center gap-2">
                  <s.Icon className={cn("h-4 w-4", s.text)} />
                  <span className={cn("text-[11px] font-bold tracking-wide", s.text)}>
                    {a.level}
                  </span>
                  <span className="text-sm font-bold text-foreground">— {a.title}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{a.issue}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-semibold text-muted-foreground">Impact</dt>
                    <dd className="font-medium text-muted-foreground">{a.impact}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 font-semibold text-muted-foreground">Action</dt>
                    <dd className="font-bold text-foreground">{a.action}</dd>
                  </div>
                </dl>

              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
