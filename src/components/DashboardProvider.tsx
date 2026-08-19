import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyFilters,
  buildSeries,
  byCampType,
  byPartner,
  compare,
  computeMetrics,
  concentration,
  defaultFilters,
  resolveRange,
  suggestGranularity,
  type Filters,
  type Range,
} from "@/lib/calculations";
import { buildAlerts, buildInsights, buildNarrative } from "@/lib/insights";
import { parseCsvText, type CampRow, type Dataset } from "@/lib/dataProcessor";

interface DashboardValue {
  dataset: Dataset | null;
  loading: boolean;
  loadError: string | null;
  reload: () => void;
  setDataset: (d: Dataset) => void;
  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
  resetFilters: () => void;
  range: Range;
  rows: CampRow[];
  comparison: ReturnType<typeof compare>;
  campTypes: ReturnType<typeof byCampType>;
  partners: ReturnType<typeof byPartner>;
  conc: ReturnType<typeof concentration>;
  insights: ReturnType<typeof buildInsights>;
  alerts: ReturnType<typeof buildAlerts>;
  narrative: string;
  defaultGranularity: ReturnType<typeof suggestGranularity>;
  options: { partners: string[]; campTypes: string[]; sourceTypes: string[] };
}

const DashboardContext = createContext<DashboardValue | null>(null);

export function useDashboard(): DashboardValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch("/data/camps.csv")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        setDataset(parseCsvText(text, "camps.csv (bundled)"));
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load the dataset.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const value = useMemo<DashboardValue>(() => {
    const rowsAll = dataset?.rows ?? [];
    const minTs = dataset?.summary.minTs ?? Date.now();
    const maxTs = dataset?.summary.maxTs ?? Date.now();
    const range = resolveRange(filters, minTs, maxTs);

    const rows = applyFilters(rowsAll, filters, range);

    const current = computeMetrics(rows);
    const comparison = compare(current, current, false);

    const campTypes = byCampType(rows);
    const partners = byPartner(rows);
    const conc = concentration(partners);
    const defaultGranularity = suggestGranularity(range);
    const series = buildSeries(rows, defaultGranularity);

    const insightArgs = { comparison, campTypes, partners, conc, series };

    const options = {
      partners: [...new Set(rowsAll.map((r) => r.centerName))].sort((a, b) => a.localeCompare(b)),
      campTypes: [...new Set(rowsAll.map((r) => r.campType))].sort(),
      sourceTypes: [...new Set(rowsAll.map((r) => r.sourceType))].sort(),
    };

    return {
      dataset,
      loading,
      loadError,
      reload,
      setDataset,
      filters,
      setFilters,
      resetFilters,
      range,
      rows,
      comparison,
      campTypes,
      partners,
      conc,
      insights: buildInsights(insightArgs),
      alerts: buildAlerts(insightArgs),
      narrative: buildNarrative(comparison),
      defaultGranularity,
      options,
    };
  }, [dataset, loading, loadError, filters, reload, resetFilters]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
