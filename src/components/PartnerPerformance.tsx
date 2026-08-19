import { useMemo, useState } from "react";
import { useDashboard } from "@/components/DashboardProvider";
import { EmptyState, Section } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { ToggleGroup } from "@/components/ui-bits";
import { compactNum, inr, num } from "@/lib/formatting";
import { cn } from "@/lib/utils";

type Tab = "revenue" | "profit";

export function PartnerPerformance() {
  const { partners, comparison, filters, setFilters } = useDashboard();
  const [tab, setTab] = useState<Tab>("revenue");
  const [expanded, setExpanded] = useState(false);
  const benchmark = comparison.current.gmPerPatient;

  const ranked = useMemo(() => {
    const list = [...partners];
    if (tab === "revenue") return list.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
    const floor = Math.max(100, comparison.current.patients * 0.005);
    return list
      .filter((p) => p.gmPerPatient != null && p.patients >= floor)
      .sort((a, b) => b.gmPerPatient! - a.gmPerPatient!);
  }, [partners, tab, comparison.current.patients]);

  const visible = expanded ? ranked.slice(0, 15) : ranked.slice(0, 5);

  const toggle = (key: string) =>
    setFilters((f) => ({
      ...f,
      partners: f.partners.includes(key) ? f.partners.filter((p) => p !== key) : [key],
    }));

  return (
    <Section
      title="Partner Performance"
      subtitle="Who is driving revenue and who is driving margin?"
      action={
        <ToggleGroup<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "revenue", label: "Revenue Leaders" },
            { value: "profit", label: "Profitability Leaders" },
          ]}
        />
      }
    >
      <div className="card-surface divide-y divide-border">
        {visible.length === 0 ? (
          <EmptyState label="No partners in the selected range" />
        ) : (
          visible.map((p, i) => {
            const gap =
              benchmark && p.gmPerPatient != null
                ? ((p.gmPerPatient - benchmark) / benchmark) * 100
                : null;
            const tone =
              gap == null
                ? "text-muted-foreground"
                : gap >= 5
                  ? "text-success"
                  : gap >= -10
                    ? "text-warning"
                    : "text-destructive";
            const active = filters.partners.includes(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggle(p.key)}
                className={cn(
                  "grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 p-4 text-left transition-colors hover:bg-secondary/60 sm:grid-cols-[auto_1.8fr_repeat(4,minmax(0,1fr))] sm:p-5",
                  active && "bg-secondary/80",
                )}
              >
                <span className="num text-sm font-semibold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-1 truncate text-sm font-semibold text-foreground">
                  {p.key}
                </span>

                <Cell label="Camps" value={num(p.camps)} />
                <Cell label="Patients" value={compactNum(p.patients)} />
                <Cell label="Revenue" value={inr(p.revenue)} />
                <div className="sm:text-right">
                  <p className="text-[11px] font-semibold text-muted-foreground">GM / Patient</p>
                  <p className={cn("num text-sm font-bold", tone)}>
                    {inr(p.gmPerPatient, { compact: false })}
                  </p>
                </div>

              </button>
            );
          })
        )}
      </div>
      {ranked.length > 5 ? (
        <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show top 5" : "View more partners"}
        </Button>
      ) : null}
    </Section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:text-right">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="num text-sm font-semibold text-foreground">{value}</p>
    </div>

  );
}
