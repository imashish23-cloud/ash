import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Layers, TrendingDown, TrendingUp, Lightbulb } from "lucide-react";
import { useDashboard } from "@/components/DashboardProvider";
import { Section } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import {
  buildCampTypeInsights,
  buildDailyInsights,
  buildWeeklyInsights,
  type DeepInsight,
} from "@/lib/deepInsights";

type Tab = "daily" | "weekly" | "campType";

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "daily", label: "Daily", icon: CalendarDays },
  { id: "weekly", label: "Weekly", icon: CalendarRange },
  { id: "campType", label: "Camp Type", icon: Layers },
];

export function DeepInsights() {
  const { rows } = useDashboard();
  const [tab, setTab] = useState<Tab>("daily");

  const insights = useMemo<DeepInsight[]>(() => {
    if (rows.length === 0) return [];
    if (tab === "daily") return buildDailyInsights(rows);
    if (tab === "weekly") return buildWeeklyInsights(rows);
    return buildCampTypeInsights(rows);
  }, [rows, tab]);

  return (
    <Section
      title="Deeper Insights"
      subtitle="Daily, weekly and camp-type breakdowns of performance"
    >
      <div className="inline-flex rounded-lg border border-border bg-secondary/60 p-0.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {insights.length === 0 ? (
        <div className="card-surface p-5">
          <p className="text-sm font-medium text-muted-foreground">
            Not enough data in the selected range to generate {tab === "daily" ? "daily" : tab === "weekly" ? "weekly" : "camp-type"} insights.
          </p>
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
