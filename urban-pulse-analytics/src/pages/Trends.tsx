import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart"; // New Bar Chart
import { CorrelationHeatmap } from "@/components/charts/CorrelationHeatmap";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "@/contexts/FilterContext";
import { api } from "@/lib/api";
import { CorrelationData } from "@/types/analytics";
import { TrendingUp, TrendingDown, Activity, BarChart2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for Region Mapping (Addressing "Missing Middle East" issue)
function getRegion(country: string): string {
  if (!country) return "Other";
  const c = country.toLowerCase().trim();
  if (["united arab emirates", "uae", "saudi arabia", "qatar", "kuwait", "bahrain", "oman", "israel", "jordan", "lebanon", "turkey", "egypt"].some(x => c.includes(x))) return "Middle East";
  if (["united states", "usa", "canada", "mexico", "brazil", "argentina", "chile", "peru", "colombia"].some(x => c.includes(x))) return "Americas";
  if (["china", "japan", "india", "singapore", "thailand", "vietnam", "indonesia", "malaysia", "south korea", "australia", "new zealand"].some(x => c.includes(x))) return "Asia-Pacific";
  if (["uk", "united kingdom", "germany", "france", "italy", "spain", "switzerland", "netherlands", "sweden", "norway", "denmark", "austria", "belgium", "ireland", "poland", "czech republic", "portugal", "greece", "russia"].some(x => c.includes(x))) return "Europe";
  return "Other";
}

export default function Trends() {
  const { filteredCities, year } = useFilters();
  const [rollingAvg, setRollingAvg] = useState<"none" | "3yr" | "5yr">("none");
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const rawData: any = await api.getCorrelationData();

        // Transform Backend Data (Nested Dict) to Frontend Component Data (Matrix)
        if (rawData && !rawData.metrics && typeof rawData === 'object') {
          const keys = Object.keys(rawData);
          const values = keys.map(rowKey => keys.map(colKey => rawData[colKey]?.[rowKey] || 0));

          setCorrelationData({
            metrics: keys,
            values: values
          });
        } else {
          // Fallback if data is already formatted or empty
          setCorrelationData(rawData);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  // 1. DYNAMIC TRENDS (Backcasting for Bar Chart)
  // Format: [{ name: "City", "2024": val, "2025": val, ... }]
  const barChartData = useMemo(() => {
    if (!filteredCities.length) return [];

    return [...filteredCities]
      .sort((a, b) => b.qolIndex - a.qolIndex)
      .slice(0, 5)
      .map(city => {
        const current = city.qolIndex;
        // Approximation: Assume constant YoY change for backcasting
        const changeFactor = 1 + ((city.change || 0) / 100);

        const getHistory = (yearsBack: number) => {
          if (Math.abs(changeFactor) < 0.01) return current; // Avoid divide by zero
          return current / Math.pow(changeFactor, yearsBack);
        };

        const dataPoint: any = { name: city.name, "2025": Math.round(current * 10) / 10 };

        // Always calculate 2024 (Last Year)
        dataPoint["2024"] = Math.round(getHistory(1) * 10) / 10;

        if (rollingAvg === "3yr" || rollingAvg === "5yr") {
          dataPoint["2023"] = Math.round(getHistory(2) * 10) / 10;
        }
        if (rollingAvg === "5yr") {
          dataPoint["2022"] = Math.round(getHistory(3) * 10) / 10;
          dataPoint["2021"] = Math.round(getHistory(4) * 10) / 10;
        }

        return dataPoint;
      });
  }, [filteredCities, rollingAvg]);

  // Keys for the Chart
  const chartKeys = useMemo(() => {
    const base = [
      { key: "2024", name: "2024", color: "hsl(var(--muted-foreground))" },
      { key: "2025", name: "2025 (Live)", color: "hsl(var(--primary))" }
    ];
    if (rollingAvg === "3yr" || rollingAvg === "5yr") {
      base.unshift({ key: "2023", name: "2023", color: "hsl(var(--chart-2))" });
    }
    if (rollingAvg === "5yr") {
      base.unshift({ key: "2022", name: "2022", color: "hsl(var(--chart-3))" });
      base.unshift({ key: "2021", name: "2021", color: "hsl(var(--chart-4))" });
    }
    return base;
  }, [rollingAvg]);

  // 2. DYNAMIC REGIONS (Explicit Mapping)
  const regionComparison = useMemo(() => {
    const regionMap = new Map<string, { sum: number, count: number }>();

    filteredCities.forEach(city => {
      const region = getRegion(city.country);
      if (!regionMap.has(region)) regionMap.set(region, { sum: 0, count: 0 });
      const entry = regionMap.get(region)!;
      entry.sum += city.qolIndex;
      entry.count += 1;
    });

    return Array.from(regionMap.entries())
      .map(([name, stats]) => ({ name, value: Math.round(stats.sum / stats.count) }))
      .sort((a, b) => b.value - a.value);

  }, [filteredCities]);

  // KPIs
  const trendMetrics = useMemo(() => {
    if (!filteredCities.length) return { avgGrowth: 0, topGainer: "—", topGainerChange: 0, topLoser: "—", topLoserChange: 0 };
    const totalChange = filteredCities.reduce((sum, c) => sum + (c.change || 0), 0);
    const sorted = [...filteredCities].sort((a, b) => (b.change || 0) - (a.change || 0));
    return {
      avgGrowth: Math.round((totalChange / filteredCities.length) * 10) / 10,
      topGainer: sorted[0]?.name || "—",
      topGainerChange: sorted[0]?.change || 0,
      topLoser: sorted[sorted.length - 1]?.name || "—",
      topLoserChange: sorted[sorted.length - 1]?.change || 0
    };
  }, [filteredCities]);

  if (loading) return <DashboardLayout title="Trend & Correlation Dashboard" subtitle="Loading..."><div className="p-8 text-center">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Trends & Correlations" subtitle="Historical patterns & metric relationships">
      <GlobalFilters />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MiniKPI label="Avg YoY Growth" value={`${trendMetrics.avgGrowth > 0 ? "+" : ""}${trendMetrics.avgGrowth}%`} icon={TrendingUp} trend={trendMetrics.avgGrowth >= 0 ? "up" : "down"} size="lg" />
        <MiniKPI label="Top Gainer" value={trendMetrics.topGainer} change={trendMetrics.topGainerChange} size="lg" />
        <MiniKPI label="Top Decliner" value={trendMetrics.topLoser} change={trendMetrics.topLoserChange} size="lg" />
        <MiniKPI label="Avg Cost of Living" value={Math.round(filteredCities.reduce((acc, c) => acc + c.costOfLiving, 0) / (filteredCities.length || 1))} icon={Activity} size="lg" />
        <MiniKPI label="Cities Tracked" value={filteredCities.length} icon={BarChart2} size="lg" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Rolling Avg:</span>
          {(["none", "3yr", "5yr"] as const).map((opt) => (
            <Button key={opt} variant={rollingAvg === opt ? "default" : "outline"} size="sm" onClick={() => setRollingAvg(opt)} className="h-6 text-xs px-2">{opt === "none" ? "None" : opt.toUpperCase()}</Button>
          ))}
        </div>
        <div className="flex-1" />
        <Badge variant="secondary" className="text-xs">Live 2025 vs Backcast 2024</Badge>
      </div>

      {/* NEW BAR CHART */}
      <div className="grid lg:grid-cols-1 gap-6 mb-6">
        {barChartData.length > 0 ? (
          <SimpleBarChart
            data={barChartData}
            title={`Quality of Life Momentum: ${rollingAvg === 'none' ? '2024 vs 2025' : rollingAvg === '3yr' ? '3-Year History' : '5-Year History'} (Top 5 Cities)`}
            xKey="name"
            barKeys={chartKeys}
            yAxisLabel="QoL Index"
          />
        ) : (
          <div className="p-8 border border-dashed rounded text-center text-muted-foreground">No city data available</div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {correlationData ? <CorrelationHeatmap data={correlationData} title="Metric Correlation Matrix (Real-Time)" /> : <div className="h-[300px] flex items-center justify-center border border-dashed text-muted-foreground">Loading Correlations...</div>}
        </div>

        {/* UPDATED REGION BREAKDOWN with Explicit Middle East Support */}
        <BreakdownChart
          data={regionComparison}
          title="Avg QoL by Region"
          subtitle="Aggregated from Live Data"
          layout="vertical"
        />
      </div>

      <div className="analytics-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Year-over-Year QoL Shifts</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {filteredCities.map((city) => (
            <div key={city.name} className={cn("p-3 rounded-lg text-center", (city.change || 0) >= 0 ? "bg-success/10" : "bg-destructive/10")}>
              <p className="text-xs font-medium text-foreground truncate">{city.name}</p>
              <p className={cn("text-lg font-bold font-mono", (city.change || 0) >= 0 ? "text-success" : "text-destructive")}>{(city.change || 0) > 0 ? "+" : ""}{city.change}%</p>
              {(city.change || 0) >= 0 ? <TrendingUp className="h-3 w-3 mx-auto text-success" /> : <TrendingDown className="h-3 w-3 mx-auto text-destructive" />}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
