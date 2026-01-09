import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { RadarChart } from "@/components/charts/RadarChart";
import { ScatterPlotChart } from "@/components/charts/ScatterPlotChart";
import { MetricComparison } from "@/components/ui/MetricComparison";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { RankingShift } from "@/components/analytics/RankingShift";
import { InsightChip } from "@/components/analytics/InsightChip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { api } from "@/lib/api";
import { ScatterSeries } from "@/types/analytics";

export default function Comparison() {
  const { filteredCities, selectedCities, setSelectedCities } = useFilters();
  const [scatterData, setScatterData] = useState<ScatterSeries[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize with defaults if empty on mount
  useEffect(() => {
    if (selectedCities.length === 0) {
      setSelectedCities(["Zurich", "Copenhagen", "Vienna"]);
    }
  }, []);

  useEffect(() => {
    const fetchScatter = async () => {
      try {
        setLoading(true);
        const data = await api.getScatterData();
        setScatterData(data);
      } catch (err) {
        console.error("Failed to load scatter data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScatter();
  }, []);

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter((c) => c !== city));
      }
    } else if (selectedCities.length < 4) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const selectedCityData = useMemo(
    () => (filteredCities || []).filter((c) => selectedCities.includes(c.name)),
    [filteredCities, selectedCities]
  );

  const chartCities = selectedCities.map((name, index) => ({
    name,
    color: `hsl(var(--chart-${index + 1}))`,
  }));

  const radarData = useMemo(() => {
    return [
      { metric: "Affordability", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(100 - (c.costOfLiving || 0) * 0.5)])) },
      { metric: "Safety", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(100 - (c.crimeIndex || 0))])) },
      { metric: "Environment", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(100 - (c.pollutionIndex || 0))])) },
      { metric: "Mobility", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(c.transportScore || 0)])) },
      { metric: "Income", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(Math.min(100, (c.avgSalary || 0) / 85))])) },
      { metric: "Healthcare", ...Object.fromEntries(selectedCityData.map((c) => [c.name, Math.round(c.healthcareScore || 0)])) },
    ];
  }, [selectedCityData]);

  const winner = useMemo(() => {
    if (selectedCityData.length === 0) return null;
    return selectedCityData.reduce((best, city) => ((city.qolIndex || 0) > (best.qolIndex || 0) ? city : best));
  }, [selectedCityData]);

  const insights = useMemo(() => {
    if (selectedCityData.length < 2) return [];
    const sorted = [...selectedCityData].sort((a, b) => (b.qolIndex || 0) - (a.qolIndex || 0));
    const cheapest = [...selectedCityData].sort((a, b) => (a.costOfLiving || 0) - (b.costOfLiving || 0))[0];
    const safest = [...selectedCityData].sort((a, b) => (a.crimeIndex || 0) - (b.crimeIndex || 0))[0];
    const bestTransport = [...selectedCityData].sort((a, b) => (b.transportScore || 0) - (a.transportScore || 0))[0];

    return [
      { text: `${sorted[0]?.name || "N/A"} leads overall with QoL ${sorted[0]?.qolIndex?.toFixed(1) || "-"}`, type: "positive" as const },
      { text: `${cheapest?.name || "N/A"} is most affordable (Cost: ${cheapest?.costOfLiving?.toFixed(1) || "-"})`, type: "highlight" as const },
      { text: `${safest?.name || "N/A"} is safest (Crime: ${safest?.crimeIndex?.toFixed(1) || "-"})`, type: "info" as const },
      { text: `${bestTransport?.name || "N/A"} best mobility (${bestTransport?.transportScore?.toFixed(1) || "-"})`, type: "info" as const },
    ];
  }, [selectedCityData]);

  const displayScatterData = useMemo(() => {
    const cleanScatter = (scatterData || []);
    // Show selected cities as a distinct series
    const selectedSeries: ScatterSeries = {
      name: "Selected",
      color: "hsl(var(--chart-1))",
      data: cleanScatter.flatMap(s => s.data || []).filter(p => selectedCities.includes(p.name))
    };

    // Show a subset of others for context
    const contextSeries: ScatterSeries = {
      name: "Global Context",
      color: "hsl(var(--muted))",
      data: cleanScatter.flatMap(s => s.data || [])
        .filter(p => !selectedCities.includes(p.name))
        .slice(0, 50)
        .map(p => ({ ...p, z: 100 }))
    };

    return [selectedSeries, contextSeries];
  }, [scatterData, selectedCities]);

  if (loading) {
    return <DashboardLayout title="City Comparison Analytics" subtitle="Loading data..."><div className="p-8 text-center">Loading comparison...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="City Comparison Analytics" subtitle="Multi-city head-to-head analysis">
      <GlobalFilters />

      {/* City Selector */}
      <div className="analytics-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comparing</span>
            {selectedCities.map((city, index) => (
              <Badge
                key={city}
                variant="secondary"
                className="flex items-center gap-1 pl-2"
                style={{ borderLeftColor: `hsl(var(--chart-${index + 1}))`, borderLeftWidth: 3 }}
              >
                {city}
                <button onClick={() => toggleCity(city)} className="ml-1 hover:text-destructive p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{selectedCities.length}/4 selected</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(filteredCities || []).slice(0, 50).map((city) => (
            <Button
              key={city.name}
              variant={selectedCities.includes(city.name) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCity(city.name)}
              disabled={!selectedCities.includes(city.name) && selectedCities.length >= 4}
              className="h-7 text-xs"
            >
              {!selectedCities.includes(city.name) && <Plus className="h-3 w-3 mr-1" />}
              {city.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Dynamic Insights */}
      <div className="flex flex-wrap gap-2 mb-6">
        {insights.map((insight, idx) => (
          <InsightChip key={idx} text={insight.text} type={insight.type} />
        ))}
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniKPI label="Leader" value={winner?.name || "—"} trend="up" size="lg" />
        <MiniKPI label="Avg QoL (Selected)" value={Math.round(selectedCityData.reduce((s, c) => s + (c.qolIndex || 0), 0) / (selectedCityData.length || 1))} size="lg" />
        <MiniKPI
          label="Salary Spread"
          value={selectedCityData.length ? `$${(Math.max(...selectedCityData.map((c) => c.avgSalary || 0)) - Math.min(...selectedCityData.map((c) => c.avgSalary || 0))).toFixed(0)}` : "-"}
          size="lg"
        />
        <MiniKPI
          label="Cost Range"
          value={selectedCityData.length ? `${Math.min(...selectedCityData.map((c) => c.costOfLiving || 0)).toFixed(1)} - ${Math.max(...selectedCityData.map((c) => c.costOfLiving || 0)).toFixed(1)}` : "-"}
          size="lg"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <RadarChart data={radarData} cities={chartCities} title="Multi-Dimension Comparison" />
        <ScatterPlotChart
          data={displayScatterData}
          title="Salary vs Rent Index"
          xAxisLabel="Average Monthly Salary ($)"
          yAxisLabel="Rent Index"
        />
      </div>

      {/* Metric Comparisons */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricComparison
          label="Cost of Living Index"
          cities={selectedCityData.map((c) => ({ name: c.name, value: c.costOfLiving?.toFixed(1) || "0" }))}
          higherIsBetter={false}
        />
        <MetricComparison
          label="Average Monthly Salary"
          cities={selectedCityData.map((c) => ({ name: c.name, value: Math.round(c.avgSalary || 0) }))}
          unit="$"
          higherIsBetter={true}
        />
        <MetricComparison
          label="Rent Index"
          cities={selectedCityData.map((c) => ({ name: c.name, value: c.rentIndex?.toFixed(1) || "0" }))}
          higherIsBetter={false}
        />
        <MetricComparison
          label="Pollution Index"
          cities={selectedCityData.map((c) => ({ name: c.name, value: c.pollutionIndex?.toFixed(1) || "0" }))}
          higherIsBetter={false}
        />
        <MetricComparison
          label="Crime Index"
          cities={selectedCityData.map((c) => ({ name: c.name, value: c.crimeIndex?.toFixed(1) || "0" }))}
          higherIsBetter={false}
        />
        <MetricComparison
          label="Transport Score"
          cities={selectedCityData.map((c) => ({ name: c.name, value: c.transportScore?.toFixed(1) || "0" }))}
          higherIsBetter={true}
        />
      </div>

      {/* Ranking Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RankingShift
          data={selectedCityData.map((c, idx) => ({
            name: c.name,
            currentRank: idx + 1,
            previousRank: c.rank,
            score: c.qolIndex || 0,
          }))}
          title="Selected Cities Ranking (by QoL)"
        />
        <RankingShift
          data={[...selectedCityData]
            .sort((a, b) => (a.costOfLiving || 0) - (b.costOfLiving || 0))
            .map((c, idx) => ({
              name: c.name,
              currentRank: idx + 1,
              previousRank: [...selectedCityData].sort((a, b) => (b.avgSalary || 0) - (a.avgSalary || 0)).findIndex((x) => x.name === c.name) + 1,
              score: c.costOfLiving || 0,
            }))}
          title="Affordability Ranking (Cost Index)"
        />
      </div>
    </DashboardLayout>
  );
}
