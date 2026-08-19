import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/components/DashboardProvider";
import { DashboardHeader } from "@/components/DashboardHeader";
import { KPIGrid } from "@/components/KPIGrid";
import { RevenueMomentum } from "@/components/RevenueMomentum";
import { ProfitabilityTrend } from "@/components/ProfitabilityTrend";
import { RevenueMix } from "@/components/RevenueMix";
import { CampTypePerformance } from "@/components/CampTypePerformance";
import { PartnerPerformance } from "@/components/PartnerPerformance";
import { PartnerConcentration } from "@/components/PartnerConcentration";
import { LeadershipInsights } from "@/components/LeadershipInsights";
import { LeadershipAttention } from "@/components/LeadershipAttention";
import { DeepInsights } from "@/components/DeepInsights";
import { DataUploadModal } from "@/components/DataUploadModal";
import { SNAPSHOT_ID } from "@/lib/export";
import { DATE_PRESETS } from "@/lib/calculations";
import { formatDate } from "@/lib/formatting";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Camps Performance — Leadership Command Centre" },
      {
        name: "description",
        content:
          "Executive cockpit for camps: revenue, gross margin, GM per patient, partner performance and leadership actions in one view.",
      },
      { property: "og:title", content: "Camps Performance — Leadership Command Centre" },
      {
        property: "og:description",
        content: "Camp growth, revenue and profitability for CEO and Business Head reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

function Dashboard() {
  const { loading, loadError, dataset, narrative, filters, range } = useDashboard();
  const [uploadOpen, setUploadOpen] = useState(false);
  const presetLabel = DATE_PRESETS.find((p) => p.id === filters.preset)?.label ?? "Custom";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onUpdateData={() => setUploadOpen(true)} />

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {loading && !dataset ? (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm">Loading camps data…</p>
          </div>
        ) : loadError && !dataset ? (
          <div className="card-surface mx-auto mt-12 max-w-md p-6 text-center">
            <h2 className="text-base font-semibold text-foreground">Data could not be loaded</h2>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          </div>
        ) : (
          <div id={SNAPSHOT_ID} className="space-y-12">
            <section className="card-surface relative overflow-hidden p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_70%)] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-success)_22%,transparent),transparent_70%)] blur-2xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">Executive summary</p>
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                    {presetLabel}
                  </span>
                  <span className="num text-[11px] font-bold text-muted-foreground">
                    {formatDate(range.from)} → {formatDate(range.to)}
                  </span>
                </div>
              </div>
              <p className="relative mt-3 max-w-4xl text-lg font-bold leading-relaxed tracking-tight text-foreground sm:text-2xl">
                {narrative}
              </p>

            </section>

            <KPIGrid />


            <div className="grid gap-6 xl:grid-cols-2">
              <RevenueMomentum />
              <ProfitabilityTrend />
            </div>

            <RevenueMix />
            <CampTypePerformance />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <PartnerPerformance />
              <PartnerConcentration />
            </div>

            <LeadershipInsights />
            <DeepInsights />
            <LeadershipAttention />
          </div>
        )}
      </main>

      <DataUploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
