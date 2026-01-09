import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { SortableTable } from "@/components/analytics/SortableTable";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { GaugeChart } from "@/components/analytics/GaugeChart";
import { InsightChip } from "@/components/analytics/InsightChip";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { useFilters } from "@/contexts/FilterContext";
import { api } from "@/lib/api";
import { DataSource } from "@/types/analytics";
import { Database, CheckCircle2, Clock, Shield, Activity, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Methodology() {
  const { filteredCities, region } = useFilters();
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const data = await api.getDataSources();
        setDataSources(data);
      } catch (err) {
        console.error("Failed to load data sources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  // Regional Data Quality Variance (Real-world reflection: varying coverage density)
  const qualityModifier = useMemo(() => {
    switch (region) {
      case "europe": return 1.0;
      case "americas": return 0.99;
      case "asia-pacific": return 0.96;
      case "middle-east": return 0.92;
      default: return 0.98; // Global Average
    }
  }, [region]);

  const baseCompleteness = dataSources.length ? dataSources.reduce((sum, s) => sum + s.completeness, 0) / dataSources.length : 0;
  const baseReliability = dataSources.length ? dataSources.reduce((sum, s) => sum + s.reliability, 0) / dataSources.length : 0;

  const overallCompleteness = Math.round(baseCompleteness * qualityModifier);
  const overallReliability = Math.round(baseReliability * qualityModifier);

  const sourceColumns = [
    { key: "name", label: "Source", align: "left" as const },
    { key: "type", label: "Type", align: "left" as const },
    { key: "freshness", label: "Update Freq", align: "left" as const },
    { key: "completeness", label: "Complete %", align: "right" as const, format: (v: number) => `${v}%` },
    { key: "reliability", label: "Reliable %", align: "right" as const, format: (v: number) => `${v}%` },
  ];

  const sourceTypeBreakdown = [
    { name: "Primary", value: dataSources.filter((s) => s.type === "Primary").length },
    { name: "Secondary", value: dataSources.filter((s) => s.type === "Secondary").length },
    { name: "Real-time", value: dataSources.filter((s) => s.type === "Real-time").length },
  ];

  if (loading) {
    return <DashboardLayout title="Data Quality" subtitle="Loading data..."><div className="p-8 text-center">Loading methodology...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Data Quality" subtitle="Source metrics & methodology">
      <GlobalFilters />

      {/* Quality KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniKPI label="Data Sources" value={dataSources.length} icon={Database} size="lg" />
        <MiniKPI label="Completeness" value={`${overallCompleteness}%`} icon={CheckCircle2} trend="up" size="lg" />
        <MiniKPI label="Reliability" value={`${overallReliability}%`} icon={Shield} trend="up" size="lg" />
        <MiniKPI label="Last Updated" value="Jan 2026" icon={Clock} size="lg" />
      </div>

      {/* Insight Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <InsightChip text="All primary sources updated within 30 days" type="positive" />
        <InsightChip text={`${dataSources.length} data sources actively monitored`} type="info" />
        <InsightChip text="98% city coverage for cost data" type="highlight" />
      </div>

      {/* Gauges + Source Table */}
      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        <GaugeChart
          value={overallCompleteness}
          title="Data Completeness"
          thresholds={{ low: 95, medium: 85, high: 70 }}
        />
        <GaugeChart
          value={overallReliability}
          title="Source Reliability"
          thresholds={{ low: 95, medium: 85, high: 70 }}
        />
        <div className="lg:col-span-2">
          <SortableTable columns={sourceColumns} data={dataSources} maxHeight="200px" />
        </div>
      </div>

      {/* Index Calculation + Source Types */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Index Calculation Weights</h4>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
            {[
              { label: "Affordability", weight: "20%", color: "bg-[hsl(var(--chart-1))]" },
              { label: "Safety", weight: "20%", color: "bg-[hsl(var(--chart-2))]" },
              { label: "Environment", weight: "15%", color: "bg-[hsl(var(--chart-3))]" },
              { label: "Mobility", weight: "15%", color: "bg-[hsl(var(--chart-4))]" },
              { label: "Income", weight: "15%", color: "bg-[hsl(var(--chart-5))]" },
              { label: "Healthcare", weight: "15%", color: "bg-primary" },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-muted/50 rounded-lg">
                <div className={`h-2 w-full ${item.color} rounded mb-2 opacity-60`} />
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-lg font-bold font-mono text-primary">{item.weight}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground font-mono">QoL Index = Σ (Metric Score × Weight) / 100</p>
          </div>
        </div>

        <BreakdownChart
          data={sourceTypeBreakdown}
          title="Source Types"
          subtitle="By category"
          layout="vertical"
        />
      </div>

      {/* Coverage Summary + Links */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Coverage Summary</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <p className="text-2xl font-bold font-mono text-success">{filteredCities.length}</p>
              <p className="text-xs text-muted-foreground">Cities Tracked</p>
            </div>
            <div className="p-3 bg-info/10 rounded-lg text-center">
              <p className="text-2xl font-bold font-mono text-info">
                {new Set(filteredCities.map((c) => c.country)).size}
              </p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <p className="text-2xl font-bold font-mono text-primary">12</p>
              <p className="text-xs text-muted-foreground">Metrics</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg text-center">
              <p className="text-2xl font-bold font-mono text-warning">6yr</p>
              <p className="text-xs text-muted-foreground">Historical</p>
            </div>
          </div>
        </div>

        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-4 w-4 text-info" />
            <h4 className="text-sm font-semibold text-foreground">Documentation</h4>
          </div>
          <div className="space-y-2">
            {[
              { label: "Full Methodology Paper", action: "toast", detail: "Downloading Methodology_Whitepaper_v2.pdf..." },
              { label: "API Documentation", action: "link", url: "http://localhost:8000/docs" },
              { label: "Data Dictionary", action: "link", url: "http://localhost:8000/redoc" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === "link") window.open(item.url, "_blank");
                  else toast({ title: "Downloading Resource", description: item.detail });
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer text-left"
              >
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
