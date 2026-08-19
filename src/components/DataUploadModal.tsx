import { useRef, useState } from "react";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, FileSpreadsheet, Link2, Loader as Loader2, CloudUpload as UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/components/DashboardProvider";
import {
  loadDatasetFromFile,
  loadDatasetFromUrl,
  type Dataset,
} from "@/lib/dataProcessor";
import { formatDate, num, pct } from "@/lib/formatting";

export function DataUploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { setDataset, resetFilters } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Dataset | null>(null);
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (loader: () => Promise<Dataset>) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const ds = await loader();
      setDataset(ds);
      resetFilters();
      setResult(ds);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not read this data source.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Update Leadership Data</DialogTitle>
          <DialogDescription>
            Upload a camps extract or connect a published Google Sheet. All KPIs, trends, rankings,
            insights and alerts recalculate instantly.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void run(() => loadDatasetFromFile(file));
          }}
          className={`rounded-xl border border-dashed p-6 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
          }`}
        >
          <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">Drop a file or browse</p>
          <p className="mt-1 text-xs text-muted-foreground">CSV, XLSX or XLS</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void run(() => loadDatasetFromFile(file));
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet /> Choose file
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Or paste a published Google Sheet / CSV URL</p>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/…"
            />
            <Button disabled={busy || !url.trim()} onClick={() => void run(() => loadDatasetFromUrl(url))}>
              <Link2 /> Load
            </Button>
          </div>
        </div>

        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Validating and recalculating…
          </p>
        ) : null}

        {error ? (
          <div className="flex gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive ring-1 ring-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-lg bg-success/5 p-4 ring-1 ring-success/20">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> Data updated successfully
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Row label="Rows" value={num(result.summary.rows)} />
              <Row label="Distinct Camps" value={num(result.summary.distinctCamps)} />
              <Row label="Partners" value={num(result.summary.partners)} />
              <Row label="Camp Types" value={num(result.summary.campTypes)} />
              <Row label="Missing Revenue" value={pct(result.summary.missingRevenuePct)} />
              <Row label="Missing Gross Margin" value={pct(result.summary.missingMarginPct)} />
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-muted-foreground">Date Range</dt>
                <dd className="num text-sm font-medium text-foreground">
                  {formatDate(result.summary.minTs)} → {formatDate(result.summary.maxTs)}
                </dd>
              </div>
            </dl>
            <Button size="sm" className="mt-4" onClick={() => onOpenChange(false)}>
              View dashboard
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="num text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
