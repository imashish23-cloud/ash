import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export function LeadershipInsights() {
  const { insights } = useDashboard();

  return (
    <Section title="Insights" subtitle="Generated from the selected data">
      {insights.length === 0 ? (
        <div className="card-surface p-5">
          <EmptyState label="No insights available for this selection" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((i) => {
            const Icon =
              i.tone === "positive" ? TrendingUp : i.tone === "negative" ? TrendingDown : Lightbulb;
            const tone =
              i.tone === "positive"
                ? "text-success"
                : i.tone === "negative"
                  ? "text-destructive"
                  : "text-muted-foreground";
            return (
              <article
                key={i.id}
                className="card-surface flex flex-col gap-2 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] sm:p-5"
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", tone)} />
                  <span className="eyebrow">{i.category}</span>
                </div>
                <h3 className="text-sm font-bold leading-snug text-foreground">{i.headline}</h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">{i.body}</p>

              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
