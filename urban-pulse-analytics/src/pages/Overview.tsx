import { useMemo, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { SortableTable } from "@/components/analytics/SortableTable";
import { InsightChip } from "@/components/analytics/InsightChip";
import { WorldMap } from "@/components/ui/WorldMap";
import { useFilters } from "@/contexts/FilterContext";
import { api } from "@/lib/api";
import { MapCity } from "@/types/analytics";
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, Award } from "lucide-react";

export default function Overview() {
  const { filteredCities, sortBy, setSortBy } = useFilters();
  const [mapCities, setMapCities] = useState<MapCity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await api.getMapCities();
        setMapCities(data);
      } catch (err) {
        console.error("Failed to load map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const kpis = useMemo(() => {
    if (filteredCities.length === 0) {
      return { avgQoL: 0, bestCity: "—", mostAffordable: "—", highestStress: "—" };
    }

    const avgQoL = Math.round(filteredCities.reduce((sum, c) => sum + c.qolIndex, 0) / filteredCities.length * 10) / 10;
    const bestCity = [...filteredCities].sort((a, b) => b.qolIndex - a.qolIndex)[0]?.name || "—";
    const mostAffordable = [...filteredCities].sort((a, b) => a.costOfLiving - b.costOfLiving)[0]?.name || "—";
    const highestStress = [...filteredCities].sort((a, b) => b.rentIndex - a.rentIndex)[0]?.name || "—";

    return { avgQoL, bestCity, mostAffordable, highestStress };
  }, [filteredCities]);

  const bottom5 = useMemo(() => [...filteredCities].reverse().slice(0, 5), [filteredCities]);

  const tableColumns = [
    { key: "name", label: "City", align: "left" as const },
    { key: "qolIndex", label: "QoL Index", align: "right" as const },
    { key: "change", label: "YoY", align: "right" as const, format: (v: number) => `${v}%` },
    { key: "avgSalary", label: "Salary", align: "right" as const, format: (v: number) => `$${(v / 1000).toFixed(1)}K` },
    { key: "rentIndex", label: "Rent Idx", align: "right" as const },
    { key: "transportScore", label: "Transport", align: "right" as const },
  ];

  if (loading) {
    return <DashboardLayout title="Executive Analytics Dashboard" subtitle="Loading data..."><div className="p-8 text-center">Loading overview...</div></DashboardLayout>;
  }

  // Debug Footer
  const debugInfo = (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 flex justify-between px-4">
      <span>API: {import.meta.env.VITE_API_URL || "default"}</span>
      <span>Cities: {filteredCities.length} (Filter) / {useFilters().cities?.length || 0} (Total)</span>
      <span>Maps: {mapCities.length}</span>
      {useFilters().error && <span className="text-red-400">Error: {useFilters().error}</span>}
    </div>
  );

  return (
    <DashboardLayout title="Executive Analytics Dashboard" subtitle="City Quality of Life Overview">
      <GlobalFilters />

      {useFilters().error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
          <h3 className="font-bold">Backend Connection Failed</h3>
          <p>{useFilters().error}</p>
          <p className="text-sm mt-1 opacity-80">Ensure backend is running on port 8000.</p>
        </div>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MiniKPI
          label="Avg QoL Index"
          value={kpis.avgQoL}
          icon={BarChart3}
          change={1.8}
          size="lg"
          onClick={() => setSortBy("qolIndex")}
          active={sortBy === "qolIndex"}
        />
        <MiniKPI
          label="Top Ranked"
          value={kpis.bestCity}
          icon={Award}
          trend="up"
          size="lg"
        />
        <MiniKPI
          label="Most Affordable"
          value={kpis.mostAffordable}
          icon={DollarSign}
          trend="up"
          size="lg"
          onClick={() => setSortBy("costOfLiving")}
          active={sortBy === "costOfLiving"}
        />
        <MiniKPI
          label="Highest Rent Burden"
          value={kpis.highestStress}
          icon={AlertTriangle}
          trend="down"
          size="lg"
          onClick={() => setSortBy("rentIndex")}
          active={sortBy === "rentIndex"}
        />
      </div>

      {/* Dynamic Insight Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <InsightChip text={`${filteredCities.length} cities in current filter`} type="info" />
        <InsightChip text={`${kpis.bestCity} leads with ${filteredCities[0]?.qolIndex || 0} QoL`} type="positive" />

        {filteredCities.length > 0 && filteredCities.filter((c) => c.change < 0).length > 0 && (
          <InsightChip text={`${filteredCities.filter((c) => c.change < 0).length} cities declining YoY`} type="warning" />
        )}
        <InsightChip text="European cities avg 12% higher QoL" type="highlight" />
      </div>

      {/* Map + Rankings */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* World Map */}
        <div className="lg:col-span-2">
          <WorldMap cities={mapCities} />
        </div>

        {/* Quick Rankings */}
        <div className="space-y-4">
          <div className="analytics-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <h4 className="text-sm font-semibold text-foreground">Top 5 Rising</h4>
            </div>
            <div className="space-y-2">
              {filteredCities
                .filter((c) => c.change > 0)
                .slice(0, 5)
                .map((city, idx) => (
                  <div key={city.name} className="flex items-center justify-between p-2 bg-success/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-success">{idx + 1}</span>
                      <span className="text-sm font-medium">{city.name}</span>
                    </div>
                    <span className="text-xs font-mono text-success">+{city.change}%</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="analytics-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-semibold text-foreground">Bottom 5</h4>
            </div>
            <div className="space-y-2">
              {bottom5.map((city, idx) => (
                <div key={city.name} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{filteredCities.length - idx}</span>
                    <span className="text-sm font-medium">{city.name}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{city.qolIndex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Data Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">All Cities (Sortable)</h3>
          <span className="text-xs text-muted-foreground">Click headers to sort</span>
        </div>
        <SortableTable columns={tableColumns} data={filteredCities} maxHeight="450px" />
      </div>

      {debugInfo}
    </DashboardLayout>
  );
}
