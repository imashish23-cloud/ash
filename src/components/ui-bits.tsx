import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NA, direction, pct } from "@/lib/formatting";

export function Delta({
  value,
  suffix,
  invert = false,
  className,
}: {
  value: number | null | undefined;
  suffix?: string;
  invert?: boolean;
  className?: string;
}) {
  if (value == null) {
    return <span className={cn("text-xs text-muted-foreground", className)}>No prior period</span>;
  }
  const dir = direction(value, 0.05);
  const good = invert ? dir === "down" : dir === "up";
  const tone =
    dir === "flat" ? "text-muted-foreground" : good ? "text-success" : "text-destructive";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium num", tone, className)}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {pct(Math.abs(value))}
      {suffix ? <span className="font-normal text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm font-medium text-muted-foreground">{subtitle}</p> : null}

        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card-surface", className)}>{children}</div>;
}

export function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-secondary/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-card text-foreground shadow-[var(--shadow-card)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ label = NA }: { label?: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm font-medium text-muted-foreground">{label}</div>
  );

}
