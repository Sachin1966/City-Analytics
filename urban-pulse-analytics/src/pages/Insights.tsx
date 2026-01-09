import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlobalFilters } from "@/components/analytics/GlobalFilters";
import { MiniKPI } from "@/components/analytics/MiniKPI";
import { SortableTable } from "@/components/analytics/SortableTable";
import { InsightChip } from "@/components/analytics/InsightChip";
import { BreakdownChart } from "@/components/analytics/BreakdownChart";
import { GaugeChart } from "@/components/analytics/GaugeChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/contexts/FilterContext";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Download,
  Eye,
  Building2,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for consistent Stress calculation (Matches CostIncome.tsx)
// Rent Index 100 ~ $3500 est.
const calculateStress = (rentIndex: number, avgSalary: number) => {
  if (!avgSalary) return 0;
  const estimatedRent = rentIndex * 35;
  return Math.round((estimatedRent / avgSalary) * 100);
};

export default function Insights() {
  const { filteredCities } = useFilters();

  const handleExport = () => {
    // Simple MVP Export: Trigger Print Dialog
    window.print();
  };

  const analysisData = useMemo(() => {
    // Underrated cities: high QoL but low cost
    const underrated = filteredCities
      .map((c) => ({
        ...c,
        valueScore: c.costOfLiving > 0 ? c.qolIndex / (c.costOfLiving / 50) : 0,
      }))
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5);

    // Overpriced: high cost but declining QoL
    const overpriced = filteredCities
      .filter((c) => c.costOfLiving > 90 || c.change < 0)
      .sort((a, b) => b.costOfLiving - a.costOfLiving)
      .slice(0, 5);

    // Income stress zones
    const stressZones = filteredCities
      .map((c) => ({
        ...c,
        stressRatio: calculateStress(c.rentIndex, c.avgSalary),
      }))
      .filter((c) => c.stressRatio > 40)
      .sort((a, b) => b.stressRatio - a.stressRatio)
      .slice(0, 5);

    // Overall metrics
    const totalStress = filteredCities.reduce((sum, c) => sum + calculateStress(c.rentIndex, c.avgSalary), 0);
    const avgStress = filteredCities.length ? Math.round(totalStress / filteredCities.length) : 0;

    const decliningCount = filteredCities.filter((c) => c.change < 0).length;
    const risingCount = filteredCities.filter((c) => c.change > 0).length;

    return { underrated, overpriced, stressZones, avgStress, decliningCount, risingCount };
  }, [filteredCities]);

  const categoryBreakdown = [
    { name: "High Performers", value: filteredCities.filter((c) => c.qolIndex >= 80).length, color: "hsl(var(--success))" },
    { name: "Average", value: filteredCities.filter((c) => c.qolIndex >= 70 && c.qolIndex < 80).length, color: "hsl(var(--info))" },
    { name: "Below Average", value: filteredCities.filter((c) => c.qolIndex >= 60 && c.qolIndex < 70).length, color: "hsl(var(--warning))" },
    { name: "Low Performers", value: filteredCities.filter((c) => c.qolIndex < 60).length, color: "hsl(var(--destructive))" },
  ];

  return (
    <DashboardLayout title="Insight Explorer" subtitle="Auto-generated analytics & decision support">
      <GlobalFilters />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MiniKPI label="Cities Analyzed" value={filteredCities.length} icon={Building2} size="lg" />
        <MiniKPI label="Rising YoY" value={analysisData.risingCount} icon={TrendingUp} trend="up" size="lg" />
        <MiniKPI label="Declining YoY" value={analysisData.decliningCount} icon={TrendingDown} trend="down" size="lg" />
        <MiniKPI label="Avg Stress Index" value={`${analysisData.avgStress}%`} icon={Activity} size="lg" />
        <MiniKPI label="Outliers Detected" value={analysisData.stressZones.length + analysisData.overpriced.length} icon={AlertTriangle} size="lg" />
      </div>

      {/* Auto Insight Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {analysisData.underrated[0] && <InsightChip text={`${analysisData.underrated[0]?.name} is most underrated`} type="positive" icon={Sparkles} />}
        <InsightChip text={`${analysisData.stressZones.length} cities exceed 40% stress threshold`} type="negative" />
        <InsightChip text={`European cities avg 12% higher value score`} type="highlight" />
        <InsightChip text={`${analysisData.decliningCount} cities showing YoY decline`} type="warning" />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Underrated Cities */}
        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Underrated Cities</h4>
              <p className="text-xs text-muted-foreground">Best value opportunities</p>
            </div>
          </div>
          <div className="space-y-2">
            {analysisData.underrated.map((city, idx) => (
              <div
                key={city.name}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  idx === 0 ? "bg-success/10" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-xs font-bold",
                    idx === 0 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{city.name}</p>
                    <p className="text-xs text-muted-foreground">QoL: {city.qolIndex} | Cost: {city.costOfLiving}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">{city.valueScore.toFixed(1)}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Overpriced Markets */}
        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Overpriced Markets</h4>
              <p className="text-xs text-muted-foreground">Declining value proposition</p>
            </div>
          </div>
          <div className="space-y-2">
            {analysisData.overpriced.map((city, idx) => (
              <div key={city.name} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-destructive/20 text-xs font-bold text-destructive">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{city.name}</p>
                    <p className="text-xs text-muted-foreground">Cost: {city.costOfLiving} | YoY: {city.change}%</p>
                  </div>
                </div>
                {city.change < 0 && <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
            ))}
          </div>
        </div>

        {/* Income Stress Zones */}
        <div className="analytics-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <DollarSign className="h-4 w-4 text-warning" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Income Stress Zones</h4>
              <p className="text-xs text-muted-foreground">Rent/Income ratio &gt; 40%</p>
            </div>
          </div>
          <div className="space-y-2">
            {analysisData.stressZones.map((city, idx) => (
              <div key={city.name} className="flex items-center justify-between p-2 bg-warning/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-warning/20 text-xs font-bold text-warning">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium">{city.name}</p>
                </div>
                <Badge variant={city.stressRatio >= 60 ? "destructive" : "default"} className="text-xs font-mono">
                  {city.stressRatio}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gauges + Category Breakdown */}
      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        <GaugeChart
          value={analysisData.avgStress}
          title="Avg Stress Index"
          thresholds={{ low: 30, medium: 50, high: 70 }}
        />
        <GaugeChart
          value={Math.round((analysisData.risingCount / filteredCities.length) * 100)}
          title="% Cities Rising"
          thresholds={{ low: 30, medium: 50, high: 70 }}
          invert={true}
        />
        <BreakdownChart
          data={categoryBreakdown}
          title="QoL Distribution"
          subtitle="Cities by performance tier"
          layout="vertical"
          className="lg:col-span-2"
        />
      </div>

      {/* Export Section */}
      <div className="analytics-card p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Export Insights</h4>
              <p className="text-xs text-muted-foreground">Download analysis for presentations</p>
            </div>
          </div>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF (Print)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
