import { Download, RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/FilterBar";
import { useDashboard } from "@/components/DashboardProvider";
import { formatDateTime } from "@/lib/formatting";
import { exportSnapshot } from "@/lib/export";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader({ onUpdateData }: { onUpdateData: () => void }) {
  const { dataset, reload, loading } = useDashboard();
  const [exporting, setExporting] = useState<null | "pdf" | "png">(null);

  const runExport = async (kind: "pdf" | "png") => {
    setExporting(kind);
    try {
      await exportSnapshot(kind);
    } finally {
      setExporting(null);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Leadership Command Centre</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
              Camps Performance
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Camp growth, revenue and profitability
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runExport("png")}
              disabled={exporting !== null}
            >
              <Download />
              {exporting === "png" ? "Exporting…" : "PNG"}
            </Button>
            <Button size="sm" onClick={() => runExport("pdf")} disabled={exporting !== null}>
              <Download />
              {exporting === "pdf" ? "Preparing…" : "Export Snapshot"}
            </Button>
            <Button variant="secondary" size="sm" onClick={onUpdateData}>
              <Upload />
              Update Data
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <FilterBar />
          <p className="text-xs text-muted-foreground num">
            Last updated {dataset ? formatDateTime(dataset.loadedAt) : "—"}
            {dataset ? ` · ${dataset.sourceLabel}` : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
